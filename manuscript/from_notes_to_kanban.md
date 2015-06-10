# From Notes to Kanban

![Kanban board](/images/kanban.png)

So far we have managed to set up a nice little development environment and develop an application for keeping track of notes in `localStorage`. We have still work to do in order to turn this into a real Kanban as pictured above.

Most importantly our system is missing the concept of Lane. A Lane is something that should be able to contain multiple Notes within itself. In the current system that is implicit. We'll need to extract that into a component of its own.

## Extracing Lanes

As earlier we can use the same idea of two components here. There will be a component for higher level (ie. `Lanes`) and for lower level (ie. `Lane`). The higher level component will deal with aspects such as persistency and lane ordering. An individual `Lane` will just render its contents (ie. name and `Notes`) and provide basic manipulation operations as needed.

As a first step we will need to make some room for `Lanes` at our `App` level. Consider the example below:

**app/components/App.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';

import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

const laneStorageName = 'lanes';

@persist(storage, laneStorageName, () => LaneStore.getState())
export default class App extends React.Component {
  constructor() {
    super();

    LaneActions.init(storage.get(laneStorageName));
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
```

Just to get the code compile here are initial implementations for some new actions and a store.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

class LaneActions {
  init(lanes) {
    this.dispatch(lanes);
  }
  create(name) {
    this.dispatch(name);
  }
}

export default alt.createActions(LaneActions);
```

**app/stores/LaneStore.js**

```javascript
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);
  }
  init(data) {
    this.setState(data || {lanes: []});
  }
  create(name) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.concat({
        name: name,
      })
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

The idea is the same as before with lanes. We are also going to need that `Lanes` container.

**app/component/Lanes.jsx**

```javascript
import React from 'react';

export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);
  }
  render() {
    return (
      <div>
      lanes should go here
      </div>
    );
  }
}
```

The current implementation doesn't do much. We still need to model `Lane` and attach `Notes` to those.

## Modeling `Lane`



## Conclusion
