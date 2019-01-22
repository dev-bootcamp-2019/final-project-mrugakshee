const Tournament = artifacts.require('Tournament');
const TrivialGame = artifacts.require('TrivialGame');

contract('Tournament', accounts => {
    beforeEach(async () => {
        contractInstance = await Tournament.new();
        await Tournament.deployed();
        registrationFee = 1000000000000000000;
    });

    // it('can register a player on the contract', async () => {
    //     const playerOne = await contractInstance.register({ from: accounts[0], value: registrationFee });

    //     const totalMoneyCollected = await contractInstance.TotalMoneyCollected();

    //     const registrants = {};
    //     registrants[accounts[0]] = await contractInstance.registrants(accounts[0]);

    //     assert.equal(totalMoneyCollected.toString(), registrationFee, 'The amount that has been registered does not match the amount sent');
    //     assert.equal(registrants[accounts[0]], true, 'Account 1 did not get registered correctly');
    // });

    // it ('can register two players on the contract', async () => {
    //     const playerOne = await contractInstance.register({ from: accounts[0], value: registrationFee });
    //     const playerTwo = await contractInstance.register({ from: accounts[1], value: registrationFee });

    //     const totalMoneyCollected = await contractInstance.TotalMoneyCollected();

    //     const registrants = {};
    //     registrants[accounts[0]] = await contractInstance.registrants(accounts[0]);
    //     registrants[accounts[1]] = await contractInstance.registrants(accounts[1]);

    //     assert.equal(totalMoneyCollected.toString(), registrationFee * 2, 'The amount that has been registered does not match the amount sent.');
    //     assert.equal(registrants[accounts[0]], true, 'Account 1 did not get registered correctly');
    //     assert.equal(registrants[accounts[1]], true, 'Account 2 did not get registered correctly');
    // });

    // it ('can register many players on the contract', async () => {
    //     let result = await Promise.all(
    //         accounts.map(async account => {
    //             return await contractInstance.register({ from: account, value: registrationFee });
    //         })
    //     );

    //     const totalMoneyCollected = await contractInstance.TotalMoneyCollected();

    //     let registrants = await Promise.all(
    //         accounts.map(async account => {
    //             return await contractInstance.registrants(account)
    //         })
    //     )

    //     assert.equal(totalMoneyCollected, registrationFee * accounts.length, 'The total amount collected, does not match the number of player * registrationFee');
    //     for (let i = 0; i < registrants.length; i++) {
    //         assert.equal(registrants[i], true, `Player ${i} was not registered`);
    //     }
    // });

    it ('can create a playable tournament', async () => {
        const playerOne = await contractInstance.register({ from: accounts[0], value: registrationFee });
        const playerTwo = await contractInstance.register({ from: accounts[1], value: registrationFee });
        const playerThree = await contractInstance.register({ from: accounts[2], value: registrationFee });
        const playerFour = await contractInstance.register({ from: accounts[3], value: registrationFee });

        await contractInstance.startTournament();

        const gameOne = await contractInstance.games(0);
        const gameTwo = await contractInstance.games(1);
        const gameThree = await contractInstance.games(2);

        const temp = await TrivialGame.at(gameOne);

        console.log('HERE');
        console.log(temp);

        const playerOneInGame = await temp.addPlayer({ from: accounts[0] });
        const playerTwoInGame = await temp.addPlayer({ from: accounts[1] });
        await temp.startTournament();
        const winner = await temp.winner();

        
        console.log(winner);

        assert.equal(winner, accounts[0], 'The winner was not accounts[0]');
    });
});