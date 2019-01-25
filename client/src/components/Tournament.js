import React, { Component } from 'react';
import TrivialGameContract from '../contracts/TrivialGame.json';
import Game from './Game';
import _ from 'lodash';

class Tournament extends Component {
    constructor(props) {
        super(props)
        this.state = {
            games: [],
            bracket: [],
            expOfTwo: [1, 2, 4, 8, 16, 32],
            tier: [1, 2, 3, 4, 5, 6],
            mod: 0,
            index: 0,
            currentTier: 1,
            playerIndex: 0,
            stack: []
        }
        this.fetchGame = this.fetchGame.bind(this);
        this.findMod = this.findMod.bind(this);
        this.createBracket = this.createBracket.bind(this);
        this.insertPlayers = this.insertPlayers.bind(this);
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
    }

    fetchGame = async (gameID) => {
        await this.props.contract.methods.games(gameID).call((err, res) => {
            let G = new this.props.web3.eth.Contract(
                TrivialGameContract.abi,
                res
            );
            let newGames = this.state.games;
            newGames[gameID] = G;
            this.setState({ games: newGames });
        });
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
        let otherTiers = inZerothTier;
        let changingIndex = this.state.index;
        let tierIndex = this.state.index;

        if (inZerothTier == 0) {
            inZerothTier = this.props.numberOfPlayers / 2;
        }

        for (let i = 0; i < inZerothTier; i++) {
            newBracket.push({
                game: games[i],
                tier: 1,
                p1: '',
                p2: ''
            });
        }


        for (let j = this.state.expOfTwo[this.state.index]; j > 0; j--) {
            // players 3 and 4 are exceptions!!
            for (let k = this.state.expOfTwo[changingIndex]; k > 0; k--) {
                // players 3 and 4 are exceptions!!
                if (this.props.numberOfPlayers == 3 || this.props.numberOfPlayers == 4) {
                    tierIndex = 1;
                }
                newBracket.push({
                    game: games[otherTiers],
                    tier: this.state.tier[tierIndex],
                    p1: '',
                    p2: ''
                });
                ++otherTiers;
            }
            ++otherTiers;
            --changingIndex;
            ++tierIndex;
        }
        this.setState({
            bracket: newBracket
        });
    }

    insertPlayers() {
        let newBracket = this.state.bracket;
        for (let i = 0; i < newBracket.length; i++) {
            if (newBracket[i].tier <= this.state.currentTier) {
                let x1 = this.state.stack.pop();
                let x2 = this.state.stack.pop();
                newBracket[i].p1 = this.props.registrants[x1];
                newBracket[i].p2 = this.props.registrants[x2];
            }
        }
        this.setState({
            bracket: newBracket
        });
    }


    render() {
        return (
            <div>
                {
                    this.state.bracket.map((game, index) => {
                        {
                            return this.state.currentTier >= game.tier &&
                                (
                                    <div key={index}>
                                        < Game
                                            {...this.props}
                                            game={game}
                                            gamesInTier={game.tier}
                                            index={parseInt(index)} />
                                    </div>
                                )
                        }
                    })
                }
            </div>
        )
    }
}

export default Tournament;