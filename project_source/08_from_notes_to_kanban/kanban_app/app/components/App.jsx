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
        <button onClick={this.addItem.bind(this)}>+</button>
        <AltContainer
          stores={[LaneStore]}
          inject={{
            items: () => LaneStore.getState().lanes || []
          }}
        >
          <Lanes />
        </AltContainer>
      </div>
    );
  }
  addItem() {
    LaneActions.create('New lane');
  }
  itemEdited(id, task) {
    if(task) {
      LaneActions.update(id, task);
    }
    else {
      LaneActions.remove(id);
    }
  }
}
