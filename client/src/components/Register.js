import React, { Component } from 'react';
import Tournament from './Tournament';
import { message } from 'antd';

class Register extends Component {
    constructor (props) {
        super(props);
        this.state = {
            totalAmount: 0,
            inputValue: '',
            registrants: [],
            start: false,
            reqText: ''
        };
        this.register = this.register.bind(this);
        this.updateInput = this.updateInput.bind(this);
        this.startTournament = this.startTournament.bind(this);
    }

    // @TODO - clean up state variables, for eg, get rid of totalAmount

    updateInput = (event) => {
        this.setState({ inputValue: event.target.value });
    }

    register = async () => {
        console.log('----- register()');
        const { contract } = this.props;


        // 1000000000000000000 WEI = 1 Ether
        const response = await contract.methods.register().send(
            // @TODO - change value to registrationFee
            { from: this.state.inputValue || contract.defaultAccount, gas: 600000, value: 1000000000000000000 }
        );

        console.log('RESPONSE FROM CLICK');
        console.log(response);
    }

    startTournament = async () =>{
        if (this.props.numberOfPlayers === 0) {
            this.setState({reqText: "Please register players!"});
        } else if (this.props.numberOfPlayers % 2 !== 0) {
            this.setState({reqText: "Even number of players required to start tournament."});
        } else {
            await this.props.contract.methods.startTournament().send(
                { from: this.props.contract.defaultAccount, gas: 6000000 }
            );
            this.setState({start: true});
        }
    }

    render() {
        return (
            <div>
                <h1>Tournament X</h1>

                <div>
                    <label>Account: </label>
                    <input
                        type='text'
                        value={ this.state.inputValue }
                        onChange={this.updateInput}
                        name='AccountAddress'
                        id='account'
                        placeholder='Enter Account Address'
                    />
                    <button onClick={this.register}>Register</button>
                    
                    <h3>Amount received: {this.state.totalAmount}</h3>
                    <h3>Max Players: {this.props.maxPlayers}</h3>
                    <h3>Total Players: {this.props.numberOfPlayers}</h3>
                </div>
                <div>
                    <h4 id="tournaReq">{this.state.reqText}</h4>
                    <button onClick={this.startTournament} disabled={this.state.start} >Start Tournament</button>
                </div>
                <div>
                    { this.state.start && <Tournament { ... this.props } /> }
                </div>
            </div>
        )
    }
}

export default Register;