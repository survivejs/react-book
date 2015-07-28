# From Notes to Kanban

![Kanban board](images/kanban.png)

So far we have managed to set up a nice little development environment and develop an application for keeping track of notes in `localStorage`. We still have work to do in order to turn this into a real Kanban as pictured above.

Most importantly our system is missing the concept of Lane. A Lane is something that should be able to contain multiple `Notes` within itself. In the current system that is implicit. We'll need to extract that into a component of its own.

## Extracting `Lanes`

As earlier we can use the same idea of two components here. There will be a component for higher level (i.e. `Lanes`) and for lower level (i.e. `Lane`). The higher level component will deal with lane ordering. An individual `Lane` will just render its contents (i.e. name and `Notes`) and provide basic manipulation operations as needed.

Just as with Notes we are going to need a set of actions. For now it is enough if we can just create new lanes so we can create a corresponding action for that as below:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create');
```

In addition we are going to need a `LaneStore` and a method matching to `create`. The idea is pretty much the same as for `NoteStore` earlier. `create` will concatenate a new lane to the list of lanes. After that the change will propagate to the listeners (i.e. `FinalStore` and components).

**app/stores/LaneStore.js**

```javascript
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = this.lanes || [];
  }
  create(lane) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.concat(lane)
    });
  }
}

export default alt.createStore(LaneStore);
```

We are also going to need a stub for `Lanes`. We will expand this later. Now we just want something simple to show up.

**app/components/Lanes.jsx**

```javascript
import React from 'react';

export default class Lanes extends React.Component {
  render() {
    return (
      <div className='lanes'>
        lanes should go here
      </div>
    );
  }
}
```

Next we need to make room for `Lanes` at `App`. We will simply replace `Notes` references with `Lanes`, set up actions and store needed. Consider the example below:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.addItem}>+</button>
        <AltContainer
          stores={[LaneStore]}
          inject={ {
            items: () => LaneStore.getState().lanes || []
          } }
        >
          <Lanes />
        </AltContainer>
      </div>
    );
  }
  addItem() {
    LaneActions.create({id: uuid.v4(), name: 'New lane'});
  }
}
```

The current implementation doesn't do much. It just shows a plus button and *lanes should go here* text. We still need to model `Lane` and attach `Notes` to that to make this work.

## Modeling `Lane`

Each `Lane` will be able to render associated `Notes` just like our `App` did earlier. `Lanes` container in turn will render each `Lane` separately. It is analogous to `Notes` in this manner. The example below illustrates how to set up `Lanes`.

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane';

export default class Lanes extends React.Component {
  render() {
    const lanes = this.props.items;

    return <div className='lanes'>{lanes.map(this.renderLane)}</div>;
  }
  renderLane(lane) {
    return <Lane className='lane' key={`lane${lane.id}`} {...lane} />;
  }
}
```

In addition we are going to need `Lane` component to make this work. It will render `Lane` name and associated `Notes`. To make it easier to customize, I will keep the prop interface generic. In other words I'll allow `Lanes` to attach custom HTML attributes to each. This way the `className` declaration above will work.

I'll be using [Object rest syntax](https://github.com/sebmarkbage/ecmascript-rest-spread) (`{a, b, ...props} = this.props`) available as a Stage 1 feature. It is perfect for a case such as this as it will extract the props we don't need. This way we don't end up polluting the HTML element.

The example below has been modeled largely after our earlier implementation of `App`. It introduced Object rest syntax and will render an entire lane including its name and associated notes:

**app/components/Lane.jsx**

```javascript
import uuid from 'node-uuid';
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  render() {
    const {id, name, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <div className='lane-name'>{name}</div>
          <div className='lane-add-note'>
            <button onClick={this.addNote}>+</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => NoteStore.getState().notes || []
          } }
        >
          <Notes onEdit={this.noteEdited} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create({id: uuid.v4(), task: 'New task'});
  }
  noteEdited(id, task) {
    if(task) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.delete(id);
    }
  }
}
```

Now we have something that sort of works. You can see there's something seriously wrong, though. If you add new Notes to a Lane, the Note appears to each Lane. Also if you modify a Note, also other Lanes update.

The reason why this happens is quite simple. Our `NoteStore` is a singleton. This means every component that is listening to `NoteStore` will receive the same data. We will need to resolve this problem somehow.

## Making Lanes Responsible of Notes

Currently our `Lane` model is very simple. We are just storing an array of objects. Each of the objects knows its *id* and *name*. We'll need something more. Each `Lane` needs to know which `Notes` belong to it. If a `Lane` contained an array of `Note` ids, it could then filter and display the `Notes` belonging to it.

This means we'll need to extend the system to support this. When we `addNote()`, it's not enough to just add it `NoteStore`. We'll need to associate it with the `Lane` in question as well. We are going to need a new action for this. We can call it `LaneActions.attachToLane({laneId: <id>, noteId: <id>})`. This will create the needed association based on the ids. The `Note` filtering logic can be performed when injecting data to `Notes`.

In addition to `attachToLane` we are going to need a way to detach a `Note` from a `Lane`. `Notes` can be deleted after all and we don't want to have dead data hanging around. For this purpose we need to implement `LaneActions.detachFromLane({laneId: <id>, noteId: <id>})`.

The first required change, adding a new action is simple. We will simply add the action to our list of actions.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'attachToLane', 'detachFromLane');
```

We also need to implement the feature at store level as follows:

**app/stores/LaneStore.js**

```javascript
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import findIndex from '../libs/find_index';

class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', laneId);

    if(!targetId < 0) {
      return console.warn('Failed to find target lane');
    }

    const lane = lanes[targetId];

    lane.notes = lane.notes || [];

    if(lane.notes.indexOf(noteId) === -1) {
      lane.notes.push(noteId);

      this.setState({lanes});
    }
    else {
      console.warn('Already attached note to lane', lanes);
    }
  }
  detachFromLane({laneId, noteId}) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', laneId);

    if(!targetId < 0) {
      return console.warn('Failed to find target lane');
    }

    const lane = lanes[targetId];
    const notes = lane.notes || [];
    const removeId = notes.indexOf(noteId);

    if(lane.notes.indexOf(removeId) === -1) {
      lane.notes = notes.slice(0, removeId).concat(notes.slice(removeId + 1));

      this.setState({lanes});
    }
    else {
      console.warn('Failed to remove note from a lane as it didn\'t exist', lanes);
    }
  }
}

export default alt.createStore(LaneStore);
```

It is a lot of code. In order to make it easier to track possible problems it has been written defensively. Hence the extensive logging.

Finally we need to make `Lane` to trigger `attachToLane` and `detachLane`. We also need to display `Notes` associated with a `Lane`.

**app/components/Lane.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

export default class Lane extends React.Component {
  render() {
    const {id, name, notes, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <div className='lane-name'>{name}</div>
          <div className='lane-add-note'>
            <button onClick={this.addNote.bind(null, id)}>+</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => {
              const allNotes = NoteStore.getState().notes || [];

              if(notes) {
                return allNotes.filter((note) => {
                  return notes.indexOf(note.id) >= 0;
                });
              }

              return [];
            }
          } }
        >
          <Notes onEdit={this.noteEdited.bind(null, id)} />
        </AltContainer>
      </div>
    );
  }
  addNote(laneId) {
    const noteId = uuid.v4();

    NoteActions.create({id: noteId, task: 'New task'});
    LaneActions.attachToLane({laneId, noteId});
  }
  noteEdited(laneId, noteId, task) {
    if(task) {
      NoteActions.update({id: noteId, task});
    }
    else {
      NoteActions.delete(noteId);
      LaneActions.detachFromLane({laneId, noteId});
    }
  }
}
```

After these massive changes we have set up a system that can maintain relations between `Lanes` and `Notes`. It's not a particularly beautiful solution but the current structure allowed us to retain singleton stores and a flat data structure.

An alternative would have been to model `NoteStores` as individual instances. In some ways that solution is a little cleaner as we don't have to worry about relations so much. We will still need to associate the stores to `LaneStores` through ids. So there's no escape from ids even in this solution. Instances come with bookkeeping of their own, though, and ties `Stores` to components tightly. Some might even say that's a Flux anti-pattern.

## Implementing Edit/Remove for `Lane`

XXXXX

We can follow the same idea as for `Note` here. I.e. if you click `Lane` name, it should become editable. In case the new name is empty, we'll simply remove it. Given it's the same behavior we can extract it from `Note` and then reuse at `Lane`.

Given `Note` already contains some of the logic we need, we can generalize the component. Rename `Note.jsx` as `Editable.jsx` and change its class name to avoid confusion:

**app/components/Editable.jsx**

```javascript
import React from 'react';

export default class Editable extends React.Component {
  ...
}
```

Make `Notes.jsx` point at `Editable` instead of `Note` like this:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable';

export default class Notes extends React.Component {
  ...
  renderNote(note, i) {
    return (
      <li className='note' key={`note${i}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </li>
    );
  }
}
```

We should replace `Lane` name to be rendered through `Editable`:

**app/components/Lane.jsx**

```javascript
...

import Editable from './Editable';

...

<Editable className='lane-name' value={name} onEdit={this.nameEdited} />

...

nameEdited(id, name) {
  console.log('edited lane name', id, name);
}
```

If you try to edit a lane name now, you should see a console print. We still need some logic (i.e. actions and store tweaks) to make this work. A good starting point is to sketch out the component level logic:

**app/components/Lane.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

...

nameEdited(id, name) {
  if(name) {
    LaneActions.update({id, name});
  }
  else {
    LaneActions.remove(id);
  }
}
```

This is exactly the same logic as for notes. In fact it is be possible to refactor the behavior into a method of its own. This can be done by extracting actions into a parameter. As duplication is the root of all evil, let's change it to this form:

**app/components/Lane.jsx**

```javascript
export default class Lane extends React.Component {
  constructor(props) {
    super(props);

    ...

    this.addNote = this.addNote.bind(this);
    this.nameEdited = this.edited.bind(this, LaneActions, 'name', props.i);
    this.taskEdited = this.edited.bind(this, this.actions, 'task');
  }

  render() {
    ...

    <Editable className='lane-name' value={name}
      onEdit={this.nameEdited} />

    ...

    <Notes onEdit={this.taskEdited} />

    ...
  }
  edited(actions, field, id, value) {
    if(value) {
      actions.update({id, [field]: value});
    }
    else {
      actions.remove(id);
    }
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
      lanes: lanes.slice(0, id).concat(lanes.slice(id + 1))
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

After these changes you should be able to modify lane names and remove lanes. Even persistency should just work without requiring any further tweaking. The implementation could be trimmed and some code could be removed but for now it's nice to have some room to maneuver. Who knows what sort of requirements might come up after all.

## Conclusion

In this chapter we managed to generalize our application somehow. We actually have something you can sort of use! It's not pretty and the user experience is quite horrible. Still, it's better than before. Before focusing on advanced functionality let's try to make the application look a little better and study some styling approaches.
