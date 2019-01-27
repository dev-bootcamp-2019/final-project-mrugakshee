const Tournament = artifacts.require('Tournament');
const TrivialGame = artifacts.require('TrivialGame');

contract('Tournament', accounts => {
    beforeEach(async () => {
        contractInstance = await Tournament.new();
        await Tournament.deployed();
        registrationFee = await contractInstance.registrationFee();
        maxPlayers = await contractInstance.maxPlayers();
    });

    /*
     * This test ensures that the register function is working correctly
     * @tests - The register function
     *  - The first element in the registrants array needs to be equal to the account that registered
     *  - The totalMoneyCollected needs to be equal to the registration fee
     *  - The numberOfPlayers needs to be equal to one
     */
    it('Can register a player on the contract', async () => {
        // Register account[1]
        await contractInstance.register({ from: accounts[1], value: registrationFee });

        // Get the totalMoneyCollected by the contract
        const totalMoneyCollected = await contractInstance.totalMoneyCollected();
        const numberOfPlayers = await contractInstance.numberOfPlayers();

        const registrants = [];
        registrants.push(await contractInstance.registrants(0));

        assert.equal(totalMoneyCollected.toString(), registrationFee, 'The amount that has been registered does not match the amount sent');
        assert.equal(accounts[1], registrants[0], 'Account 1 did not get registered correctly');
        assert.equal(numberOfPlayers, registrants.length, 'Number of players not one.');
    });

    /*
     * This test ensures that the register function is working correctly for two players
     * @tests - The register function
     *  - The first element in the registrants array needs to be equal to the account that registered
     *  - The second element in the registrants array needs to be equal to the account that registered
     *  - The totalMoneyCollected needs to be equal to the 2 * registration fee
     *  - The numberOfPlayers needs to be two
     */
    it ('Can register two players on the contract', async () => {
        // Register two players in a tournament
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        await contractInstance.register({ from: accounts[2], value: registrationFee });

        const totalMoneyCollected = await contractInstance.totalMoneyCollected();
        const numberOfPlayers = await contractInstance.numberOfPlayers();

        const registrants = [];
        registrants.push(await contractInstance.registrants(0));
        registrants.push(await contractInstance.registrants(1));

        assert.equal(totalMoneyCollected.toString(), registrationFee * 2, 'The amount that has been registered does not match the amount sent.');
        assert.equal(accounts[1], registrants[0], 'Account 1 did not get registered correctly');
        assert.equal(accounts[2], registrants[1], 'Account 2 did not get registered correctly');
        assert.equal(numberOfPlayers, registrants.length, 'Number of players was not two');
    });

    /*
     * This test ensures that the register function is working correctly for maxPlayers
     * @tests - The checkPlayerCap modifier
     *  - Every element of the registrants array needs to correspond to every element of the accounts array
     *  - The totalMoneyCollected needs to be equal to numberOfPlayers * registrationFee
     *  - The numberOfPlayers needs to be equal to the length of the registrants array
     */
    it ('Can register many players on the contract', async () => {
        await Promise.all(
            [...Array(maxPlayers).keys()].map(async (index) => {
                return await contractInstance.register({ from: accounts[index + 1], value: registrationFee });
            })
        );

        const totalMoneyCollected = await contractInstance.totalMoneyCollected();
        const numberOfPlayers = await contractInstance.numberOfPlayers();

        let registrants = await Promise.all(
            [...Array(maxPlayers).keys()].map(async (index) => {
                return await contractInstance.registrants(index);
            })
        );

        assert.equal(totalMoneyCollected, registrationFee * registrants.length, 'The total amount collected, does not match the number of player * registrationFee');
        for (let i = 0; i < registrants.length; i++) {
            assert.equal(registrants[i], accounts[i + 1], `Player ${i} was not registered`);
        }

        assert.equal(numberOfPlayers, registrants.length, 'The numberOfPlayers was not equal to the length of the registrants array');
    });

    /*
     * This test ensures that the tournament can be played between four players, and that a payout occurs for the winner of the last game
     * @tests - The distributeFunds function
     *  - There is a winner for each of the games that were played
     *  - The winner of the tournament is equal to the winner of the last game in the games array
     *  - The winners balance is greater than when the tournament began
     *  - The hosts balance is greater than when the tournament began
     */
    it ('Can create a playable tournament with 4 players', async () => {
        const hostBalanceBefore = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether'));
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        await contractInstance.register({ from: accounts[2], value: registrationFee });
        await contractInstance.register({ from: accounts[3], value: registrationFee });
        await contractInstance.register({ from: accounts[4], value: registrationFee });

        await contractInstance.startTournament({ from: accounts[0] });

        const gameOneAddress = await contractInstance.games(0);
        const gameTwoAddress = await contractInstance.games(1);
        const gameThreeAddress = await contractInstance.games(2);

        const gameOne = await TrivialGame.at(gameOneAddress);
        const gameTwo = await TrivialGame.at(gameTwoAddress);
        const gameThree = await TrivialGame.at(gameThreeAddress);

        await gameOne.play(accounts[1], accounts[2]);
        await gameTwo.play(accounts[3], accounts[4]);

        const gameOneWinner = await gameOne.winner();
        const gameTwoWinner = await gameTwo.winner();

        assert.exists(gameOneWinner, 'There was no winner of gameOne');
        assert.exists(gameTwoWinner, 'There was no winner of gameTwo');

        await gameThree.play(gameOneWinner, gameTwoWinner);

        const gameThreeWinner = await gameThree.winner();

        assert.exists(gameThreeWinner, 'There was no winner of gameThree');

        const winnerBalanceBefore = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(gameThreeWinner), 'ether'));

        await contractInstance.distributeFunds({ from: accounts[0] });
        const winnerOfTournament = await contractInstance.winner();
        const winnerBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(winnerOfTournament), 'ether'));
        const hostBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether'));

        assert.equal(gameThreeWinner, winnerOfTournament, 'The winner of the last game is not equal to the winner of the tournament');
        assert.isAbove(winnerBalanceAfter, winnerBalanceBefore, 'The winners balance should be greater than it was before');
        assert.isAbove(hostBalanceAfter, hostBalanceBefore, 'The hosts balance should be greater than when the tournament began');
    });

    /*
     * This tests makes sure that the same player cannot be registered twice in the same tournament
     * @tests - the onlyRegisterOnce modifier
     *  - Makes sure that the error has been thrown by the contract
     *  - Makes sure that the contract did not return successfully from the second register call
     */
    it ('Will fail if you try to register the same player twice', async () => {
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        let ret;
        try {
            ret = await contractInstance.register({ from: accounts[1], value: registrationFee });
        } catch (error) {
            assert.exists(error, 'The register call did not trigger an error');
        }
        assert.notExists(ret, 'The contract allowed you to register a player more than once');
    });

    /*
     * This test makes sure that you cannot register more than the maxPlayer
     * @tests - the checkPlayerCap modifier
     *  - Makes sure that the error has been thrown by the contract
     */
    it ('Will fail if you try to register more than the maximum number of players', async () => {
        try {
            await Promise.all(
                accounts.map(async (account, index) => {
                    return await contractInstance.register({ from: accounts[index], value: registrationFee });
                })
            );
        } catch (error) {
            assert.exists(error, 'The contract allowed you to register more than the max number of players');
        }
    });

    /*
     * This test makes sure that you the registrants must pay the full fee
     * @tests - the checkAmountTransferred modifier
     *  - Makes sure that the error has been thrown by the contract
     *  - Makes sure that the contract did not return successfully from the register call
     */
    it ('Will fail if you try to register with less than the registration fee', async () => {
        let ret;
        try {
            ret = await contractInstance.register({ from: account[1], value: 1 });
        } catch (error) {
            assert.exists(error, 'The contract allowed you to register a user with less than the required registration fee amount');
        }

        assert.notExists(ret, 'The contract returned successfully from registering with less from the required amount');
    });

    /*
     * This test makes sure that after the circuit break has been called, no further activity can take place on the contract
     * @tests - The circuit breaker
     *  - Makes sure that account[1] has a balance that is less after registering
     *  - Makes sure that account[1] has a balance greater than the balance after they've registered (their funds have been returned)
     *  - Makes sure that the error has been thrown by the contract after the circuit breaker has been called
     *  - Makes sure that the call to register a player after the circuit breaker doens't have a return value
     *  - Makes sure that the tournament cannot be started afetr the circuit breaker has been called
     *  - Makes sure that the startTournament call did not return successfully
     */
    it ('Will reject any further activity if the circuit breaker was used', async () => {
        const balanceBeforeRegister = parseFloat(await web3.eth.getBalance(accounts[1]));
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        const balanceAfterRegister = parseFloat(await web3.eth.getBalance(accounts[1]));
        await contractInstance.register({ from: accounts[2], value: registrationFee });

        assert.isBelow(balanceAfterRegister, balanceBeforeRegister, 'The balance of account[1] did not decrease after registering for the tournament');

        await contractInstance.circuitBreaker({ from: accounts[0] });
        const balanceAfterBreaker = parseFloat(await web3.eth.getBalance(accounts[1]));

        assert.isAbove(balanceBeforeRegister, balanceAfterBreaker, 'The balance of account[1] should be equal after the circuit breaker has been called');

        let registerReturn;
        try {
            registerReturn = await contractInstance.register({ from: accounts[3], value: registrationFee });
        } catch (error) {
            assert.exists(error, 'The contract did not reject the register call');
        }

        assert.notExists(registerReturn, 'A new player was registered, even though the circuit breaker was called.');

        let startTournamentReturn;
        try {
            startTournamentReturn = await contractInstance.startTournament({ from: account[0] });
        } catch (error) {
            assert.exists(error, 'The contract did not reject the startTournament call');
        }

        assert.notExists(startTournamentReturn, 'The tournament was started, even though the circuit breaker was called');
    });

    /*
     * This test makes sure the circuit breaker can only be called by the host
     * @tests - the onlyHost modifier
     *  - Makes sure that the error has been thrown by the contract after the circuit breaker has been called
     *  - Makes sure that the circuit breaker did not return anything if called by a user that isnt the host
     */
    it ('Will reject a call to circuit breaker if the user is not the host', async () => {
        let ret;
        try {
            ret = await contractInstance.circuitBreaker({from : accounts[1]});
        } catch (error)
        {
            assert.exists(error, 'The contract did not reject the call to circuit breaker from a user that is not the host');
        }
        assert.notExists(ret, 'The circuitBreaker function returned even though the caller was not the host');
    });

    /*
     * This test makes sure that the host cannot register for the tournament
     * @tests - the notHost modifier
     *  - Makes sure that the error has been thrown by the contract after the register function has been called
     *  - Makes sure that the call to register a player if the user is the host does not return
     */
    it ('Will reject a call to register for the tournament if the registrant is the host', async () => {
        let ret;
        try {
            ret = await contractInstance.register({ from: accounts[0] });
        } catch (error){
            assert.exists(error, 'The contract did not reject the call to register from the host');
        }
        assert.notExists(ret, 'The register function allowed the host to register for the tournament');
    });

    /*
     * This test makes sure that no players can register for the tournament after its started
     * @tests - the tournamentStarted modifier
     *  - Makes sure that the error has been thrown by the contract after the register function has been called
     *  - Makes sure that the call to register a player if the user is the host does not return
     */
    it ('Will not allow registrants to register for the tournament after its started', async () => {
        const playerOne = await contractInstance.register({ from: accounts[1], value: registrationFee });
        const playerTwo = await contractInstance.register({ from: accounts[2], value: registrationFee });

        await contractInstance.startTournament({ from: accounts[0] });

        let playerThree;
        try {
            playerThree = await contractInstance.register({ from: account[3], value: registrationFee });
        } catch (error) {
            assert.exists(error, 'The contract did not reject the call to register after the tournament has started');
        }
        assert.notExists(playerThree, 'The register function allowed a new player to register after the tournament has started');
    });
});

const displayAccountBalances = async (accounts) => {
    for (let i = 0; i < accounts.length; i++) {
    }
}