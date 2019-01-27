import React, { Component } from 'react';
import { Card, Row, Col, Button } from 'antd';

class Game extends Component {
    constructor(props) {
        super(props);
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
            <Row>
                <Col span={24}>
                    <p>Player 1: {p1}</p>
                </Col>

                <Col span={24}>
                    <p>VS.</p>
                </Col>

                <Col span={24}>
                    <p>Player 2: {this.props.game.p2}</p>
                </Col>
                
                <Col>
                    <Button block type="primary" disabled={this.props.game.winner} onClick={() => this.playGame(p1, p2)}>
                        Play game
                    </Button>
                </Col>
            </Row>
        )
    }

    playGame(p1, p2) {
        this.props.game.game.methods.play(p1, p2).send(
            { from: this.props.contract.defaultAccount }
        );
    }

    render() {
        return (
            <Row className='game'>
                <Col span={24}>
                    <Card bordered={true}>
                        <Col span={24}>
                            <h3> Game {this.props.index + 1}</h3>
                        </Col>
                        {this.setUpGame()}
                        {this.props.game.winner !== '' &&
                            <Col span={24} className="gameWinner">
                                <p>Winner is {this.props.game.winner}</p>
                            </Col>
                        }
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default Game;