pragma solidity ^0.5.0;

import "./TrivialGame.sol";
import "./Safemath.sol";

/** @title Tournament */
contract Tournament {
    using SafeMath for uint;

    //
    // State Variables
    //

    // An array of registrants. Every registrant needs to be payable
    address payable[] public registrants;
    // Keep an array of the games to be played in the tournament
    TrivialGame[] public games;
    // Keep track of the number of players
    uint public numberOfPlayers;
    // Setting max number of players
    uint public maxPlayers;
    // We will eventually set a winner
    address payable public winner;
    // The host of the tournament
    address payable public host;
    // There is a registration fee for the tournament so we can give prize money
    uint public registrationFee;
    // Keep track of how much money has been collected
    uint public totalMoneyCollected;
    // The percent of funds that host gets
    uint public rakePercent;
    // Circuit Breaker in case of an emergency
    bool private emergencyStop;

    //
    // Functions
    //

    /// @notice Creates a new Tournament. This tournament is hard coded to
    ///  play a TrivialGame.
    /// @dev Hard code your own configurations
    //   - registrationFee is currently not configurable
    //   - maxPlayers is currently not configurable
    //   - rakePercent is currently not configurable
    constructor () public {
        host = msg.sender;
        // .1 Ether as a registration fee
        registrationFee = 100000000000000000;
        totalMoneyCollected = 0;
        rakePercent = 10;
        numberOfPlayers = 0;
        maxPlayers = 8;
        winner = address(0);
        emergencyStop = false;
    }

    /// @notice - register a player in the tournament 
    function register() 
        public
        payable
        notStopped
        notHost
        onlyRegisterOnce
        checkAmountTransferred
        tournamentStarted
        checkPlayerCap
    {
        numberOfPlayers = numberOfPlayers.add(1);
        registrants.push(msg.sender);
        totalMoneyCollected = totalMoneyCollected.add(msg.value);
        emit MoneyCollected(totalMoneyCollected);
        emit ConfirmRegistrant(msg.sender);
    }

    /// @notice - The host can begin the tournament when they like
    /// @dev - The tournament can only be started if there are more than one registrants
    function startTournament() 
    public
    notStopped
    onlyHost
    moreThanOnePlayer
    {
        for (uint i = 0; i < numberOfPlayers - 1; i++) {
            games.push(new TrivialGame());
            emit CreateGame(games[i]);
        }
        emit StartTournament();
    }

    /// @notice - Distributes funds to the winner of the tournament and the host
    function distributeFunds()
    public
    payable
    notStopped
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

    /// @notice - Gives host capability to stop the tournament
    /// @dev - EmergencyStop trigger 'notStopped' modifier on all functions
    function circuitBreaker()
    public
    payable
    onlyHost
    notStopped
    {
        emergencyStop = true;
        for (uint i = 0; i < registrants.length; i++) {
            registrants[i].transfer(registrationFee);
        }
    }

    //
    // Events
    //

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

    //
    // Modifiers
    //

    modifier onlyHost() {require (msg.sender == host, "Only host can use this function"); _;}
    modifier checkAmountTransferred() {require (msg.value == registrationFee, "Insuffcient funds transferred"); _;}
    modifier checkPlayerCap() {require (numberOfPlayers < maxPlayers, "Max players reached"); _;}
    modifier checkLastGame() {require (games[numberOfPlayers - 2].winner() != address(0), "Last Game has not been played");  _;}
    modifier notHost() {require (msg.sender != host, "Host cannot participate in the tournament"); _;}
    modifier notStopped() {require(!emergencyStop, "Emergency Stop Button was Pressed"); _;}
    modifier tournamentStarted() {require (games.length == 0, "Tournament has already begun"); _;}
    modifier moreThanOnePlayer() {require (numberOfPlayers > 1, "A tournament cannot be played by one registrant"); _;}
    modifier onlyRegisterOnce() {
        for (uint i = 0; i < registrants.length; i++) {
            require (msg.sender != registrants[i], "Cannot register a player more than once");
        }
        _;
    }

}