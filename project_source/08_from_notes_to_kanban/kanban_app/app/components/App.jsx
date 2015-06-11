import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';

import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';
import {getInitialData} from '../libs/utils';

const STORAGE_NAME = 'kanban_storage';

@persist(storage, STORAGE_NAME, () => JSON.parse(alt.takeSnapshot()))
export default class App extends React.Component {
  constructor() {
    super();

    LaneActions.init(getInitialData(storage, STORAGE_NAME, 'LaneStore'));
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
