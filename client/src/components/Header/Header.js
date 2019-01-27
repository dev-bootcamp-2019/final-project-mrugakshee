import React, { Component } from 'react';
import { Col } from 'antd';

class Header extends Component {
    render() {
        return (
            <div className='header'>
                <Col span={12}>
                    <h4>Contract Address: {this.props.contract.options.address}</h4>
                </Col>

                <Col span={12}>
                    <h4>Current Account: {this.props.web3.eth.defaultAccount}</h4>
                </Col>
            </div>
        );
    }
}

export default Header;