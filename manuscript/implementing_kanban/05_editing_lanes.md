# Editing Lanes

![Kanban board](images/kanban_05.png)

We still have work to do to turn this into a real Kanban as pictured above. The application is still missing some logic and styling. That's what we'll focus on here.

The `Editable` component we implemented earlier will come in handy. We can use it to make it possible to alter `Lane` names. The idea is exactly the same as for notes.

We should also make it possible to remove lanes. For that to work we'll need to add an UI control and attach logic to it. Again, it's a similar idea as earlier.

## Implementing Editing for `Lane` names

To edit a `Lane` name, we need a little bit of logic and UI hooks. `Editable` can handle the UI part. Logic will take more work. To get started, tweak `LaneHeader` as follows:

**app/components/LaneHeader.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
import LaneActions from '../actions/LaneActions';
leanpub-start-insert
import Editable from './Editable';
leanpub-end-insert

export default connect(() => ({}), {
  NoteActions,
  LaneActions
})(({lane, LaneActions, NoteActions, ...props}) => {
  const addNote = e => {
    ...
  };
leanpub-start-insert
  const activateLaneEdit = () => {
    LaneActions.update({
      id: lane.id,
      editing: true
    });
  };
  const editName = name => {
    LaneActions.update({
      id: lane.id,
      name,
      editing: false
    });
  };
leanpub-end-insert

  return (
leanpub-start-delete
    <div className="lane-header" {...props}>
leanpub-end-delete
leanpub-start-insert
    <div className="lane-header" onClick={activateLaneEdit} {...props}>
leanpub-end-insert
    <div className="lane-header" {...props}>

      <div className="lane-add-note">
        <button onClick={addNote}>+</button>
      </div>
leanpub-start-delete
      <div className="lane-name">{lane.name}</div>
leanpub-end-delete
leanpub-start-insert
      <Editable className="lane-name" editing={lane.editing}
        value={lane.name} onEdit={editName} />
leanpub-end-insert
    </div>
  );
})
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

**app/components/LaneHeader.jsx**

```javascript
...

export default connect(() => ({}), {
  NoteActions,
  LaneActions
})(({lane, LaneActions, NoteActions, ...props}) => {
  ...
leanpub-start-insert
  const deleteLane = e => {
    // Avoid bubbling to edit
    e.stopPropagation();

    LaneActions.delete(lane.id);
  };
leanpub-end-insert

  return (
    <div className="lane-header" onClick={activateLaneEdit} {...props}>
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
  );
});
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

As we added `Lanes` to the application, the styling went a bit off. Adjust as follows to make it a little nicer:

**app/main.css**

```css
body {
  background-color: cornsilk;

  font-family: sans-serif;
}

leanpub-start-delete
.add-note {
  background-color: #fdfdfd;

  border: 1px solid #ccc;
}
leanpub-end-delete

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

![Styled Kanban](images/kanban_styled.png)

As this is a small project, we can leave the CSS in a single file like this. In case it starts growing, consider separating it to multiple files. One way to do this is to extract CSS per component and then refer to it there (e.g., `require('./lane.css')` at `Lane.jsx`). You could even consider using **CSS Modules** to make your CSS default to local scope. See the *Styling React* chapter for further ideas.

## Conclusion

Even though our application is starting to look good and has basic functionality in it, it's still missing perhaps the most vital feature. We still cannot move notes between lanes. This is something we will resolve in the next chapter as we implement drag and drop.
