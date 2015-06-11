import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';

import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

const storageName = 'kanban_storage';

@persist(storage, storageName, () => alt.takeSnapshot())
export default class App extends React.Component {
  constructor() {
    super();

    console.log('initial data', storage.get(storageName));

    // XXX: problem is that NoteStores don't exist yet
    alt.bootstrap(storage.get(storageName));
  }
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
