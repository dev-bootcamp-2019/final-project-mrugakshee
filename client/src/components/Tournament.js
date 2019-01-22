import React, { Component } from 'react';
import TrivialGameContract from '../contracts/TrivialGame.json';
import Game from './Game';

class Tournament extends Component {
    constructor(props) {
        super(props)
        this.state = {
            games: []
        }
        this.fetchGame = this.fetchGame.bind(this);
    }

    componentWillMount = async () => {
        for (let i = 0; i < this.props.numberOfPlayers - 1; i++) {
            this.fetchGame(i);
        }
    }

    fetchGame(gameID) {
        this.props.contract.methods.games(gameID).call((err, res) => {
            let G = new this.props.web3.eth.Contract(
                TrivialGameContract.abi,
                res
            );
            let newGames = this.state.games;
            newGames[gameID] = G;
            this.setState({ games: newGames })
            console.log("res in fetchGame")
            console.log(this.state.games[gameID])
            console.log("err in fetchGame")
            console.log(err)
        });
    }

    render() {
        // Render the games array in the return function.
        //  make there be a button for each game, which will call a "play" function eventually ... 
        //  render each player
        // After the play button is pressed, the winner for the game should show up
        console.log('----- Tournament()');
        console.log('...props');
        console.log(this.props);
        console.log('...state');
        console.log(this.state);
        return (
            Object.keys(this.state.games).map((index, game) => {
                return (
                    <div key={this.state.games[index].address}>
                        < Game
                            gameContract={ this.state.games[index] }
                        />
                    </div>
                )
            })
        )
    }
}


export default Tournament;
