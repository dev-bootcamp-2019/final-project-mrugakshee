import React, { Component } from 'react';
import TrivialGameContract from '../../contracts/TrivialGame.json';
import Game from '../Game';

import { toEther, EMPTY_ADDRESS } from '../../utils/web3helper';

import { Row, Col, Button } from 'antd';
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
            showWinner: false
        }
        this.checkGamesInBracket = this.checkGamesInBracket.bind(this);
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

    componentWillMount = () => {
        let tempStack = this.state.stack;
        for (let j = this.props.numberOfPlayers - 1; j >= 0; j--) {
            tempStack.push(j);
        }

        this.setState({ stack: tempStack }, async () => {
            for (let i = 0; i < this.props.numberOfPlayers - 1; i++) {
                await this.fetchGame(i);
            }

            let returnedMod = await this.findMod();
            this.setState({ mod: returnedMod }, async () => {
                await this.createBracket();
                this.insertPlayers();
                this.initWinnerEventListeners();
            });
        });
    }

    checkGamesInBracket = () => {
        this.state.bracket.map((game, index) => {
            game.game.methods.playerOne().call((err, res) => {
                if (res !== EMPTY_ADDRESS) {
                    let newBracket = this.state.bracket;
                    newBracket[index].p1 = res;
                    this.setState({
                        bracket: newBracket
                    });
                }
            });

            game.game.methods.playerTwo().call((err, res) => {
                if (res !== EMPTY_ADDRESS) {
                    let newBracket = this.state.bracket;
                    newBracket[index].p2 = res;
                    this.setState({
                        bracket: newBracket
                    });
                }
            });

            game.game.methods.winner().call((err, res) => {
                if (res !== EMPTY_ADDRESS) {
                    let newBracket = this.state.bracket;
                    let { tournamentWinner, showWinner, currentTier, winnerStack } = this.state;

                    newBracket[index].winner = res;

                    // The last game has been played and has a winner. The Tournament is Over.
                    if (index === this.state.bracket.length - 1) {
                        tournamentWinner = res;
                        currentTier = game.tier;
                        showWinner = true;
                    } else if (newBracket[index].tier === currentTier) {
                        winnerStack.push(this.props.registrants.indexOf(res));
                    }

                    this.setState({
                        bracket: newBracket,
                        tournamentWinner,
                        currentTier,
                        showWinner
                    }, this.checkIncrementTier);
                }
            });
        });
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
                            newBracket[indexOfPlayedGame].winner = res.returnValues.winner;
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
        });
    }

    distributeFunds() {
        this.props.contract.methods.distributeFunds().send(
            { from: this.props.contract.defaultAccount }
        );
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
        return 0;
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

        for (let i = 0; i < inZerothTier; i++) {
            newBracket.push({
                game: games[i],
                tier: 1,
                winner: '',
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
        }, this.checkGamesInBracket);
    }

    /*
     * checkIncrementTier()
     *
     * This function runs after every Winner event is triggered
     * - The purpose of this function is to determine if all the games in the
     *    current tier have finished being played
     */
    checkIncrementTier() {
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
                    <h3> {tierIndex + 1} </h3>
                    <Row>
                        {
                            this.state.bracket.map((game, gameIndex) => {
                                return (this.state.currentTier >= game.tier && tierIndex + 1 === game.tier) &&
                                    (
                                        <div key={gameIndex}>
                                            < Game
                                                {...this.props}
                                                game={game}
                                                index={gameIndex} />
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
        return (
            <Row className='tournamentComponent'>
                <Col span={24}>
                    {
                        this.renderBracket()
                    }
                </Col>
                {this.state.showWinner &&
                    <Col span={24} className="tournamentWinner">
                        <Row>
                            <Col span={16} >
                                <h2>The Winner of the Tournament is: {this.state.tournamentWinner} </h2>
                                <Button type="primary" disabled={this.props.tournamentEnd} onClick={this.distributeFunds}> Distribute Funds </Button>
                            </Col>
                            <Col span={8}>
                                <h2> Total Prize Money is {toEther(this.props.web3, (this.props.totalMoneyCollected * ((100 - this.props.rakePercent) / 100)))} </h2>
                                <h2> Total Host Rake is {toEther(this.props.web3, this.props.totalMoneyCollected / this.props.rakePercent)} </h2>
                            </Col>
                        </Row>
                    </Col>
                }
            </Row>
        )
    }
}

export default Tournament;