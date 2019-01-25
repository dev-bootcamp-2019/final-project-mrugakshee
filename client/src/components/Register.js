import React, { Component } from 'react';
import Tournament from './Tournament';
import { message } from 'antd';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            start: false,
            reqText: ''
        };
        this.register = this.register.bind(this);
        this.updateInput = this.updateInput.bind(this);
        this.startTournament = this.startTournament.bind(this);
    }

    updateInput = (event) => {
        this.setState({ inputValue: event.target.value });
    }

    register = async () => {
        console.log('----- register()');
        const { contract } = this.props;


        // 1000000000000000000 WEI = 1 Ether
        const response = await contract.methods.register().send(
            { from: this.state.inputValue || contract.defaultAccount, gas: 600000, value: this.props.registrationFee }
        );

    }

    startTournament = async () => {
        if (this.props.numberOfPlayers === 0) {
            this.setState({ reqText: "Please register players!" });
        } else if (parseInt(this.props.numberOfPlayers) === 1) {
            this.setState({ reqText: "Please register at least 1 more player!" });
        } else {
            await this.props.contract.methods.startTournament().send(
                { from: this.props.contract.defaultAccount }
            );
            this.setState({ start: true });
        }
    }

    render() {
        return (
            <div>
                <h1>Total Prize money: {this.props.totalMoneyCollected / 1000000000000000000} ether</h1>
                <h1>Registration Fee: {this.props.registrationFee / 1000000000000000000} ether </h1>

                <div>
                    <label>Account: </label>
                    <input
                        type='text'
                        value={this.state.inputValue}
                        onChange={this.updateInput}
                        name='AccountAddress'
                        id='account'
                        placeholder='Enter Account Address'
                    />
                    <button onClick={this.register}>Register</button>

                    <h3>Max Players: {this.props.maxPlayers}</h3>
                    <h3>Total Players: {this.props.numberOfPlayers}</h3>
                </div>
                <div>
                    <h4 id="tournaReq">{this.state.reqText}</h4>
                    <button onClick={this.startTournament} disabled={this.state.start} >Start Tournament</button>
                </div>
                <div>
                    {this.state.start && <Tournament {... this.props} />}
                </div>
            </div>
        )
    }
}

export default Register;