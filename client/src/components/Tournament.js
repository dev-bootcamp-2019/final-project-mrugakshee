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
        });
    }

    renderGame = async () => {
        
    }

    render() {
        // Render the games array in the return function.
        //  make there be a button for each game, which will call a "play" function eventually ... 
        //  render each player
        // After the play button is pressed, the winner for the game should show up
        return (
            <div></div>
            
        )

        // gameContract={ this.state.games[index] }
        // { ...this.props }
    }
}

export default Tournament;


// Object.keys(this.state.games).map((index, game) => {
//     return (
//         (this.props.numberOfPlayers / 2 > index) && <div key={index}>
//             <h3>Game: {index + 1} </h3>
//             < Game { ...this.props }
//             gameContract={ this.state.games[index] }
//             index={index}
//             />
//         </div>
//     )
// })