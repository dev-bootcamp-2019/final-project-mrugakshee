import React, { Component } from 'react';
import TournamentContract from './contracts/Tournament.json';
import getWeb3 from './utils/getWeb3';


// Components
import Register from './components/Register';
import Registered from './components/Registered';
import Tournament from './components/Tournament';
import Header from './components/Header';

// Global Styles
import './App.css';

// Ant Design Library
import 'antd/dist/antd.css'
import { Layout, Row, Col, Button } from 'antd';

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
      rakePercent: 0,
      registrationFee: 0, // init
      registrants: [], // init
      events: [], // Prevent double firing events,
      startTournament: false, // Hides/Displays the Tournament,
      tournamentEnd: false // Indicates whether or not the tournament has finished
    };

    this.initPastEvents = this.initPastEvents.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
    this.startTournament = this.startTournament.bind(this);
  }

  componentWillMount = async () => {
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
        deployedNetwork && deployedNetwork.address
        // '0x826543d7400e54139758f26C754DdC231607A455',
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
    }
  };

  init = async () => {
    const { contract } = this.state;

    // Init the numberOfPlayers variable
    contract.methods.numberOfPlayers().call((err, res) => {
      this.setState({
        numberOfPlayers: res
      }, this.initPastEvents);
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

    contract.methods.rakePercent().call((err, res) => {
      this.setState({
        rakePercent: res
      });
    });


    ////////////////////////////////////////////////////////////////////

    // Init Event Listeners

    // Event listener for ConfirmRegistrant
    contract.events.ConfirmRegistrant((err, res) => {
      if (!this.state.events[res.id]) {
        let newRegistrants = this.state.registrants;
        newRegistrants.push(res.returnValues.registrantAddress);
        this.handleEvent(res.id);
        this.setState({
          registrants: newRegistrants,
          numberOfPlayers: parseInt(this.state.numberOfPlayers) + 1
        });
      }
    });

    // Event Listener for MoneyCollected
    contract.events.MoneyCollected((err, res) => {
      if (!this.state.events[res.id]) {
        this.handleEvent(res.id);
        this.setState({
          totalMoneyCollected: res.returnValues.value
        });
      }
    });

    contract.events.TournamentEnd((err, res) => {
      if (!this.state.events[res.id]) {
        this.handleEvent(res.id);
        this.setState({
          tournamentEnd: true
        });
      }
    });
  };

  handleEvent(id) {
    let newEvents = this.state.events;
    newEvents[id] = true;
    this.setState({
      events: newEvents
    });
  }

  initPastEvents = () => {
    this.state.contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest'
    }, (err, events) => {
      events.map((event) => {
        switch (event.event) {
          case 'ConfirmRegistrant': {
            let newRegistrants = this.state.registrants;
            newRegistrants.push(event.returnValues.registrantAddress);
            this.setState({
              registrants: newRegistrants,
            });
            break;
          }
          case 'StartTournament': {
            this.setState({
              startTournament: true
            });
            break;
          }
          case 'TournamentEnd': {
            this.setState({
              tournamentEnd: true
            });
            break;
          }
          default:
            break;
        }
      });
    });
  }

  startTournament = async () => {
    if (this.state.numberOfPlayers === 0) {
      this.setState({ reqText: 'Please register players!' });
    } else if (parseInt(this.state.numberOfPlayers) === 1) {
      this.setState({ reqText: 'Please register at least 1 more player!' });
    } else {
      await this.state.contract.methods.startTournament().send(
        { from: this.state.contract.defaultAccount }
      );
      this.setState({ startTournament: true });
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className='App'>
        <Header {...this.state} />
        <Layout>
          <Content className='contentWrapper'>
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={24}>
                    <h1>Smart Tournament Bracket System</h1>
                  </Col>
                  <Col span={24}>
                    <Register {... this.state} />
                  </Col>
                  <Col span={24}>
                    {this.state.startTournament ?
                      <Tournament {... this.state} /> : 
                      <div>
                        <h4 id='tournaReq'>{this.state.reqText}</h4>
                        <Button type='primary' onClick={this.startTournament} disabled={this.state.start} >
                          Start Tournament
                        </Button>
                      </div>
                    }
                  </Col>
                </Row>
              </Col>
              <Col span={6}>
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
