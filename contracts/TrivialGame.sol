pragma solidity ^0.5.0;

contract TrivialGame {

    ///////////////// State Variables

    address public playerOne;
    address public playerTwo;
    address public winner;

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

    // @TODO - change below wrt. to Tournament.sol contract (accept parameter)
    function addPlayer() public returns (bool result) {
        if (playerOne == address(0)) {
            playerOne = msg.sender;
        } else if (playerTwo == address(0)) {
            playerTwo = msg.sender;
        } else {
            return false;
        }
        emit checkAddedPlayer(msg.sender);
        return true;
    }

    // This is where the actual game logic takes place
    function play(address _playerOne, address _playerTwo) 
    public
    {
        playerOne = _playerOne;
        playerTwo = _playerTwo;
        winner = playerOne;
        emit GamePlayed(playerOne, playerTwo);
        emit Winner(winner);
    }
}