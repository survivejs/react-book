'use strict';
import React from 'react';
import Lane from './Lane';
import AppActions from './AppActions';
import appStore from './AppStore';
import alt from './alt';
import persist from './persist';
import storage from './storage';

const actions = alt.createActions(AppActions);
const store = alt.createStore(
  appStore(actions),
  'AppStore'
);

export default class App extends React.Component {
  constructor() {
    super();

    this.actions = actions;
    this.store = store;
    this.state = this.store.getState();
  }
  // XXXXX: push to a behavior
  componentDidMount() {
    this.store.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    this.store.unlisten(this.storeChanged.bind(this));
  }
  storeChanged() {
    this.setState(this.store.getState());
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

// XXXXX: changes made to child stores won't show up here
// -> add functional lenses? baobab
export default persist(App, actions.init, store, storage, 'app');
