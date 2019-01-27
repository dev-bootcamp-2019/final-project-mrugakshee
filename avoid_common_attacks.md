# Avoiding common attacks on the bracketing system

Everything written below is with respect to the contract Tournament.sol

### Reentrancy
External calls are only used to receive data for a particular action inside a function. Control flow is never handed over to the external call, hence mitigating the risk of recursive calls and ultimately, reentrancy.

### Transaction Ordering Dependence
The calling of functions in the contract is dependent on the flow of the dApplication. Once the contract has moved on to calling another function, the function being called previously doens't have the capacity to be called again since modifers have been put in place to ensure it. 

The contract has 3 functions: register, startTournament, distributeFunds.

- When the tournament is in the register phase, conditions have been put in place to ensure the next phase is invoked only when number of players > 1 && <= max players, and that the host has the sole capability to decide the start of the tournament. The third phase, distribute funds, cannot be invoked either since its modifer checks if the last game was played and winner was decided.

- Once the tournament has started, the register() cannot be called as it has a modifier that checks if the tournament has already started. The third phase will still cannot be invoked until the last game has taken place.

- In the last phase, the distribute funds function can be called only once the tournmaent has ended and the winner has been declared.

### Integer Overflow and Underflow
Using the safeMath library prevents the overflow or underflow of integers when performing a math operation on uint variables.

### Logic Bugs
I have put in multiple modifiers and requires to make sure functions execute only when they are supposed to. Additionally, the tests written for each contract check for failure in logic by testing specific features of the function.

### Poison Data
Have made use of the web3.utils to sanitize the account information collected in the input box of registrants address to ensure the address entered is that of a valid account and it isn't empty (0x0000000000000000000000000000000000000000).

### Powerful Contract Administrators
The host is in charge of initiating the contract, has the power to 'start the tournament'.
The host is incentived in carrying through the responsibilities assigned to it as it gets a percentage of the total prize money. Since the host does have to spend gas for every contract call made, it has incentive to finish the tournament to get back the gas spent and little extra for taking up the responsibility of being a host.

### Off Chain Safety
The game is hosted on a server that is http secure.

### Tx.Origin and Gas Limits
msg.sender was used throughout the contract.

To reduce gas costs, no contract call loops over an array of undetermined length.

# Security Flaws
The 'Trivial Game' contract was built for demonstration purposes only and does not include many security checks. 

One exploit is when the tournament has started, any contract/account can call the playGame(p1, p2) and insert any two players because the TrivialGame contract does not check with the Tournament contract to verify the addresses in the playGame function call.

In theory, someone watching the tournament take place, can wait until the last game is being played, call playGame(p1, p2) on the last Trivial game and take the reward for winning the tournament.

I intended for this project to demonstrate the Tournament Bracketing system with the collection and distribution of funds, not the game that is played in the tournament. Thus, the lack of security measure is intentionally left out for Trivial Game.

p1 always wins the TrivialGame, thus, the game is truly trivial.