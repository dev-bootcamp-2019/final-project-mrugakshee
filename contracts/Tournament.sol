pragma solidity ^0.5.0;

import "./TrivialGame.sol";
import "./Safemath.sol";

contract Tournament {

    using SafeMath for uint;
    
    ///////////////// State Variables

    // Maping the address of participants to their username
    address payable[] public registrants;
    uint public numberOfPlayers;
    address payable public winner;
    TrivialGame[] public games;

    // Setting max number of players
    uint public maxPlayers;

    // The host allocates funds to the account of the winner,
    // and takes a cut to maintain the blockchain and keep the system going.

    // Owner of the contract
    address payable public host;

    // Set amount for registration
    uint public registrationFee;
    uint public totalMoneyCollected;
    uint public rakePercent;

    // Circuit Breaker
    bool private emergencyStop;
    
    ///////////////// Functions
    
    constructor () public {
        host = msg.sender;
        registrationFee = 1000000000000000000;
        totalMoneyCollected = 0;
        rakePercent = 10;

        // Tournament Initalization
        numberOfPlayers = 0;
        maxPlayers = 8;
        winner = address(0);

        emergencyStop = false;
    }

    // Add player to 'registrants'
    // emit result
    function register() 
        public
        payable
        notStopped
        notHost
        checkPlayerCap
        onlyRegisterOnce
        checkAmountTransferred
    {
        numberOfPlayers = numberOfPlayers.add(1);
        registrants.push(msg.sender);
        totalMoneyCollected = totalMoneyCollected.add(msg.value);
        emit MoneyCollected(totalMoneyCollected);
        emit ConfirmRegistrant(msg.sender);
    }

    function startTournament() 
    public
    notStopped
    onlyHost
    {
        // @TODO - create tournament bracket for players
        for (uint i = 0; i < numberOfPlayers - 1; i++) {
            games.push(new TrivialGame());
            emit CreateGame(games[i]);
        }
        emit StartTournament();
    }

    function distributeFunds() 
    public
    payable
    notStopped
    onlyHost
    checkLastGame
    {
        // Set the winner
        winner = games[numberOfPlayers - 2].winner();
        // Transfer rakePercent / 100 of the contracts balance to the host to compensate for gas
        uint hostRake = address(this).balance.div(rakePercent);
        host.transfer(hostRake);
        // Transfer the winner the rest of the balance
        uint prizeMoney = address(this).balance;
        winner.transfer(prizeMoney);
        emit TournamentEnd(winner);
        emit PrizeMoney(prizeMoney);
        emit HostRake(hostRake);
    }

    function circuitBreaker() 
    public
    payable
    onlyHost
    {
        emergencyStop = true;
        for (uint i = 0; i < registrants.length; i++) {
            registrants[i].transfer(registrationFee);
        }
    }

    ///////////////// Events
    event ConfirmRegistrant(
        address registrantAddress
    );

    event MoneyCollected(
        uint value
    );

    event TournamentEnd(
        address winner
    );

    event PrizeMoney(
        uint prizeMoney
    );

    event HostRake(
        uint hostRake
    );

    event StartTournament();

    event CreateGame(
        TrivialGame game
    );

    ///////////////// Modifiers
    modifier onlyHost() {require (msg.sender == host, "Only host can use this function"); _;}
    modifier checkAmountTransferred() {require (msg.value == registrationFee, "Insuffcient funds transferred"); _;}
    modifier onlyRegisterOnce() {
        for (uint i = 0; i < registrants.length; i++) {
            require (msg.sender != registrants[i], "Cannot register a player more than once");
        }
        _;
    }
    modifier checkPlayerCap() {require (numberOfPlayers < maxPlayers, "Max players reached"); _;}
    modifier checkLastGame() {require (games[numberOfPlayers - 2].winner() != address(0), "Last Game has not been played");  _;}
    modifier notHost() {require (msg.sender != host, "Host cannot participate in the tournament"); _;}
    modifier notStopped() {require(!emergencyStop, "Emergency Stop Button was Pressed"); _;}
}