pragma solidity ^0.5.0;

import "./TrivialGame.sol";

contract Tournament {
    
    ///////////////// State Variables

    // Maping the address of participants to their username
    mapping (address => bool) public registrants;
    uint public numberOfPlayers;
    address public winner;
    TrivialGame[] public games;

    // Setting max number of players
    uint public maxPlayers;

    // The host allocates funds to the account of the winner,
    // and takes a cut to maintain the blockchain and keep the system going.

    // Owner of the contract
    address public host;

    // Set amount for registration
    uint public registrationFee;

    uint public totalMoneyCollected;
    
    ///////////////// Functions
    
    constructor () public {
        host = msg.sender;
        registrationFee = 1000000000000000000;
        totalMoneyCollected = 0;

        // Tournament Initalization
        numberOfPlayers = 0;
        maxPlayers = 16;
        winner = address(0);
    }

    // Add player to 'registrants'
    // emit result
    function register() 
        public
        payable
        checkAmountTransferred
        checkPlayerCap
    {
        numberOfPlayers += 1;
        registrants[msg.sender] = true;
        totalMoneyCollected += msg.value;
        emit MoneyCollected(totalMoneyCollected);
        emit ConfirmRegistrant(msg.sender);
    }

    function startTournament() 
    public
    onlyHost
    {
        for (uint i = 0; i < numberOfPlayers - 1; i++) {
            games.push(new TrivialGame());
        }
    }

    ///////////////// Events
    
    event ConfirmRegistrant(
        address registrantAddress
    );

    event MoneyCollected(
        uint value
    );
    // @TODO - startTournament Event (No Params) - Maybe not required
    // @TODO - createGame Event (It should take a game )

    ///////////////// Modifiers

    modifier checkAmountTransferred() {require (msg.value == registrationFee, "Insuffcient funds transferred"); _;}
    modifier onlyHost() {require (msg.sender == host, "Only host can use this function"); _;}
    modifier checkPlayerCap() {require (numberOfPlayers < maxPlayers, "Max players reached"); _;}
    // @TODO - Restrict the same player from registering twice - for later
}