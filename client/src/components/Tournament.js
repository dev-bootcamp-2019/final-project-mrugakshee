import React, { Component } from 'react';
import TrivialGameContract from '../contracts/TrivialGame.json';
import Game from './Game';

import { Row, Col } from 'antd';
import _ from 'lodash';

class Tournament extends Component {
    constructor(props) {
        super(props)
        this.state = {
            games: [],
            bracket: [],
            expOfTwo: [1, 2, 4, 8, 16, 32],
            tier: [2, 3, 4, 5, 6],
            mod: 0,
            index: 0,
            currentTier: 1,
            playerIndex: 0,
            stack: [],
            winnerStack: [],
            events: [], // Prevent double firing events
            tournamentWinner: '',
            showWinner: false,
            prizeMoney: 0,
            hostRake: 0
        }
        this.fetchGame = this.fetchGame.bind(this);
        this.findMod = this.findMod.bind(this);
        this.createBracket = this.createBracket.bind(this);
        this.insertPlayers = this.insertPlayers.bind(this);
        this.initWinnerEventListeners = this.initWinnerEventListeners.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
        this.checkIncrementTier = this.checkIncrementTier.bind(this);
        this.distributeFunds = this.distributeFunds.bind(this);
        this.displayWinner = this.displayWinner.bind(this);
        this.renderBracket = this.renderBracket.bind(this);
    }

    componentWillMount = async () => {
        let tempStack = this.state.stack;
        for (let j = this.props.numberOfPlayers - 1; j >= 0; j--) {
            tempStack.push(j);
        }
        this.setState({ stack: tempStack });

        for (let i = 0; i < this.props.numberOfPlayers - 1; i++) {
            await this.fetchGame(i);
        }
        let returnedMod = await this.findMod();
        await this.setState({ mod: returnedMod });
        this.createBracket();
        this.insertPlayers();
        this.initWinnerEventListeners();
    }

    fetchGame = async (gameID) => {
        await this.props.contract.methods.games(gameID).call((err, res) => {
            let game = new this.props.web3.eth.Contract(
                TrivialGameContract.abi,
                res
            );

            let newGames = this.state.games;
            newGames[gameID] = game;
            this.setState({ games: newGames });
        });
    }

    initWinnerEventListeners() {
        for (let i = 0; i < this.state.bracket.length; i++) {
            // @TODO - Fix the missing contract
            this.state.bracket[i].game.events.Winner((err, res) => {
                if (!this.state.events[res.id]) {
                    this.handleEvent(res.id, () => {
                        let newBracket = this.state.bracket;
                        let newWinnerStack = this.state.winnerStack;

                        let indexOfPlayedGame = this.state.games.findIndex(game => game._address === res.address);

                        if (indexOfPlayedGame !== this.props.numberOfPlayers - 2) {
                            newBracket[indexOfPlayedGame].winner = res.returnValues.winner;
                            newWinnerStack.push(this.props.registrants.indexOf(res.returnValues.winner));
                            this.setState({
                                bracket: newBracket,
                                winnerStack: newWinnerStack
                            }, this.checkIncrementTier);
                        } else {
                            this.setState({
                                tournamentWinner: res.returnValues.winner
                            })
                            this.displayWinner();
                        }
                    });
                }
            });
        }
    }

    displayWinner() {
        this.setState({
            showWinner: true
        })
    }

    distributeFunds() {
        this.props.contract.methods.distributeFunds().send(
            { from: this.props.contract.defaultAccount }
        );
        console.log("********* this.props.contract")
        console.log(this.props.contract)

        this.props.contract.events.PrizeMoney((err, res) => {
            if (!this.state.events[res.id]) {
                this.handleEvent(res.id, () => {
                    this.setState({
                        prizeMoney: res.returnValues.prizeMoney
                    });
                });
            }
            console.log("********* this.state.prizeMoney")
            console.log(this.state.prizeMoney)
        });

        this.props.contract.events.HostRake((err, res) => {
            if (!this.state.events[res.id]) {
                this.handleEvent(res.id, () => {
                    this.setState({
                        hostRake: res.returnValues.hostRake
                    });
                });
            }

            console.log("********** this.hostRake")
            console.log(this.state.hostRake)
        });

        console.log("End of distribute funds()")
    }

    handleEvent(id, callback) {
        let newEvents = this.state.events;
        newEvents[id] = true;
        this.setState({
            events: newEvents
        }, callback);
    }

    findMod() {
        for (let i = 0; i < this.state.expOfTwo.length; i++) {
            if (this.props.numberOfPlayers <= this.state.expOfTwo[i]) {
                this.setState({
                    index: i - 2,
                    exponentIndex: i - 1
                });
                return (this.state.expOfTwo[i - 1]);
            }
        }
        return (0);
    }


    createBracket = async () => {
        let games = this.state.games;
        let newBracket = this.state.bracket;
        let inZerothTier = this.props.numberOfPlayers % this.state.mod;
        let changingIndex = this.state.index;
        let tierIndex = 0;

        if (inZerothTier == 0) {
            inZerothTier = this.props.numberOfPlayers / 2;
        }
        let gameIndex = inZerothTier;
        console.log("gameIndex n initial: ", gameIndex)

        for (let i = 0; i < inZerothTier; i++) {
            newBracket.push({
                game: games[i],
                tier: 1,
                p1: '',
                p2: ''
            });
        }

        for (let j = this.state.expOfTwo[this.state.index]; j > 0; j--) {
            for (let k = this.state.expOfTwo[changingIndex]; k > 0; k--) {
                newBracket.push({
                    game: games[gameIndex],
                    tier: this.state.tier[tierIndex],
                    p1: '',
                    p2: ''
                });
                ++gameIndex;
            }
            --changingIndex;
            ++tierIndex;
        }
        this.setState({
            bracket: newBracket
        });
    }

    /*
     * checkIncrementTier()
     *
     * This function runs after every Winner event is triggered
     * - The purpose of this function is to determine if all the games in the
     *    current tier have finished being played
     */
    checkIncrementTier() {
        console.log('----- checkIncrementTier()');
        console.log(this.state.bracket);
        let incrementTier = true; // Assume we need to increment the tier
        for (let i = 0; i < this.state.bracket.length; i++) { // Iterate through the bracket
            if (this.state.bracket[i].tier === this.state.currentTier) { // Only look at the games in the current tier
                if (!this.state.bracket[i].winner) { // If there is no winner on the current game
                    incrementTier = false; // Don't increment the tier
                }
            }
        }

        if (incrementTier) { // If every game in the currentTier had a winner, then we will increment the tier
            this.setState({
                currentTier: this.state.currentTier + 1
            }, this.insertPlayers);
        }
    }

    insertPlayers() {
        console.log('----- insertPlayers()');
        console.log(`CurrentTier: ${this.state.currentTier}`);
        console.log(this.state.bracket);
        console.log(this.state.stack);
        console.log(this.state.winnerStack);

        let newBracket = this.state.bracket;
        for (let i = 0; i < newBracket.length; i++) {
            if (newBracket[i].tier === this.state.currentTier) {
                let x1;
                let x2;

                // Try set x1 to a player from the stack first,
                //  if there are no players in the stack, 
                //   take a player from the winnerStack
                if (this.state.stack.length > 0) {
                    x1 = this.state.stack.pop();
                } else if (this.state.winnerStack.length > 0) {
                    x1 = this.state.winnerStack.pop();
                }

                // Try to set x2 to a player from the winnerStack first,
                //  if there are no players in the winnerStack,
                //   take a player from the stack
                if (this.state.winnerStack.length > 0) {
                    x2 = this.state.winnerStack.pop();
                } else if (this.state.stack.length > 0) {
                    x2 = this.state.stack.pop();
                }

                console.log('---- insertPlayers()');
                console.log(x1);
                console.log(x2);

                newBracket[i].p1 = this.props.registrants[x1];
                newBracket[i].p2 = this.props.registrants[x2];
            }
        }
        this.setState({
            bracket: newBracket
        });
    }

    renderBracket() {
        if (this.state.bracket.length === 0) {
            return (<h4> ...loading </h4>)
        }
        
        const antdWidth = 24;
        let numberOfTiers = this.state.bracket[this.state.bracket.length - 1].tier;
        let columnWidth = antdWidth / numberOfTiers;

        return _.times(numberOfTiers, (tierIndex) => {
            return (
                <Col key={tierIndex} span={columnWidth}>
                    <h1> {tierIndex} </h1>
                    <Row>
                        {
                            this.state.bracket.map((game, gameIndex) => {
                                return (this.state.currentTier >= game.tier && tierIndex + 1 === game.tier) &&
                                    (
                                        <div key={gameIndex}>
                                            < Game
                                                {...this.props}
                                                game={game}
                                                gamesInTier={game.tier}
                                                index={parseInt(gameIndex)} />
                                        </div>
                                    )
                            })
                        }
                    </Row>
                </Col>
            )
        });
    }

    render() {
        console.log("this.state.bracket")
        console.log(this.state.bracket)
        return (
            <div>
                <Row>
                    {
                        this.renderBracket()
                    }
                </Row>
                {this.state.showWinner &&
                    <div>
                        <h1>Winner is: {this.state.tournamentWinner} </h1>
                        <button onClick={this.distributeFunds}> Distribute Funds </button>
                        <h2> Total Prize Money is {this.state.prizeMoney} </h2>
                        <h2> Total Host Rake is {this.state.hostRake} </h2>
                    </div>
                }
            </div>
        )
    }
}

export default Tournament;