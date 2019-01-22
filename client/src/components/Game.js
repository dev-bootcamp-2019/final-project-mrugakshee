import React, { Component } from 'react';
import Tournament from './Tournament';

class Game extends Component {
    render () {
        // @TODO - retrieve players from gameContract
        // @TODO - create "Play Game" button
        //  @TODO - Retrieve and display winner(from an event)
        return (<h1> This is Game address {this.props.gameContract._address}</h1>);
    }
}

export default Game;
