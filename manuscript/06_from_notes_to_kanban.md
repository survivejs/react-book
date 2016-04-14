# From Notes to Kanban

![Kanban board](images/kanban_05.png)

So far we have developed an application for keeping track of notes in `localStorage`. We still have work to do to turn this into a real Kanban as pictured above. Most importantly our system is missing the concept of `Lane`.

A `Lane` is something that should be able to contain many `Notes` within itself and track their order. One way to model this is simply to make a `Lane` point at `Notes` through an array of `Note` ids. This relation could be reversed. A `Note` could point at a `Lane` using an id and maintain information about its position within a `Lane`. In this case, we are going to stick with the former design as that works well with re-ordering later on.

## Extracting `Lanes`

As earlier, we can use the same idea of two components here. There will be a component for the higher level (i.e., `Lanes`) and for the lower level (i.e., `Lane`). The higher level component will deal with lane ordering. A `Lane` will render itself (i.e., name and `Notes`) and have basic manipulation operations.

Just as with `Notes`, we are going to need a set of actions. For now it is enough if we can just create new lanes so we can create a corresponding action for that as below:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create');
```

In addition, we are going to need a `LaneStore` and a method matching to `create`. The idea is pretty much the same as for `NoteStore` earlier. `create` will concatenate a new lane to the list of lanes. After that, the change will propagate to the listeners (i.e., `FinalStore` and components).

**app/stores/LaneStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = [];
  }
  create(lane) {
    const lanes = this.lanes;

    lane.id = uuid.v4();

    // If `notes` aren't provided for some reason,
    // default to an empty array.
    lane.notes = lane.notes || [];

    this.setState({
      lanes: lanes.concat(lane)
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

We are also going to need a stub for `Lanes`. We will expand this later. For now we just want something simple to show up.

**app/components/Lanes.jsx**

```javascript
import React from 'react';

export default class Lanes extends React.Component {
  render() {
    return (
      <div className="lanes">
        lanes should go here
      </div>
    );
  }
}
```

Next, we need to make room for `Lanes` at `App`. We will simply replace `Notes` references with `Lanes`, set up actions, and store as needed:

**app/components/App.jsx**

```javascript
import AltContainer from 'alt-container';
import React from 'react';
leanpub-start-delete
import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
leanpub-end-delete
leanpub-start-insert
import Lanes from './Lanes.jsx';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
leanpub-end-insert

export default class App extends React.Component {
  render() {
    return (
      <div>
leanpub-start-delete
        <button className="add-note" onClick={this.addNote}>+</button>
leanpub-end-delete
leanpub-start-insert
        <button className="add-lane" onClick={this.addLane}>+</button>
leanpub-end-insert
leanpub-start-delete
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getState().notes
          }}
        >
leanpub-end-delete
leanpub-start-insert
        <AltContainer
          stores={[LaneStore]}
          inject={{
            lanes: () => LaneStore.getState().lanes || []
          }}
        >
leanpub-end-insert
leanpub-start-delete
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
leanpub-end-delete
leanpub-start-insert
          <Lanes />
leanpub-end-insert
        </AltContainer>
      </div>
    );
  }
leanpub-start-delete
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    NoteActions.delete(id);
  };
  addNote = () => {
    NoteActions.create({task: 'New task'});
  };
  editNote = (id, task) => {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  };
leanpub-end-delete
leanpub-start-insert
  addLane() {
    LaneActions.create({name: 'New lane'});
  }
leanpub-end-insert
}
```

If you check out the implementation at the browser, you can see that the current implementation doesn't do much. It just shows a plus button and *lanes should go here* text. Even the add button doesn't work yet. We still need to model `Lane` and attach `Notes` to that to make this all work.

## Modeling `Lane`

The `Lanes` container will render each `Lane` separately. Each `Lane` in turn will then render associated `Notes`, just like our `App` did earlier. `Lanes` is analogous to `Notes` in this manner. The example below illustrates how to set this up:

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane.jsx';

export default ({lanes}) => {
  return (
    <div className="lanes">{lanes.map(lane =>
      <Lane className="lane" key={lane.id} lane={lane} />
    )}</div>
  );
}
```

We are also going to need a `Lane` component to make this work. It will render the `Lane` name and associated `Notes`. The example below has been modeled largely after our earlier implementation of `App`. It will render an entire lane, including its name and associated notes:

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt-container';
import React from 'react';
import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  render() {
    const {lane, ...props} = this.props;

    return (
      <div {...props}>
        <div className="lane-header">
          <div className="lane-add-note">
            <button onClick={this.addNote}>+</button>
          </div>
          <div className="lane-name">{lane.name}</div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getState().notes || []
          }}
        >
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  }
  addNote() {
    NoteActions.create({task: 'New task'});
  }
  deleteNote(id, e) {
    // Avoid bubbling to edit
    e.stopPropagation();

    NoteActions.delete(id);
  }
}
```

I am using [Object rest/spread syntax (stage 2)](https://github.com/sebmarkbage/ecmascript-rest-spread) (`const {a, b, ...props} = this.props`) in the example. This allows us to attach a `className` to `Lane` and we avoid polluting it with HTML attributes we don't need. The syntax expands Object key value pairs as props so we don't have to write each prop we want separately.

If you run the application and try adding new notes, you can see there's something wrong. Every note you add is shared by all lanes. If a note is modified, other lanes update too.

![Duplicate notes](images/kanban_01.png)

The reason why this happens is simple. Our `NoteStore` is a singleton. This means every component that is listening to `NoteStore` will receive the same data. We will need to resolve this problem somehow.

## Making `Lanes` Responsible of `Notes`

Currently, our `Lane` contains just an array of objects. Each of the objects knows its *id* and *name*. We'll need something more.

In order to make this work, each `Lane` needs to know which `Notes` belong to it. If a `Lane` contained an array of `Note` ids, it could then filter and display the `Notes` belonging to it. We'll implement a scheme to achieve this next.

### Setting Up `attachToLane`

When we add a new `Note` to the system using `addNote`, we need to make sure it's associated to some `Lane`. This association can be modeled using a method, such as `LaneActions.attachToLane({laneId: <id>, noteId: <id>})`. Before calling this method we should create a note and gets its id. Here's an example of how we could glue it together:

```javascript
const note = NoteActions.create({task: 'New task'});

LaneActions.attachToLane({
  noteId: note.id,
  laneId
});
```

To get started we should add `attachToLane` to actions as before:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'attachToLane');
```

In order to implement `attachToLane`, we need to find a lane matching to the given lane id and then attach note id to it. Furthermore, each note should belong only to one lane at a time. We can perform a rough check against that:

**app/stores/LaneStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  ...
leanpub-start-insert
  attachToLane({laneId, noteId}) {
    const lanes = this.lanes.map(lane => {
      if(lane.id === laneId) {
        if(lane.notes.includes(noteId)) {
          console.warn('Already attached note to lane', lanes);
        }
        else {
          lane.notes.push(noteId);
        }
      }

      return lane;
    });

    this.setState({lanes});
  }
leanpub-end-insert
}

export default alt.createStore(LaneStore, 'LaneStore');
```

We also need to make sure `NoteActions.create` returns a note so the setup works just like in the code example above. The note is needed for creating an association between a lane and a note:

**app/stores/NoteStore.js**

```javascript
...

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];
  }
  create(note) {
    const notes = this.notes;

    note.id = uuid.v4();

    this.setState({
      notes: notes.concat(note)
    });

leanpub-start-insert
    return note;
leanpub-end-insert
  }
  ...
}

...
```

### Setting Up `detachFromLane`

`deleteNote` is the opposite operation of `addNote`. When removing a `Note`, it's important to remove its association with a `Lane` as well. For this purpose we can implement `LaneActions.detachFromLane({laneId: <id>})`. We would use it like this:

```javascript
LaneActions.detachFromLane({laneId, noteId});
NoteActions.delete(noteId);
```

Again, we should set up an action:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'attachToLane', 'detachFromLane');
```

The implementation will resemble `attachToLane`. In this case, we'll remove the possibly found `Note` instead:

**app/stores/LaneStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    ...
  }
leanpub-start-insert
  detachFromLane({laneId, noteId}) {
    const lanes = this.lanes.map(lane => {
      if(lane.id === laneId) {
        lane.notes = lane.notes.filter(note => note !== noteId);
      }

      return lane;
    });

    this.setState({lanes});
  }
leanpub-end-insert
}

export default alt.createStore(LaneStore, 'LaneStore');
```

Just building an association between a lane and a note isn't enough. We are going to need some way to resolve the note references to data we can display through the user interface. For this purpose, we need to implement a special getter so we get just the data we want per each lane.

### Implementing a Getter for `NoteStore`

One neat way to resolve lane notes to actual data is to implement a public method `NoteStore.getNotesByIds(notes)`. It accepts an array of `Note` ids, and returns the corresponding objects.

Just implementing the method isn't enough. We also need to make it public. In Alt, this can be achieved using `this.exportPublicMethods`. It takes an object that describes the public interface of the store in question. Consider the implementation below:

**app/stores/NoteStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];

leanpub-start-insert
    this.exportPublicMethods({
      getNotesByIds: this.getNotesByIds.bind(this)
    });
leanpub-end-insert
  }
  ...
leanpub-start-insert
  getNotesByIds(ids) {
    // 1. Make sure we are operating on an array and
    // map over the ids
    // [id, id, id, ...] -> [[Note], [], [Note], ...]
    return (ids || []).map(
      // 2. Extract matching notes
      // [Note, Note, Note] -> [Note, ...] (match) or [] (no match)
      id => this.notes.filter(note => note.id === id)
    // 3. Filter out possible empty arrays and get notes
    // [[Note], [], [Note]] -> [[Note], [Note]] -> [Note, Note]
    ).filter(a => a.length).map(a => a[0]);
  }
leanpub-end-insert
}

export default alt.createStore(NoteStore, 'NoteStore');
```

Note that the implementation filters possible non-matching ids from the result.

### Connecting `Lane` with the Logic

Now that we have the logical bits together, we can integrate it with `Lane`. We'll need to take the newly added props (`id`, `notes`) into account, and glue this all together:

**app/components/Lane.jsx**

```javascript
...
leanpub-start-insert
import LaneActions from '../actions/LaneActions';
leanpub-end-insert

export default class Lane extends React.Component {
  render() {
    const {lane, ...props} = this.props;

    return (
      <div {...props}>
        <div className="lane-header">
          <div className="lane-add-note">
            <button onClick={this.addNote}>+</button>
          </div>
          <div className="lane-name">{lane.name}</div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
leanpub-start-delete
            notes: () => NoteStore.getState().notes || []
leanpub-end-delete
leanpub-start-insert
            notes: () => NoteStore.getNotesByIds(lane.notes)
leanpub-end-insert
          }}
        >
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  }
leanpub-start-delete
  addNote() {
    NoteActions.create({task: 'New task'});
  }
  deleteNote(id, e) {
    // Avoid bubbling to edit
    e.stopPropagation();

    NoteActions.delete(id);
  }
leanpub-end-delete
leanpub-start-insert
  addNote = (e) => {
    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New task'});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };
  deleteNote = (noteId, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    const laneId = this.props.lane.id;

    LaneActions.detachFromLane({laneId, noteId});
    NoteActions.delete(noteId);
  };
leanpub-end-insert
}
```

There are three important changes:

* Methods where we need to refer to `this` have been bound using a property initializer. An alternative way to achieve this would have been to `bind` at `render` or at `constructor`. See the *Language Features* appendix for more details.
* `notes: () => NoteStore.getNotesByIds(notes)` - Our new getter is used to filter `notes`.
* `addNote`, `deleteNote` - These operate now based on the new logic we specified. Note that we trigger `detachFromLane` before `delete` at `deleteNote`. Otherwise we may try to render non-existent notes. You can try swapping the order to see warnings.

After these changes, we have a system that can maintain relations between `Lanes` and `Notes`. The current structure allows us to keep singleton stores and a flat data structure. Dealing with references is a little awkward, but that's consistent with the Flux architecture.

If you try to add notes to a specific lane, they shouldn't be duplicated anymore. Also editing a note should behave as you might expect:

![Separate notes](images/kanban_02.png)

### On Data Dependencies and `waitFor`

The current setup works because our actions are synchronous. It would become more problematic if we dealt with a back-end. In that case, we would have to set up `waitFor` based code. [waitFor](http://alt.js.org/guide/wait-for/) allows us to deal with data dependencies. It tells the dispatcher that it should wait before going on.

To give you an idea of what this approach would look like, consider the example below (no need to change your code!):

```javascript
NoteActions.create({task: 'New task'});

// Triggers waitFor
LaneActions.attachToLane({laneId});
```

**app/stores/LaneStore.js**

```javascript
class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    if(!noteId) {
      this.waitFor(NoteStore);

      noteId = NoteStore.getState().notes.slice(-1)[0].id;
    }

    ...
  }
}
```

Fortunately, we can avoid `waitFor` in this case. You should use it carefully. It becomes necessary when you need to deal with asynchronously fetched data that depends on each other, however.

## Implementing Edit/Remove for `Lane`

We are still missing some basic functionality, such as editing and removing lanes. Copy *Note.jsx* as *Editable.jsx*. We'll get back to that original *Note.jsx* later in this project. For now, we just want to get `Editable` into a good condition.

To make it easier to track what's going on at `Editable`, we'll define a pair of callbacks - `onEdit` and `onValueClick`. The former will be called when the user finishes editing. We can capture the new value this way. The latter allows us to know when the user clicks on `Editable` in its initial state showing `value` passed to it. This gives us enough control to set `Editable` into `editing` mode.

Tweak the code as follows to generalize the implementation according to these ideas:

**app/components/Editable.jsx**

```javascript
import React from 'react';

leanpub-start-delete
export default class Note extends React.Component {
leanpub-end-delete
leanpub-start-insert
export default class Editable extends React.Component {
leanpub-end-insert
leanpub-start-delete
  constructor(props) {
    super(props);

    // Track `editing` state.
    this.state = {
      editing: false
    };
  }
  render() {
    // Render the component differently based on state.
    if(this.state.editing) {
      return this.renderEdit();
    }

    return this.renderNote();
  }
leanpub-end-delete
leanpub-start-insert
  render() {
    const {value, onEdit, onValueClick, editing, ...props} = this.props;

    return (
      <div {...props}>
        {editing ? this.renderEdit() : this.renderValue()}
      </div>
    );
  }
leanpub-end-insert
  renderEdit = () => {
    return <input type="text"
      ref={
        element => element ?
leanpub-start-delete
        element.selectionStart = this.props.task.length :
leanpub-end-delete
leanpub-start-insert
        element.selectionStart = this.props.value.length :
leanpub-end-insert
        null
      }
      autoFocus={true}
leanpub-start-delete
      defaultValue={this.props.task}
leanpub-end-delete
leanpub-start-insert
      defaultValue={this.props.value}
leanpub-end-insert
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter} />;
  };
leanpub-start-delete
  renderNote = () => {
    const onDelete = this.props.onDelete;

    return (
      <div onClick={this.edit}>
        <span className="task">{this.props.task}</span>
        {onDelete ? this.renderDelete() : null }
      </div>
    );
  };
leanpub-end-delete
leanpub-start-insert
  renderValue = () => {
    const onDelete = this.props.onDelete;

    return (
      <div onClick={this.props.onValueClick}>
        <span className="value">{this.props.value}</span>
        {onDelete ? this.renderDelete() : null }
      </div>
    );
  };
leanpub-end-insert
  renderDelete = () => {
    return <button
leanpub-start-delete
      className="delete-note"
leanpub-end-delete
leanpub-start-insert
      className="delete"
leanpub-end-insert
      onClick={this.props.onDelete}>x</button>;
  };
leanpub-start-insert
leanpub-start-delete
  edit = () => {
    // Enter edit mode.
    this.setState({
      editing: true
    });
  };
leanpub-end-delete
leanpub-end-insert
  checkEnter = (e) => {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  };
  finishEdit = (e) => {
    const value = e.target.value;

    if(this.props.onEdit) {
      this.props.onEdit(value);

leanpub-start-delete
      // Exit edit mode.
      this.setState({
        editing: false
      });
leanpub-end-delete
    }
  };
}
```

There are a couple of important changes:

* `{editing ? this.renderEdit() : this.renderValue()}` - This ternary selects what to render based on the editing state. Previously we had `Note`. Now we are using the term `Value` as that's more generic.
* `renderValue` - Formerly this was known as `renderNote()`. Again, an abstraction step. Note that we refer to `this.props.value` and not `this.props.task`.
* `renderDelete` - Instead of using `delete-note` class, it uses more generic `delete` now.

Given we changed a few class names to a more generic form, the styling needs some work.

### Updating `Editable` Styling

Update the styling as follows to make the application look good again:

**app/main.css**

```css
...

leanpub-start-delete
.note .task {
leanpub-end-delete
leanpub-start-insert
.note .value {
leanpub-end-insert
  /* force to use inline-block so that it gets minimum height */
  display: inline-block;
}

leanpub-start-delete
.note .delete-note {
leanpub-end-delete
leanpub-start-insert
.note .delete {
leanpub-end-insert
  ...
}
leanpub-start-delete
.note:hover .delete-note {
leanpub-end-delete
leanpub-start-insert
.note:hover .delete {
leanpub-end-insert
  visibility: visible;
}
```

There's not much more to styling for now.

### Controlled vs. Uncontrolled Components

`Editable` uses **uncontrolled** design with its `input`. We let the DOM manage its state. In this case we are interested only in detecting when the user presses the return key. When the user does that, we take a peek at the input value and then provide it to our callback.

If we wanted to validate the input when the user is typing, it would be useful to convert it into a *controlled* design. In this case we would define a `onChange` handler and a `value` prop. `value` represents the value the input should display. We would control it through `onChange`. It's more work, but also provides more control.

T> React documentation discusses [controlled components](https://facebook.github.io/react/docs/forms.html) in greater detail.

### Pointing `Notes` to `Editable`

Next, we need to make *Notes.jsx* point at the new component. We'll need to alter the import and the component name at `render()`:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable.jsx';

export default ({notes, onValueClick, onEdit, onDelete}) => {
  return (
    <ul className="notes">{notes.map(note =>
      <li className="note" key={note.id}>
        <Editable
          editing={note.editing}
          value={note.task}
          onValueClick={onValueClick.bind(null, note.id)}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
      </li>
    )}</ul>
  );
}
```

If you refresh the browser, you should see `Uncaught TypeError: Cannot read property 'bind' of undefined`. This has to do with that `onValueClick` definition we added. We will address this next.

T> *Typing with React* chapter discusses how to use `propTypes` to work around this problem. It's a feature that allows us to set good defaults for props while also checking their types during development.

### Connecting `Lane` with `Editable`

Next, we can use this generic component to allow a lane's name to be modified. This will give a hook for our logic. To allow the user to modify the name easily, it makes sense to enable the editing mode when a lane header is clicked. To achieve this, we can attach a `onClick` handler to it and then set state as the user clicks it.

As a first step, add initial code in place. We'll define actual logic later. Tweak as follows:

**app/components/Lane.jsx**

```javascript
...
leanpub-start-insert
import Editable from './Editable.jsx';
leanpub-end-insert

export default class Lane extends React.Component {
  render() {
    const {lane, ...props} = this.props;

    return (
      <div {...props}>
leanpub-start-delete
        <div className="lane-header">
leanpub-end-delete
leanpub-start-insert
        <div className="lane-header" onClick={this.activateLaneEdit}>
leanpub-end-insert
          <div className="lane-add-note">
            <button onClick={this.addNote}>+</button>
          </div>
leanpub-start-delete
          <div className="lane-name">{lane.name}</div>
leanpub-end-delete
leanpub-start-insert
          <Editable className="lane-name" editing={lane.editing}
            value={lane.name} onEdit={this.editName} />
          <div className="lane-delete">
            <button onClick={this.deleteLane}>x</button>
          </div>
leanpub-end-insert
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getNotesByIds(lane.notes)
          }}
        >
leanpub-start-delete
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
leanpub-end-delete
leanpub-start-insert
          <Notes
            onValueClick={this.activateNoteEdit}
            onEdit={this.editNote}
            onDelete={this.deleteNote} />
leanpub-end-insert
        </AltContainer>
      </div>
    )
  }
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  }
  addNote = (e) => {
leanpub-start-insert
    // If note is added, avoid opening lane name edit by stopping
    // event bubbling in this case.
    e.stopPropagation();
leanpub-end-insert

    const laneId = this.props.lane.id;
    const note = NoteActions.create({task: 'New task'});

    LaneActions.attachToLane({
      noteId: note.id,
      laneId
    });
  };
  ...
leanpub-start-insert
  editName = (name) => {
    const laneId = this.props.lane.id;

    console.log(`edit lane ${laneId} name using ${name}`);
  };
  deleteLane = () => {
    const laneId = this.props.lane.id;

    console.log(`delete lane ${laneId}`);
  };
  activateLaneEdit = () => {
    const laneId = this.props.lane.id;

    console.log(`activate lane ${laneId} edit`);
  };
  activateNoteEdit(id) {
    console.log(`activate note ${id} edit`);
  }
leanpub-end-insert
}
```

If you try to edit a lane name now, you should see a log message at the console:

![Logging lane name editing](images/kanban_03.png)

### Defining `Editable` Logic

We will need to define some logic to make this work. To follow the same idea as with `Note`, we can model the remaining CRUD actions here. We'll need to set up `update` and `delete` actions in particular.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete',
  'attachToLane', 'detachFromLane'
);
```

We are also going to need `LaneStore` level implementations for these. They can be modeled based on what we have seen in `NoteStore` earlier:

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  create(lane) {
    ...
  }
leanpub-start-insert
  update(updatedLane) {
    const lanes = this.lanes.map(lane => {
      if(lane.id === updatedLane.id) {
        return Object.assign({}, lane, updatedLane);
      }

      return lane;
    });

    this.setState({lanes});
  }
  delete(id) {
    this.setState({
      lanes: this.lanes.filter(lane => lane.id !== id)
    });
  }
leanpub-end-insert
  attachToLane({laneId, noteId}) {
    ...
  }
  ...
}

export default alt.createStore(LaneStore, 'LaneStore');
```

Now that we have resolved actions and store, we need to adjust our component to take these changes into account:

**app/components/Lane.jsx**

```javascript
...
export default class Lane extends React.Component {
  ...
leanpub-start-delete
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  }
leanpub-end-delete
leanpub-start-insert
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      NoteActions.update({id, editing: false});

      return;
    }

    NoteActions.update({id, task, editing: false});
  }
leanpub-end-insert
  ...
leanpub-start-delete
  editName = (name) => {
    const laneId = this.props.lane.id;

    console.log(`edit lane ${laneId} name using ${name}`);
  };
  deleteLane = () => {
    const laneId = this.props.lane.id;

    console.log(`delete lane ${laneId}`);
  };
  activateLaneEdit = () => {
    const laneId = this.props.lane.id;

    console.log(`activate lane ${laneId} edit`);
  };
  activateNoteEdit(id) {
    console.log(`activate note ${id} edit`);
  }
leanpub-end-delete
leanpub-start-insert
  editName = (name) => {
    const laneId = this.props.lane.id;

    // Don't modify if trying to set an empty value
    if(!name.trim()) {
      LaneActions.update({id: laneId, editing: false});

      return;
    }

    LaneActions.update({id: laneId, name, editing: false});
  };
  deleteLane = () => {
    const laneId = this.props.lane.id;

    LaneActions.delete(laneId);
  };
  activateLaneEdit = () => {
    const laneId = this.props.lane.id;

    LaneActions.update({id: laneId, editing: true});
  };
  activateNoteEdit(id) {
    NoteActions.update({id, editing: true});
  }
leanpub-end-insert
}
```

Try modifying a lane name now. Modifications now should get saved the same way as they do for notes. Deleting lanes should be possible as well.

![Editing a lane name](images/kanban_04.png)

T> If you want that lanes and notes are editable after they are created, set `lane.editing = true;` or `note.editing = true;` when creating them.

## Cleaning Up Note References

If a lane is deleted, it would be a good idea to get rid of the associated notes as well. In the current implementation they are left hanging in the `NoteStore`. Given the application works even with these hanging references, I won't add the feature to the implementation. You can give it a go if you want, though. A simple `filter` statement at the right place should do the trick.

This bug could be turned into a feature of its own. It would be possible to use the data to model a recycle bin. It would be a component that would display discarded notes like this. You could then either restore them (drag back to a lane) or remove them for good. You could get back to this idea later as you understand how the application works.

## Styling Kanban Board

As we added `Lanes` to the application, the styling went a bit off. Add the following styling to make it a little nicer:

**app/main.css**

```css
body {
  background: cornsilk;
  font-family: sans-serif;
}

leanpub-start-insert
.lane {
  display: inline-block;

  margin: 1em;

  background-color: #efefef;
  border: 1px solid #ccc;
  border-radius: 0.5em;

  min-width: 10em;
  vertical-align: top;
}

.lane-header {
  overflow: auto;

  padding: 1em;

  color: #efefef;
  background-color: #333;

  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
}

.lane-name {
  float: left;
}

.lane-add-note {
  float: left;

  margin-right: 0.5em;
}

.lane-delete {
  float: right;

  margin-left: 0.5em;

  visibility: hidden;
}
.lane-header:hover .lane-delete {
  visibility: visible;
}

.add-lane, .lane-add-note button {
  cursor: pointer;

  background-color: #fdfdfd;
  border: 1px solid #ccc;
}

.lane-delete button {
  padding: 0;

  cursor: pointer;

  color: white;
  background-color: rgba(0, 0, 0, 0);
  border: 0;
}
leanpub-end-insert

...
```

You should end up with a result like this:

![Styled Kanban](images/kanban_05.png)

As this is a small project, we can leave the CSS in a single file like this. In case it starts growing, consider separating it to multiple files. One way to do this is to extract CSS per component and then refer to it there (e.g., `require('./lane.css')` at `Lane.jsx`).

Besides keeping things nice and tidy, Webpack's lazy loading machinery can pick this up. As a result, the initial CSS your user has to load will be smaller. I go into further detail later as I discuss styling at *Styling React*.

## On Namespacing Components

So far, we've been defining a component per file. That's not the only way. It may be handy to treat a file as a namespace and expose multiple components from it. React provides [namespaces components](https://facebook.github.io/react/docs/jsx-in-depth.html#namespaced-components) just for this purpose. In this case, we could apply namespacing to the concept of `Lane` or `Note`. This would add some flexibility to our system while keeping it simple to manage. By using namespacing, we could end up with something like this:

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane.jsx';

export default ({lanes}) => {
  return (
    <div className="lanes">{lanes.map(lane =>
leanpub-start-delete
      <Lane className="lane" key={lane.id} lane={lane} />
leanpub-end-delete
leanpub-start-insert
      <Lane className="lane" key={lane.id} lane={lane}>
        <Lane.Header name={lane.name} />
        <Lane.Notes notes={lane.notes} />
      </Lane>
leanpub-start-insert
    )}</div>
  );
}
```

**app/components/Lane.jsx**

```javascript
...

class Lane extends React.Component {
  ...
}

Lane.Header = class LaneHeader extends React.Component {
  ...
}
Lane.Notes = class LaneNotes extends React.Component {
  ...
}

export default Lane;
```

Now we have pushed the control over `Lane` formatting to a higher level. In this case, the change isn't worth it, but it can make sense in a more complex case.

You can use a similar approach for more generic components as well. Consider something like `Form`. You could easily have `Form.Label`, `Form.Input`, `Form.Textarea` and so on. Each would contain your custom formatting and logic as needed.

## Conclusion

The current design has been optimized with drag and drop operations in mind. Moving notes within a lane is a matter of swapping ids. Moving notes from one lane to another is again an operation over ids. This structure leads to some complexity as we need to track ids, but it will pay off in the next chapter.

There isn't always a clear cut way to model data and relations. In other scenarios, we could push the references elsewhere. For instance, the note to lane relation could be inversed and pushed to `Note` level. We would still need to track their order within a lane somehow. We would be pushing the complexity elsewhere by doing this.

Currently, `NoteStore` is treated as a singleton. Another way to deal with it would be to create `NoteStore` per `Notes` dynamically. Even though this simplifies dealing with the relations somewhat, this is a Flux anti-pattern better avoided. It brings complications of its own as you need to deal with store lifecycle at the component level. Also dealing with drag and drop logic will become hard.

We still cannot move notes between lanes or within a lane. We will solve that in the next chapter, as we implement drag and drop.
