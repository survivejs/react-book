# Editing Lanes

![Kanban board](images/kanban_05.png)

XXX

We still have work to do to turn this into a real Kanban as pictured above.

## Implementing Edit/Remove for `Lane`

XXX

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

## Cleaning Up `Note` References

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

## Conclusion

The current design has been optimized with drag and drop operations in mind. Moving notes within a lane is a matter of swapping ids. Moving notes from one lane to another is again an operation over ids. This structure leads to some complexity as we need to track ids, but it will pay off in the next chapter.

There isn't always a clear cut way to model data and relations. In other scenarios, we could push the references elsewhere. For instance, the note to lane relation could be inversed and pushed to `Note` level. We would still need to track their order within a lane somehow. We would be pushing the complexity elsewhere by doing this.

Currently, `NoteStore` is treated as a singleton. Another way to deal with it would be to create `NoteStore` per `Notes` dynamically. Even though this simplifies dealing with the relations somewhat, this is a Flux anti-pattern better avoided. It brings complications of its own as you need to deal with store lifecycle at the component level. Also dealing with drag and drop logic will become hard.

We still cannot move notes between lanes or within a lane. We will solve that in the next chapter, as we implement drag and drop.
