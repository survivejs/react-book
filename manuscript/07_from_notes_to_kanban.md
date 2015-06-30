# From Notes to Kanban

![Kanban board](images/kanban.png)

So far we have managed to set up a nice little development environment and develop an application for keeping track of notes in `localStorage`. We still have work to do in order to turn this into a real Kanban as pictured above.

Most importantly our system is missing the concept of Lane. A Lane is something that should be able to contain multiple Notes within itself. In the current system that is implicit. We'll need to extract that into a component of its own.

## Extracting `Lanes`

As earlier we can use the same idea of two components here. There will be a component for higher level (ie. `Lanes`) and for lower level (ie. `Lane`). The higher level component will deal with aspects such as persistency and lane ordering. An individual `Lane` will just render its contents (ie. name and `Notes`) and provide basic manipulation operations as needed.

As a first step we will need to make some room for `Lanes` at our `App` level. Consider the example below:

**app/components/App.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';

import alt from '../libs/alt';
import Lanes from './Lanes';
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

Just to get the code to compile here are the initial implementations for some new actions and a store.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('init', 'create');
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
import React from 'react';

import Lane from './Lane';

export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);
  }
  render() {
    return (
      <div className='lanes'>{this.props.items.map((lane, i) =>
          <Lane className='lane' key={'lane-' + i} i={i} {...lane} />
      )}</div>
    );
  }
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
    i: number;
  }) {
    super(props);

    NoteActions.init();
  }
  render() {
    const {i, name, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <div className='lane-name'>{name}</div>
          <div className='lane-add-note'>
            <button onClick={() => addNote()}>+</button>
          </div>
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
  noteEdited(id, task) {
    if(note) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.remove(id);
    }
  }
}
```

Now we have something that sort of works. You can see there's something seriously wrong, though. If you add new Notes to a Lane, the Note appears to each Lane. Also if you modify a Note, also other Lanes update. In addition created Notes aren't persisted correctly. Just Lane data appears to get saved.

The reason why this happens is quite simple. Currently out `NoteStore` is a singleton. Even though this behavior is often convenient, it's definitely not the right choice for our application. We'll need to convert those singletons into separate instances.

## Going from Note Singletons to Instances

A good first step towards getting rid of our Note singletons is to make our `NoteStore` more generic. We simply need to remove its direct dependency on Alt. Consider the code below:

**app/stores/NoteStore.js**

```javascript
export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  ...
}
```

**app/actions/NoteActions.js**

`NoteActions` require similar treatment as well. Otherwise we'll end up transmitting the same signal to all of our stores, and we are back to square one.

```javascript
export default (alt) => alt.generateActions('init', 'create', 'update', 'remove');
```

To make it all work together we need to tweak `Lane` to maintain actions and a store.

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';

import alt from '../libs/alt';
import {getInitialData} from '../libs/storage';
import Notes from './Notes';
import createNoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    i: number;
  }) {
    super(props);

    this.actions = createNoteActions(alt);

    const storeName = 'NoteStore-' + this.props.i;
    this.store = alt.createStore(NoteStore, storeName, this.actions);
    this.actions.init(getInitialData(storeName));
  }
  render() {
    const {i, name, ...props} = this.props;

    return (
      <div {...props}>
      ...
      </div>
    );
  }
  addNote() {
    this.actions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      this.actions.update({id, note});
    }
    else {
      this.actions.remove(id);
    }
  }
```

Now we have something that mostly works. We have separate lanes, you can add new notes to them and modify/remote them. There are still a few bits we're missing. Namely lane name editing and lane removal. Let's get those done next.

## Implementing Edit/Remove for `Lane`

We can follow the same idea as for `Note` here. Ie. if you click `Lane` name, it should become editable. In case the new name is empty, we'll simply remove it. Given it's the same behavior we can extract it from `Note` and then reuse at `Lane`.

Given `Note` already contains some of the logic we need, we can generalize the component. Simply rename `Note.jsx` as `Editable.jsx`. Make `Notes.jsx` point at `Editable` instead of `Note`.

Next we should replace `Lane` name to be rendered through `Editable`:

**app/components/Lane.jsx**

```javascript
...

import Editable from './Editable';

...

<Editable className='lane-name' value={name}
  onEdit={this.nameEdited.bind(this, this.props.i)} />

...

nameEdited(id, name) {
  console.log('edited lane name', id, name);
}
```

If you try to edit a lane name now, you should see a console print. We still need some logic (ie. actions and store tweaks) to make this work. A good starting point is to sketch out the component level logic:

**app/components/Lane.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

...

nameEdited(id, name) {
  if(name) {
    LaneActions.update({i, name});
  }
  else {
    LaneActions.remove(i);
  }
}
```

This is exactly the same logic as for notes. In fact it is be possible to factor the behavior into a method of its own. This can be done by extracting actions into a parameter. As duplication is the root of all evil, let's change it to this form:

**app/components/Lane.jsx**

```javascript
...

<Editable className='lane-name' value={name}
  onEdit={this.edited.bind(this, LaneActions, 'name', this.props.i)} />

...

<Notes onEdit={this.edited.bind(this, this.actions, 'task')} />

...

edited(actions, field, id, value) {
  if(value) {
    actions.update({id, [field]: value});
  }
  else {
    actions.remove(id);
  }
}
```

Now our editing logic is in a single place. We could have done this modification later but this felt like a good place to do that. Sometimes it can be justified to get rid of duplicates and push them to methods, components or decorators. We are still missing some of the logic to make `Lane` edit/remove work, though. To achieve that we need to extend `Lane` actions and store.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('init', 'create', 'update', 'remove');
```

It's the same idea as for `NoteActions` apart from the way we instantiate the stores. It would be possible to extract the instantiation logic from here as well. That could be a good idea especially if you want to have multiple boards in your application.

One radical option would be to use the same base class for both `LaneActions` and `NoteActions` but that feels like a premature optimization as it is difficult to say how these APIs might evolve. Some amount of duplication can be acceptable.

We still need those `LaneStore` methods. Not surprisingly it's going to be very similar to the `NoteStore` implementation. Again, a possible place to clean up later.

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  update({id, name}) {
    const lanes = this.lanes;

    lanes[id].name = name;

    this.setState({lanes});
  }
  remove(id) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.slice(0, id).concat(lanes.slice(id + 1)),
    });
  }
}

export default alt.createStore(LaneStore);
```

After these changes you should be able to modify lane names and remove lanes. Even persistency should just work without requiring any further tweaking. The implementation could be trimmed and some code could be removed but for now it's nice to have some room to maneuver. Who knows what sort of requirements might come up after all.

## Conclusion

In this chapter we managed to generalize our application somehow. We actually have something you can sort of use! It's not pretty and the user experience is quite horrible. Still, it's better than before. Before focusing on advanced functionality let's try to make the application look a little better and study some styling approaches.
