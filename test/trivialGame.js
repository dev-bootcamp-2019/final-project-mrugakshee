const TrivialGame = artifacts.require('TrivialGame');

contract('TrivialGame', accounts => {
    beforeEach(async () => {
        contractInstance = await TrivialGame.new();
        await TrivialGame.deployed();
    });

    it ('Has initialized properly', async () => {
        const playerOne = await contractInstance.playerOne();
        const playerTwo = await contractInstance.playerTwo();
        const winner = await contractInstance.winner();

        assert.equal(playerOne, playerTwo, 'PlayerOne and PlayerTwo should be equal after initialization');
        assert.equal(playerOne, winner, 'PlayerOne and winner should be equal after initialization');
        assert.equal(playerTwo, winner, 'PlayerTwo and winner should be equal after initialization');
    });

    it ('Can be played between two players', async () => {
        await contractInstance.play(accounts[0], accounts[1]);
        const winner = await contractInstance.winner();
        assert.equal(accounts[0], winner, 'The first player was not the winner');
    });
});