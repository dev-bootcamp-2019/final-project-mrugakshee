import React, { Component } from 'react';

class Registered extends Component {
    render() {
        return (
            <div>
                <h1>Registered</h1>
                { this.props.registrants.map((registrant, key) => {
                    return (
                        <h5 key={key}>{ registrant }</h5>
                    )
                })}
            </div>
        )
    }
}

export default Registered;