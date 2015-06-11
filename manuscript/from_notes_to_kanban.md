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

import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import persist from '../decorators/persist';
import {storage, storageName, getInitialData} from '../libs/storage';

@persist(storage, storageName, () => JSON.parse(alt.takeSnapshot()))
export default class App extends React.Component {
  constructor() {
    super();

    LaneActions.init(getInitialData('LaneStore'));
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

Note that the implementation of `../libs/storage` has been changed to make it easier to operate on it through a more complex hierarchy. We'll need this later when we attach more stores to the system.

**app/libs/storage.js**

```javascript
export const storageName = 'kanban_storage';

export const storage = {
  get: function(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    }
    catch(e) {
      return null;
    }
  },
  set: function(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }
};

export function getInitialData(storeName) {
  var o = storage.get(storageName);

  return o && o[storeName];
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

**app/components/Lanes.jsx**

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
      <div className='lanes'>
        lanes should go here
      </div>
    );
  }
}
```

The current implementation doesn't do much. We still need to model `Lane` and attach `Notes` to that.

## Modeling `Lane`

To start with a `Lane` is pretty much what our `App` was earlier. This time around we'll want to render a header that contains name and a control for adding new notes within it.

First of all let's extend the `render` method of `Lanes` to make some room for individual lanes:

**app/components/Lanes.jsx**

```javascript
import Lane from './Lane';

...

render() {
  const lanes = this.props.items;

  return (
    <div className='lanes'>{lanes.map((lane, i) => {
      return <Lane className='lane' key={'lane-' + i} {...lane}/>;
    })}</div>
  );
}
```

Next we can model `Lane` based on our earlier work with `App`.

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';

import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
  }) {
    super(props);

    NoteActions.init();
  }
  render() {
    return (
      <div {...this.props}>
        <div className='header'>
          <div className='name'>{name}</div>
          <button onClick={this.addNote.bind(this)}>+</button>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            items: () => NoteStore.getState().notes || [],
          }}
        >
          <Notes onEdit={this.noteEdited.bind(this)} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      NoteActions.update(id, note);
    }
    else {
      NoteActions.remove(id);
    }
  }
}
```

Now we have something that sort of works. You can see there's something seriously wrong, though. If you add new Notes to a Lane, the Note appears to each Lane. Also if you modify a Note, also other Lanes update. In addition created Notes aren't persisted correctly. Just Lane data appears to get saved.

The reason why this happens is quite simple. Currently out `NoteStore` is a singleton. Even though this behavior is often convenient, it's definitely not the right for our application. We'll need to convert those singletons into separate instances.

## Going from Note Singletons to Instances

TODO

## Conclusion
