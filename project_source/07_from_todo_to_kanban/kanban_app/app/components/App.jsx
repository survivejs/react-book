'use strict';
import React from 'react';
import Baobab from 'baobab';
import {root} from 'baobab-react/decorators';
import Lanes from './Lanes';
import storage from '../libs/storage';
import appActions from '../actions/AppActions';

// XXXXX: push storage logic to a decorator
const appStorage = 'app';
const tree = new Baobab(/*storage.get(appStorage) ||*/ {
  lanes: []
}, {
  validate: {
    lanes: [{
      id: 'number',
      name: 'string',
      notes: [
        {
          id: 'number',
          task: 'string',
        }
      ]
    }]
  }
});
//const cursor = tree.root();

/*
window.addEventListener('beforeunload', function() {
  storage.set(appStorage, cursor.get());
}, false);
*/

@root(tree)
export default class App extends React.Component {
  constructor(props: {
    lanes: Array;
  }) {
    super(props);

    this.actions = appActions(tree);
  }
  render() {
    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.actions.createLane.bind(null, 'New lane')}>
            Add lane
          </button>
        </div>
        <Lanes />
      </div>
    );
  }
}
