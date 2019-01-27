# Tournament Bracketing Desgin Pattern

### Design patterns used

#### Fail Early, Fail Loud
All of the functions in the smart contract have modifiers that check the most likely issues to occur in order to fail early. For example:

notHost - checks whether the host is trying to register as a player
onlyRegisterOnce - makes sure the sender of the message isn't already a registered player
checkAmountTransferred - makes sure the value sent to to the contract equals the registration fee

#### Withdraw
When distributing funds to the host and the winner, all calls are made internally as the address of the host and the winner are known to the contract.

#### Circuit Breaker
The circuit breaker function listens to the emergencyStop variable that is set to true if the host calls the circuit breaker function. (Not coded on the front end but can be called on EtherScan)

#### State Machine
The Tournament smart contract has several state variables that are updated based on the function being called. For example, the register() updates the numberOfPlayers and totalMoneyCollected state variables. Once the startTournament() is called, game contracts are created and stored in the games array. After the games array is populated, the tournamentStarted modifier prevents more players from registering for the same tournament as it is set to true if the games array has length more than 0.


### Design patterns not used


#### Restricting Access
Didn't need to use this as the modifers for all the functions take care of making sure other contracts have limited access to variables.

#### Auto Deprecation
I didn't want to time any aspect of the tournament so I didn't need to use this design pattern.

#### Mortal
I want the record of the tournament to stay on the blockchain so I decided not to use this design pattern.