import React, { Component } from 'react';
import { Button, Input, Icon } from 'antd';
import { toEther } from '../../utils/web3helper';
import { Row, Col } from 'antd';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            reqText: ''
        };
        this.register = this.register.bind(this);
        this.updateInput = this.updateInput.bind(this);
    }

    updateInput = (event) => {
        this.setState({ inputValue: event.target.value });
    }

    emitEmpty = () => {
        this.userInput.focus();
        this.setState({ inputValue: '' });
    }

    register = async () => {
        const { contract } = this.props;


        // 1000000000000000000 WEI = 1 Ether
        const response = await contract.methods.register().send(
            { from: this.state.inputValue || contract.defaultAccount, gas: 600000, value: this.props.registrationFee }
        );
    }

    render() {
        const suffix = this.state.inputValue ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
        return (
            <Row className='registerComponent'>
                <Col span={12}>
                    <h2>Registration Fee: {toEther(this.props.web3, this.props.registrationFee)}</h2>
                    <h2>Total Money Collected: {toEther(this.props.web3, this.props.totalMoneyCollected)}</h2>
                </Col>
                <Col span={12}>
                    <h2>Max Players: {this.props.maxPlayers}</h2>
                    <h2>Total Players: {this.props.numberOfPlayers}</h2>
                </Col>

                <Col span={24}>
                    <Row>
                        <Col span={6}></Col>
                        <Col span={12}>
                            <label>Account Address: </label>
                            <Input
                                className="inputInRegister"
                                placeholder="Enter your Metamask account address"
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                suffix={suffix}
                                ref={node => this.userInput = node}
                                type='text'
                                value={this.state.inputValue}
                                onChange={this.updateInput}
                                name='AccountAddress'
                                id='account'
                            />
                            <Button
                                type="default"
                                disabled={this.props.startTournament ||
                                    !this.props.web3.utils.isAddress(this.state.inputValue)}
                                onClick={this.register}>

                                Register
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}

export default Register;