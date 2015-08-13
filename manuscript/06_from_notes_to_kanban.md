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

In addition, we are going to need a `LaneStore` and a method matching to `create`. The idea is pretty much the same as for `NoteStore` earlier. `create` will concatenate a new lane to the list of lanes. After that the change will propagate to the listeners (i.e. `FinalStore` and components).

Due to Alt bootstrapping we will need to check against `this.lanes` when we are loading data initially. If there's data already, we might as well use that. This is the same idea as we saw for `NoteStore` earlier.

**app/stores/LaneStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = this.lanes || [];
  }
  create(lane) {
    const lanes = this.lanes;

    lane.id = uuid.v4();
    lane.notes = lane.notes || [];

    this.setState({
      lanes: lanes.concat(lane)
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
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
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes.jsx';
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
    LaneActions.create({name: 'New lane'});
  }
}
```

The current implementation doesn't do much. It just shows a plus button and *lanes should go here* text. We still need to model `Lane` and attach `Notes` to that to make this work.

## Modeling `Lane`

Each `Lane` will be able to render associated `Notes` just like our `App` did earlier. `Lanes` container in turn will render each `Lane` separately. It is analogous to `Notes` in this manner. The example below illustrates how to set up `Lanes`.

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane.jsx';

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

We are also going to need `Lane` component to make this work. It will render `Lane` name and associated `Notes`. To make it easier to customize, I will keep the prop interface generic. In other words I'll allow `Lanes` to attach custom HTML attributes to each. This way the `className` declaration above will work.

I'll be using [Object rest spread syntax](https://github.com/sebmarkbage/ecmascript-rest-spread) (`{a, b, ...props} = this.props`) available as a **Stage 1** feature. It is perfect for a case such as this as it will extract the props we don't need. This way we don't end up polluting the HTML element.

The example below has been modeled largely after our earlier implementation of `App`. It introduced Object rest syntax and will render an entire lane including its name and associated notes:

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes.jsx';
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
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create({task: 'New task'});
  }
  editNote(id, task) {
    NoteActions.update({id, task});
  }
  deleteNote(id) {
    NoteActions.delete(id);
  }
}
```

Now we have something that sort of works. You can see there's something seriously wrong, though. If you add new Notes to a Lane, the Note appears to each Lane. Also if you modify a Note, also other Lanes update.

The reason why this happens is quite simple. Our `NoteStore` is a singleton. This means every component that is listening to `NoteStore` will receive the same data. We will need to resolve this problem somehow.

## Making Lanes Responsible of Notes

Currently our `Lane` model is very simple. We are just storing an array of objects. Each of the objects knows its *id* and *name*. We'll need something more. Each `Lane` needs to know which `Notes` belong to it. If a `Lane` contained an array of `Note` ids, it could then filter and display the `Notes` belonging to it.

This means we'll need to extend the system to support this. When we `addNote()`, it's not enough to just add it `NoteStore`. We'll need to associate it with the `Lane` in question as well. We are going to need a new action for this. We can call it `LaneActions.attachToLane({laneId: <id>, noteId: <id>})`.

The problem with `attachToLane` signature is that we are going to need some way to pass the id of the newly created `Note` to the `Lane`. Fortunately Flux architecture provides a small utility for dealing with data dependencies like this. This is known as `waitFor`. In short we can wait for `addNote` to complete before we try to create the association.

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
import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import NoteStore from './NoteStore';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = this.lanes || [];
  }
  ...
  attachToLane({laneId, noteId}) {
    if(!noteId) {
      this.waitFor(NoteStore);

      noteId = NoteStore.getState().notes.slice(-1)[0].id;
    }

    const noteId = NoteStore.getState().notes.slice(-1)[0].id;
    const lanes = this.lanes;
    const targetId = this.findLane(laneId);

    if(targetId < 0) {
      return console.warn('Failed to find target lane');
    }

    const lane = lanes[targetId];

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
    const targetId = this.findLane(laneId);

    if(targetId < 0) {
      return console.warn('Failed to find target lane');
    }

    const lane = lanes[targetId];
    const notes = lane.notes;
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

export default alt.createStore(LaneStore, 'LaneStore');
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
            items: () => NoteStore.get(notes)
          } }
        >
          <Notes
            onEdit={this.editNote}
            onDelete={this.deleteNote.bind(null, id)} />
        </AltContainer>
      </div>
    );
  }
  addNote(laneId) {
    NoteActions.create({task: 'New task'});
    LaneActions.attachToLane({laneId});
  }
  editNote(noteId, task) {
    NoteActions.update({id: noteId, task});
  }
  deleteNote(laneId, noteId) {
    NoteActions.delete(noteId);
    LaneActions.detachFromLane({laneId, noteId});
  }
}
```

We also need to defined that getter for `NoteStore`

**app/stores/NoteStore.jsx**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = this.notes || [];

    this.exportPublicMethods({
      get: this.get.bind(this)
    });
  }
  ...
  get(ids) {
    const notes = this.notes || [];
    const notesIds = notes.map((note) => note.id);

    if(ids) {
      return ids.map((id) => notes[notesIds.indexOf(id)]);
    }

    return [];
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

After these massive changes we have set up a system that can maintain relations between `Lanes` and `Notes`. It's not a particularly beautiful solution but the current structure allowed us to retain singleton stores and a flat data structure.

### Alternative Designs

There are a couple of alternatives to the current design. The data structure it uses is convenient especially for lane related operations (e.g. moving notes) as `Lanes` know which `Notes` they contain. This will be important as we implement drag and drop. Incidentally the current structure would work nicely with a backend. The current structures would map neatly to a RESTful API. We would have resources for both `Lanes` and `Notes`. Each action would then operate through these directly using standard CRUD interface.

That said the current solution isn't ideal. There's a fair amount of complexity. Especially having to track relations is a little painful. One way to deal with this problem would be to drop `notes` array from `Lane` level and inverse the relation. This means a `Note` would have to know into which `Lane` it belongs. It would also have to know its position. In our current solution position is given by the location in `notes` array.

This change would push our problems elsewhere. We would still have to resolve which `Notes` belong to a `Lane`. In addition, we would have to resolve their order. Ordering operations would become harder to pull off and integrating with a backend would become more challenging due to the mapping. On the plus side by pushing references to `Note` level we could drop those `attach` and `detach` bits from `LaneStore` and simplify reference handling somewhat.

We could also consider modeling `NoteStores` as individual instances so that each `Lane` would be associated with a `NoteStore` of its own. Again, the problem with relations would disappear. We would still have to manage these stores, though. This would tie `NoteStores` to components tightly and it goes against the basic principles of Flux. It is considered a Flux anti-pattern.

Sometimes there's no clear cut way way to deal with data modeling. It is even possible Flux isn't the right architecture for this application. Flux works very well with flat structures. Once you get dynamic nesting like in this case, it might start to get a little complicated. It is possible better solutions appear as people get more experienced with it. The solution I'm presenting here is just one possibility amongst many.

## Implementing Edit/Remove for `Lane`

Now that we have some basic data structures in place we can start extending the application. We are still missing some basic functionality such as editing lane names and removing them. We can follow the same idea as for `Note` here. I.e. if you click `Lane` name, it should become editable. In case the new name is empty, we'll simply remove it. Given it's the same behavior we can save some work by extracting the logic from `Note` and then reusing it at `Lane`.

As a first step we should rename `Note.jsx` as `Editable.jsx` and tweak as to avoid confusion and to push abstraction level up:

**app/components/Editable.jsx**

```javascript
import React from 'react';

export default class Editable extends React.Component {
  constructor(props) {
    ...

    // this.renderTask = this.renderTask.bind(this);
    this.renderValue = this.renderValue.bind(this);

    this.state = {
      editing: false
    };
  }
  render() {
    const {value, onEdit, ...props} = this.props;
    const editing = this.state.editing;

    return (
      <div {...props}>
        {editing ? this.renderEdit() : this.renderValue()}
      </div>
    );
  }
  renderEdit() {
    return <input type='text'
      autoFocus={true}
      defaultValue={this.props.value}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter} />;
  }
  renderValue() { // drop renderTask
    const onDelete = this.props.onDelete;

    return (
      <div onClick={this.edit}>
        <span className='value'>{this.props.value}</span>
        {onDelete ? this.renderDelete() : null }
      </div>
    );
  }
  ...
}
```

Next we need to make `Notes.jsx` point at this component. We'll need to alter the import and component name at `render()`.

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable.jsx';

export default class Notes extends React.Component {
  ...
  renderNote(note, i) {
    return (
      <li className='note' key={`note${note.id}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)}
          onDelete={this.props.onDelete.bind(null, note.id)} />
      </li>
    );
  }
}
```

Next we can use this generalized component to allow `Lane` name to be modified. This will give a hook for our logic. We'll need to alter `<div className='lane-name'>{name}</div>` as follows:

**app/components/Lane.jsx**

```javascript
...
import Editable from './Editable.jsx';

export default class Lane extends React.Component {
  render() {
    const {id, name, notes, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <Editable className='lane-name' value={name}
            onEdit={this.editName.bind(null, id)} />
          ...
        </div>
        ...
      </div>
    )
  }
  ...
  editName(id, name) {
    console.log('edited lane name', id, name);
  }
}
```

If you try to edit a lane name now, you should see a print at console. Next we will need to define some logic to make this work. To follow the same idea as with `Note`, we can model the remaining CRUD actions here. We'll need to set up `update` and `delete` actions in particular.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete',
  'attachToLane', 'detachFromLane'
);
```

We are also going to need `LaneStore` level implementations for these. They can be modeled based what we have seen on `NoteStore` earlier.

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  update({id, name}) {
    const lanes = this.lanes;
    const targetId = this.findLane(id);

    if(targetId < 0) {
      return;
    }

    lanes[targetId].name = name;

    this.setState({lanes});
  }
  delete(id) {
    const lanes = this.lanes;
    const targetId = this.findLane(id);

    if(targetId < 0) {
      return;
    }

    this.setState({
      lanes: lanes.slice(0, targetId).concat(lanes.slice(targetId + 1))
    });
  }
  attachToLane({laneId}) {
    ...
  }
  ...
}

export default alt.createStore(LaneStore, 'LaneStore');
```

Now that we have resolved actions and store, we need to adjust our component to take these changes in count. Not surprisingly the logic is going to resemble `Note` editing a lot.

**app/components/Lane.jsx**

```javascript
...
export default class Lane extends React.Component {
  ...
  editName(id, name) {
    if(name) {
      LaneActions.update({id, name});
    }
    else {
      LaneActions.delete(id);
    }
  }
}
```

Try modifying a lane name now. Modifications should get saved now the same way as they do for notes. Deleting lanes should be possible as well.

It probably would be possible to refactor the current implementation somewhat. You could for instance start by standardizing CRUD operations. That would likely decrease the amount of code while adding some rigidity to it. As this is a small project there's probably no need to over-engineer things so we can leave it as is. Of course you can try to push the implementation further to find better ways to compose the functionality.

## Styling Kanban Board

As we added `Lanes` to the application the styling went a bit off. Add the following styling to make it a little nicer.

**app/main.css**

```css
body {
  background: cornsilk;

  font-family: sans-serif;
}

.lane {
  margin: 1em;

  border: 1px solid #ccc;
  border-radius: 0.5em;

  min-width: 10em;

  display: inline-block;
  vertical-align: top;

  background-color: #efefef;
}

.lane-header {
  padding: 1em;

  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;

  overflow: auto;

  color: #efefef;
  background-color: #333;
}

.lane-name {
  float: left;
}

.lane-add-note {
  float: right;

  margin-left: 0.5em;
}

...
```

As this is a small project we can leave the CSS in a single file like this. In case it starts growing, consider separating it to multiple. One way to do this is to extract CSS per component and then refer to it there (e.g. `require('./lane.css')` at `Lane.jsx`).

Besides keeping things nice and tidy webpack's lazy loading machinery can pick this up. As a result the initial CSS your user has to load will be smaller. I go into further detail later as I discuss styling.

## Conclusion

In this chapter we took our feeble notes application closer to a functional Kanban board. We still cannot move notes between lanes. We will solve that in the next chapter as we implement drag and drop.
