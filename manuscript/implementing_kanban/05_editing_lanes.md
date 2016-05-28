# Editing Lanes

![Kanban board](images/kanban_05.png)

We still have work to do to turn this into a real Kanban as pictured above. The application is still missing some logic and styling. That's what we'll focus on here.

The `Editable` component we implemented earlier will come in handy. We can use it to make it possible to alter `Lane` names. The idea is exactly the same as for notes.

We should also make it possible to remove lanes. For that to work we'll need to add an UI control and attach logic to it. Again, it's a similar idea as earlier.

## Implementing Editing for `Lane` names

To edit a `Lane` name, we need a little bit of logic and UI hooks. `Editable` can handle the UI part. Logic will take more work. To get started, tweak `Lane` as follows:

**app/components/Lane.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
import LaneActions from '../actions/LaneActions';
import Notes from './Notes';
leanpub-start-insert
import Editable from './Editable';
leanpub-end-insert

const Lane = ({
  lane, notes, LaneActions, NoteActions, ...props
}) => {
  ...
leanpub-start-insert
  const activateLaneEdit = () => {
    LaneActions.update({
      id: lane.id,
      editing: true
    });
  }
  const editName = name => {
    LaneActions.update({
      id: lane.id,
      name,
      editing: false
    });
  }
leanpub-end-insert

  return (
    <div {...props}>
leanpub-start-remove
      <div className="lane-header">
leanpub-end-remove
leanpub-start-insert
      <div className="lane-header" onClick={activateLaneEdit}>
leanpub-end-insert
        <div className="lane-add-note">
          <button onClick={addNote}>+</button>
        </div>
leanpub-start-remove
        <div className="lane-name">{lane.name}</div>
leanpub-end-remove
leanpub-start-insert
        <Editable className="lane-name" editing={lane.editing}
          value={lane.name} onEdit={editName} />
leanpub-end-insert
      </div>
      <Notes
        notes={selectNotesByIds(notes, lane.notes)}
        onNoteClick={activateNoteEdit}
        onEdit={editNote}
        onDelete={deleteNote} />
    </div>
  );
}

...
```

The user interface should look exactly the same after this change. We still need to implement `LaneActions.update` to make our setup work.

Just like before, we have to tweak two places, the action definition and `LaneStore`. Here's the action part:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'attachToLane', 'detachFromLane'
);
```

To add the missing logic, tweak `LaneStore` like this. It's the same idea as for `NoteStore`:

**app/stores/LaneStore.js**

```javascript
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = [];
  }
  create(lane) {
    ...
  }
leanpub-start-insert
  update(updatedLane) {
    this.setState({
      lanes: this.lanes.map(lane => {
        if(lane.id === updatedLane.id) {
          return Object.assign({}, lane, updatedLane);
        }

        return lane;
      })
    });
  }
leanpub-end-insert
  ...
}
```

After these changes you should be able to edit lane names. Lane deletion is a good feature to sort out next.

## Implementing `Lane` Deletion

XXX

## Styling Kanban

XXX

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
            onNoteClick={this.activateNoteEdit}
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
