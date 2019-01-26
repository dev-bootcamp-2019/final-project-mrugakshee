pragma solidity ^0.5.0;

contract TrivialGame {

    ///////////////// State Variables

    address payable public playerOne;
    address payable public playerTwo;
    address payable public winner;

    ///////////////// Events

    event Winner(
        address winner
    );

    event GamePlayed(
        address playerOne,
        address playerTwo
    );

    event checkAddedPlayer (
        address player
    );

    // The constructor is responsible for setting the players of the game
    constructor() public {
        playerOne = address(0);
        playerTwo = address(0);
        winner = address(0);
    }

    // This is where the actual game logic takes place
    function play(address payable _playerOne, address payable _playerTwo) 
    public
    {
        playerOne = _playerOne;
        playerTwo = _playerTwo;
        winner = playerOne;
        emit GamePlayed(playerOne, playerTwo);
        emit Winner(winner);
    }
}