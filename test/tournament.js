const Tournament = artifacts.require('Tournament');
const TrivialGame = artifacts.require('TrivialGame');

contract('Tournament', accounts => {
    beforeEach(async () => {
        contractInstance = await Tournament.new();
        await Tournament.deployed();
        registrationFee = await contractInstance.registrationFee();
        maxPlayers = await contractInstance.maxPlayers();
    });

    it('can register a player on the contract', async () => {
        // Register account[1]
        await contractInstance.register({ from: accounts[1], value: registrationFee });

        // Get the totalMoneyCollected by the contract
        const totalMoneyCollected = await contractInstance.totalMoneyCollected();

        const registrants = [];
        registrants.push(await contractInstance.registrants(0));

        assert.equal(totalMoneyCollected.toString(), registrationFee, 'The amount that has been registered does not match the amount sent');
        assert.equal(accounts[1], registrants[0], 'Account 1 did not get registered correctly');
    });

    it ('can register two players on the contract', async () => {
        // Register two players in a tournament
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        await contractInstance.register({ from: accounts[2], value: registrationFee });

        const totalMoneyCollected = await contractInstance.totalMoneyCollected();

        const registrants = [];
        registrants.push(await contractInstance.registrants(0));
        registrants.push(await contractInstance.registrants(1));

        assert.equal(totalMoneyCollected.toString(), registrationFee * 2, 'The amount that has been registered does not match the amount sent.');
        assert.equal(accounts[1], registrants[0], 'Account 1 did not get registered correctly');
        assert.equal(accounts[2], registrants[1], 'Account 2 did not get registered correctly');
    });

    it ('can register many players on the contract', async () => {
        await Promise.all(
            [...Array(3).keys()].map(async (index) => {
                return await contractInstance.register({ from: accounts[index + 1], value: registrationFee });
            })
        );

        const totalMoneyCollected = await contractInstance.totalMoneyCollected();

        let registrants = await Promise.all(
            [...Array(3).keys()].map(async (index) => {
                return await contractInstance.registrants(index);
            })
        );

        assert.equal(totalMoneyCollected, registrationFee * registrants.length, 'The total amount collected, does not match the number of player * registrationFee');
        for (let i = 0; i < registrants.length; i++) {
            assert.equal(registrants[i], accounts[i + 1], `Player ${i} was not registered`);
        }
    });

    it ('can create a playable tournament with 4 players', async () => {
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

        await gameThree.play(gameOneWinner, gameTwoWinner);

        const winner = await gameThree.winner();
        const winnerBalanceBefore = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(winner), 'ether'));

        await contractInstance.distributeFunds({ from: accounts[0] });
        const winnerOfTournament = await contractInstance.winner();
        const winnerBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(winner), 'ether'));
        const hostBalanceAfter = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether'));

        assert.equal(winner, winnerOfTournament, 'The winner of the last game is not equal to the winner of the tournament');
        assert.isAbove(winnerBalanceAfter, winnerBalanceBefore, 'The winners balance should be greater than it was before');
        assert.isAbove(hostBalanceAfter, hostBalanceBefore, 'The hosts balance should be greater than when the tournament began');
    });

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

    it ('Will fail if you try to register with less than the registration fee', async () => {
        let ret;
        try {
            ret = await contractInstance.register({ from: account[1], value: 1 });
        } catch (error) {
            assert.exists(error, 'The contract allowed you to register a user with less than the required registration fee amount');
        }

        assert.notExists(ret, 'The contract returned successfully from registering with less from the required amount');
    });

    it ('Will reject any further activity if the circuit breaker was used', async () => {
        await contractInstance.register({ from: accounts[1], value: registrationFee });
        await contractInstance.register({ from: accounts[2], value: registrationFee });

        await contractInstance.circuitBreaker({ from: accounts[0] });

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
});

const displayAccountBalances = async (accounts) => {
    for (let i = 0; i < accounts.length; i++) {
        console.log(`Account[${i}]: ${accounts[i]}`);
        console.log(`Balance: ${web3.utils.fromWei(await web3.eth.getBalance(accounts[i]), 'ether')}`);
    }
}