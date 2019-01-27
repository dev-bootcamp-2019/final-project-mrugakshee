import React, { Component } from 'react';

import { Row, Col } from 'antd';

class Registered extends Component {
    render() {
        return (
            <Row className='registered'>
                <Col span={24}>
                    <h1>Registered Addresses</h1>
                </Col>
                <Col span={24}>
                    {this.props.registrants.map((registrant, key) => {
                        return (
                            <p className='registeredAddress' key={key}><span className='index'>{key + 1}:</span>{registrant}</p>
                        )
                    })}
                </Col>
            </Row>
        )
    }
}

export default Registered;