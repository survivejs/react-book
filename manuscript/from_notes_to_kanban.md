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

## Conclusion
