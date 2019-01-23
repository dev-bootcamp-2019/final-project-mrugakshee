import React, { Component } from 'react';
import Tournament from './Tournament';

class Game extends Component {
    constructor(props) {
        super(props)
        this.state = {
            LevelOne: this.props.numberOfPlayers / 2,
            winner: ''
        }
        this.playGame = this.playGame.bind(this);
        console.log(this.state.gameContract)
        console.log("this is props in game")
        console.log(this.props)
    }

    playGame = async () => {
        let p1 = this.props.registrants[0];
        let p2 = this.props.registrants[1];
        const res = await this.props.gameContract.methods.play(p1, p2).send(
            { from: this.props.contract.defaultAccount }
        );
        console.log("this is response in Game");
        console.log(res);
        this.setState({
            winner: res.events.Winner.returnValues.winner
        })
    }

    render () {
        // @TODO - retrieve players from gameContract
        // @TODO - create "Play Game" button
        //  @TODO - Retrieve and display winner(from an event)
        // {this.props.gameContract._address}


        return (
            <div>       
                <button onClick={this.playGame}>Play game</button>
                <h1>Winner is {this.state.winner}</h1>
            </div>
        );
    }
}

export default Game;
