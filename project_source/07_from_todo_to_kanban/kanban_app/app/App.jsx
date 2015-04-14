'use strict';
import React from 'react';
import Lane from './Lane';
import AppActions from './actions/AppActions';
import appStore from './stores/AppStore';
import finalStore from './stores/FinalStore';
import alt from './alt';
import persist from './behaviors/persist';
import connect from './behaviors/connect';
import storage from './storage';

const actions = alt.createActions(AppActions);
const store = alt.createStore(
  appStore(actions),
  'AppStore'
);

export default class App extends React.Component {
  constructor(props: {
    lanes: Array;
  }) {
    super(props);

    this.actions = actions;
    this.store = store;
  }
  render() {
    var lanes = this.props.lanes;

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
    actions.createLane({
      name: 'New lane',
      todos: []
    });
  }
}

// XXXXX: changes made to child stores won't show up here
// -> add functional lenses? baobab
export default persist(
  connect(App, store),
  actions.init,
  finalStore(alt),
  storage,
  'app'
);
