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

Deleting lanes is a similar problem. We need to extend the user interface, add an action, and attach logic associated to it.

The user interface is a natural place to start. Often it's a good idea to add some `console.log`s in place to make sure your event handlers get triggered as your expect. It would be even better to write tests for those. That way you'll end up with a runnable specification. Here's how to add a stub for deleting lanes:

**app/components/Lane.jsx**

```javascript
...

const Lane = ({
  lane, notes, LaneActions, NoteActions, ...props
}) => {
  ...
leanpub-start-insert
  const deleteLane = e => {
    // Avoid bubbling to edit
    e.stopPropagation();

    LaneActions.delete(lane.id);
  }
leanpub-end-insert

  return (
    <div {...props}>
      <div className="lane-header" onClick={activateLaneEdit}>
        <div className="lane-add-note">
          <button onClick={addNote}>+</button>
        </div>
        <Editable className="lane-name" editing={lane.editing}
          value={lane.name} onEdit={editName} />
leanpub-start-insert
        <div className="lane-delete">
          <button onClick={deleteLane}>x</button>
        </div>
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

Again, we need to expand our action definition:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete', 'attachToLane', 'detachFromLane'
);
```

And to finalize the implementation, let's add logic:

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
  update(updatedLane) {
    ...
  }
leanpub-start-insert
  delete(id) {
    this.setState({
      lanes: this.lanes.filter(lane => lane.id !== id)
    });
  }
leanpub-end-insert
  ...
}
```

Assuming everything went correctly, you should be able to delete entire lanes now.

The current implementation contains one gotcha. Even though we are removing references to lanes, the notes they point remain. This is something that could be turned into a rubbish bin feature. Or we could perform cleanup as well. For the purposes of this application, we can leave the situation as is. It is something good to be aware of, though.

## Styling Kanban Board

XXX

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
