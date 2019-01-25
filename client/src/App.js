import React, { Component } from 'react';
import TournamentContract from './contracts/Tournament.json';
import getWeb3 from './utils/getWeb3';
import Register from './components/Register'
import Registered from './components/Registered'
import './App.css';

// Ant Design Library
import { Layout, Row, Col } from 'antd';
import 'antd/dist/antd.css'

const { Content } = Layout;
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      accounts: null,
      contract: null,
      numberOfPlayers: 0, // init
      maxPlayers: 0, // init
      totalMoneyCollected: 0, //init
      registrationFee: 0, // init
      registrants: [], // init
      events: [] // Prevent double firing events
    };

    this.initRegistrants = this.initRegistrants.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
  }

  componentWillMount = async () => {
    console.log('----- App:ComponentWillMount()');
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      web3.eth.defaultAccount = accounts[0];

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TournamentContract.networks[networkId];

      const instance = new web3.eth.Contract(
        TournamentContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      console.log(instance);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  init = async () => {
    console.log('----- init()');
    const { contract } = this.state;

    this.initRegistrants();

    // Init the numberOfPlayers variable
    contract.methods.numberOfPlayers().call((err, res) => {
      this.setState({
        numberOfPlayers: res
      });
    });

    // Init the maxPlayers variable
    contract.methods.maxPlayers().call((err, res) => {
      this.setState({
        maxPlayers: res
      });
    });

    // Init the registrationFee variable
    contract.methods.registrationFee().call((err, res) => {
      this.setState({
        registrationFee: res
      });
    });

    //  Init the totalMoneyCollected variable
    contract.methods.totalMoneyCollected().call((err, res) => {
      this.setState({
        totalMoneyCollected: res
      });
    });


    ////////////////////////////////////////////////////////////////////

    // Init Event Listeners

    // Event listener for ConfirmRegistrant
    contract.events.ConfirmRegistrant((err, res) => {
      if (err) {
        // @TODO - Handle Error
      } else {
        if (!this.state.events[res.id]) {
          let newRegistrants = this.state.registrants;
          newRegistrants.push(res.returnValues.registrantAddress);
          this.handleEvent(res.id);
          this.setState({
            registrants: newRegistrants,
            numberOfPlayers: parseInt(this.state.numberOfPlayers) + 1
          });
        }
      }
    });

    // Event Listener for MoneyCollected
    contract.events.MoneyCollected((err, res) => {
      if (err) {
        // @TODO - Handle Error
      } else {
        if (!this.state.events[res.id]) {
          this.handleEvent(res.id);
          this.setState({
            totalMoneyCollected: res.returnValues.value
          });
        }
      }
    });

    // @TODO - Event Listener for CreateGame
    // @TODO - Event Listener for StartTournamnet
  };

  handleEvent(id) {
    let newEvents = this.state.events;
    newEvents[id] = true;
    this.setState({
      events: newEvents
    });
  }

  initRegistrants = () => {
    this.state.contract.getPastEvents('ConfirmRegistrant', {
      fromBlock: 0,
      toBlock: 'latest'
    }, (err, events) => {
      let newRegistrants = this.state.registrants;
      for (let i = 0; i < events.length; i++) {
        newRegistrants.push(events[i].returnValues.registrantAddress);
      }
      this.setState({
        registrants: newRegistrants,
      });
    });
  }



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className='App'>
        <Layout>
          <Content>
            <Row>
              <Col span={16}>
                <Register {... this.state} />
              </Col>
              <Col span={8}>
                <Registered {... this.state} />
              </Col>
            </Row>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default App;
