# final-project-mrugakshee

#Project Title
Tournament Bracket Generator with funds distribution

# What does the project do?
This project is designed to generate a tournament bracket for the desired number of players (max 8, can be modified on the smart contract) with the advantage of collecting ether upon registration of players and distribution of the prize money won by the winner of the tournament at the end of the tournament. 
There are two important parties required to initiate the tournament. The host and the players. The host is 

- In charge of starting the tournament once registration is complete. (Players in the tournament do not have permission to start the tournament.) 
- In charge of 'playing the game'. Since the intent of this project was to build a system that is in charge of taking registration fees and distributing them at the end of the tournament, I programmed a Trivial Game that is used to demonstrate the functioning of the bracketing system. To avoid giving the ability of 'playing the game' to anyone on the tournament, this functionality has been given to the host.
- To mark the completion of the tournament, the host (or any player) can click on the 'Distributes Funds' button which transfers ether to the winner of the tournament and a percentage of the winnings to the host for hosting the tournament as the host covers the gas fees for interacting with the tournament.

## Problem
Participating in a tourament, for a physical or digital game, requires a middle man to host the tournament from start to finish. Between the collection of registration fees at the start and distribution of the total prize money at the end, there is room of mismanagement of funds and/or untimely distribution at the end of the tournament. 
My project solves the problem of the collection and distribution of funds for the entirety of the tournament by storing the funds on the smart conract.

## Solution

Each tournament lives on a smart contract. 

#### Host
There still needs to be a host for a tournament who 
- initiates the tournament, 
- starts the tournament, 
- plays the game (for the purposes of demostrating a game played on the tournament, I created a TrivialGame that is deployed onto each game in the tournament bracket, the host is the only party capable of executing the 'playing' of the game)

In order to incentivize the host for taking up the above mentioned responsibilities, the host gets a rake in every tournament it hosts. Since every contract call on the ethereum blockchain requires a payment of gas costs, the host rake coveres the expenditure costs for hosting the tournament. The rake percent is on the smart contract, thus it cannot be changed at will by the host.

The prize money for the winner of the tournament is the amount resulting from the total money collected minus host rake.

#### Smart Contract
The smart contract is majorly responsible for 
- Registering the players who wish to participate in the tournament
- Collecting all the registrants' fees
- Initializing game contracts for the tournament
- and distributing funds to the respective parties upon completion of the tournament

# Setup

### Ganache
I used the Ganache GUI for my development blockchain and this was my setup for running it on localhost:
```
ganache: {
    host: "127.0.0.1",     // Localhost (default: none)
    port: 8545,            // Standard Ethereum port (default: none)
    network_id: "*",       // Any network (default: none)
    gas: 6000000,
    gasPrice: 20000000000
}
```


### Truffle
In Truffle, compile the project and migrate it to ganache:
```
truffle compile
truffle migrate --network ganache
```

if you want to reset the contract, use the --reset flag:
```truffle migrate --network ganache --reset```

In order to run the tests for the Smart Contracts written in this project in truffle, run the following:

```truffle test```


### Node
This project was written in React on node version 8

Make sure to change your node version to 8 before installing node modules.

Check for current node version
``` node -v```

Assuming you use Node Version Manager, change version to 8.
```nvm use 8```

Navigate to Clients folder and install node modules by running:
```npm install```

Make sure you're in your cliets folder and run:
```npm start```

### Metamask
The contract makes the default account the owner of the contract. This was Account 1 on my metamask wallet. In order to register players for testing purposes, you will have to register them with any other Account than your default account as the host is not allowed to be registrant in the tournament.

In order to **Start Tournament** and **Play game**, make sure to switch back to Account 1 (or your default account) before you hit the button.

# Scalability

Anyone is free to pick up the Tournament contract and implement their own game on it by importing the game smart contract into Tournament.sol and change state variables like max players, registration fee, host rake, etc. to suit their intents and purposes.