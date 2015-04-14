'use strict';
import React from 'react';
import Lane from './Lane';
import persist from '../behaviors/persist';
import connect from '../behaviors/connect';
import appActions from '../actions/AppActions';
import storage from '../storage';
import tree from '../tree';

const cursor = tree.root();
const actions = appActions(cursor);

export default class App extends React.Component {
  constructor(props: {
    lanes: Array;
  }) {
    super(props);
  }
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.addLane.bind(this)}>Add lane</button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) =>
            <Lane key={'lane' + i} cursor={cursor.select('lanes', i, 'todos')} {...lane} />
          )}
        </div>
      </div>
    );
  }
  addLane() {
    actions.createLane('New lane');
  }
}

export default connect(App, cursor);

// TODO: persist
/*
export default persist(
  connect(App, store),
  actions.init,
  store,
  storage,
  'app'
);
*/
