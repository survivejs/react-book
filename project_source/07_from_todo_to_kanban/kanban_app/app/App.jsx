'use strict';
import React from 'react';
import Lane from './Lane';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      lanes: [
        {
          name: 'Todo',
          todos: [
            {
              task: 'Learn Webpack'
            },
            {
              task: 'Do laundry'
            }
          ]
        },
        {
          name: 'Doing',
          todos: [
            {
              task: 'Learn React'
            }
          ]
        },
        {
          name: 'Done',
          todos: []
        }
      ]
    };
  }
  render() {
    var lanes = this.state.lanes;

    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.addLane.bind(this)}>Add lane</button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) => {
            var key = 'lane' + i;

            return <Lane key={key} storeKey={key} {...lane} />;
          }
          )}
        </div>
      </div>
    );
  }
  addLane() {
    this.setState({
      lanes: this.state.lanes.concat({
        name: 'New lane',
        todos: []
      })
    });
  }
}
