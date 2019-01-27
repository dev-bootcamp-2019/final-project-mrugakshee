pragma solidity ^0.5.0;

/** @title Trivial Game */
contract TrivialGame {
    
    //
    // State Variables
    //

    address payable public playerOne;
    address payable public playerTwo;
    address payable public winner;

    //
    // Functions
    //

    /// @notice - Initializes a TrivialGame
    /// @dev - A Trivial Game takes place between two players, one of which will be a winner
    constructor() public {
        playerOne = address(0);
        playerTwo = address(0);
        winner = address(0);
    }

    /// @notice - This is where the actual game logic takes place
    /// @dev - This function has a security flaw - anyone, irrespective of
    /// their participation in the game, can call the function.
    /// The purpose of this project was to create a self distributing 
    /// tournament bracketing system and the demonstration of this trivial
    /// game was for testing purposes only.
    /// @param _playerOne Address of player one in the game
    /// @param _playerTwo Address of player two in the game
    function play(address payable _playerOne, address payable _playerTwo) 
    public
    {
        playerOne = _playerOne;
        playerTwo = _playerTwo;
        winner = playerOne;
        emit GamePlayed(playerOne, playerTwo);
        emit Winner(winner);
    }

    //
    // Events
    //

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

}