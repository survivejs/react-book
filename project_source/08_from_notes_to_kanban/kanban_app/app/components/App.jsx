import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';

import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

@persist(LaneActions.init, LaneStore, storage, 'lanes')
export default class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.addLane}>+</button>
        <AltContainer
          stores={[LaneStore]}
          inject={{
            items: () => LaneStore.getState().lanes || [],
          }}
        >
          <Lanes />
        </AltContainer>
      </div>
    );
  }
  addLane() {
    LaneActions.create('New lane');
  }
}
