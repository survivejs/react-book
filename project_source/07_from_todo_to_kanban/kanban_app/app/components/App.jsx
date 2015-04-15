'use strict';
import React from 'react';
import Baobab from 'baobab';
import Lane from './Lane';
import connect from '../decorators/connect';
import storage from '../libs/storage';
import appActions from '../actions/AppActions';

const appStorage = 'app';
const tree = new Baobab(storage.get(appStorage) || {
  // {name: <str>, todos: [{task: <str>}]}
  lanes: []
});
const cursor = tree.root();

window.addEventListener('beforeunload', function() {
  storage.set(appStorage, cursor.get());
}, false);

class App extends React.Component {
  constructor(props: {
    lanes: Array;
  }) {
    super(props);

    this.actions = appActions(cursor);
  }
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.actions.createLane.bind(null, 'New lane')}>
            Add lane
          </button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) =>
            <Lane key={'lane' + i} cursor={cursor.select('lanes', i)} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(App, cursor);
