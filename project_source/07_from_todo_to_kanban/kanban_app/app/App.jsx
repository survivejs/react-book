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
          <button onClick={this.addLane}>Add lane</button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) =>
            <Lane key={'lane' + i} {...lane} />
          )}
        </div>
      </div>
    );
  }
  addLane() {
    console.log('add lane');
  }
}
