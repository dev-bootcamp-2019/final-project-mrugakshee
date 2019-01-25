import React, { Component } from 'react';
import { Card, Row, Col } from 'antd';
import 'antd/dist/antd.css'

class Game extends Component {
    constructor(props) {
        super(props)
        this.state = {
            winner: '',
            index: this.props.index,
            winner: ''
        }
        this.playGame = this.playGame.bind(this);
        this.setUpGame = this.setUpGame.bind(this);
    }

    componentWillMount() {
        this.props.game.game.events.Winner((err, res) => {
            this.setState({
                winner: res.returnValues.winner
            });
        });
    }

    setUpGame() {
        let p1 = this.props.game.p1;
        let p2 = this.props.game.p2;

        return (
            <div>
                Player: {p1} VS. Player: {this.props.game.p2}
                <div>
                    <button onClick={() => this.playGame(p1, p2)}>Play game</button>
                </div>
            </div>
        )
    }

    playGame(p1, p2) {
        this.props.game.game.methods.play(p1, p2).send(
            { from: this.props.contract.defaultAccount }
        );
    }

    render() {

        return (
            <div>
                <Row>
                    <Col span={16}>
                        <Card bordered={true}>
                            <h3> Game {this.state.index + 1}</h3>
                            {this.setUpGame()}
                            {this.state.winner !== '' &&
                                <div>
                                    <p>Winner is {this.state.winner}</p>
                                </div>
                            }
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Game;