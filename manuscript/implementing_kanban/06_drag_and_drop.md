# Implementing Drag and Drop

Our Kanban application is almost usable now. It looks alright and there's basic functionality in place. In this chapter, we will integrate drag and drop functionality to it as we set up [React DnD](https://gaearon.github.io/react-dnd/).

After this chapter, you should be able to sort notes within a lane and drag them from one lane to another. Although this sounds simple, there is quite a bit of work to do as we need to annotate our components the right way and develop the logic needed.

## Setting Up React DnD

As the first step, we need to connect React DnD with our project. We are going to use the HTML5 Drag and Drop based back-end. There are specific back-ends for testing and [touch](https://github.com/yahoo/react-dnd-touch-backend).

In order to set it up, we need to use the `DragDropContext` decorator and provide the HTML5 back-end to it. To avoid unnecessary wrapping, I'll use Redux `compose` to keep the code neater and more readable:

**app/components/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
leanpub-start-insert
import {compose} from 'redux';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
leanpub-end-insert
import connect from '../libs/connect';
import Lanes from './Lanes';
import LaneActions from '../actions/LaneActions';

const App = ({LaneActions, lanes}) => {
  const addLane = () => {
    LaneActions.create({
      id: uuid.v4(),
      name: 'New lane'
    });
  };

  return (
    <div>
      <button className="add-lane" onClick={addLane}>+</button>
      <Lanes lanes={lanes} />
    </div>
  );
};

leanpub-start-delete
export default connect(({lanes}) => ({
  lanes
}), {
  LaneActions
})(App)
leanpub-end-delete
leanpub-start-insert
export default compose(
  DragDropContext(HTML5Backend),
  connect(({lanes}) => ({
    lanes
  }), {
    LaneActions
  })
)(App)
leanpub-end-insert
```

After this change, the application should look exactly the same as before. We are ready to add some sweet functionality to it now.

## Allowing Notes to Be Dragged

Allowing notes to be dragged is a good first step. Before that, we need to set up a constant so that React DnD can tell different kind of draggables apart. Set up a file for tracking `Note` as follows:

**app/constants/itemTypes.js**

```javascript
export default {
  NOTE: 'note'
};
```

This definition can be expanded later as we add new types, such as `LANE`, to the system.

Next, we need to tell our `Note` that it's possible to drag it. This can be achieved using the `DragSource` annotation. Replace `Note` with the following implementation:

**app/components/Note.jsx**

```javascript
import React from 'react';
import {DragSource} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = ({
  connectDragSource, children, ...props
}) => {
  return connectDragSource(
    <div {...props}>
      {children}
    </div>
  );
};

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

export default DragSource(ItemTypes.NOTE, noteSource, connect => ({
  connectDragSource: connect.dragSource()
}))(Note)
```

If you try to drag a `Note` now, you should see something like this at the browser console:

```bash
begin dragging note Object {className: "note", children: Array[2]}
```

Just being able to drag notes isn't enough. We need to annotate them so that they can accept dropping. Eventually this will allow us to swap them as we can trigger logic when we are trying to drop a note on top of another.

T> In case we wanted to implement dragging based on a handle, we could apply `connectDragSource` only to a specific part of a `Note`.

W> Note that React DnD doesn't support hot loading perfectly. You may need to refresh the browser to see the log messages you expect!

## Allowing Notes to Detect Hovered Notes

Annotating notes so that they can notice that another note is being hovered on top of them is a similar process. In this case we'll have to use a `DropTarget` annotation:

**app/components/Note.jsx**

```javascript
import React from 'react';
leanpub-start-delete
import {DragSource} from 'react-dnd';
leanpub-end-delete
leanpub-start-insert
import {compose} from 'redux';
import {DragSource, DropTarget} from 'react-dnd';
leanpub-end-insert
import ItemTypes from '../constants/itemTypes';

const Note = ({
leanpub-start-delete
  connectDragSource, children, ...props
leanpub-end-delete
leanpub-start-insert
  connectDragSource, connectDropTarget,
  children, ...props
leanpub-end-insert
}) => {
leanpub-start-delete
  return connectDragSource(
leanpub-end-delete
leanpub-start-insert
  return compose(connectDragSource, connectDropTarget)(
leanpub-end-insert
    <div {...props}>
      {children}
    </div>
  );
};

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

leanpub-start-insert
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();

    console.log('dragging note', sourceProps, targetProps);
  }
};
leanpub-end-insert

leanpub-start-delete
export default DragSource(ItemTypes.NOTE, noteSource, connect => ({
  connectDragSource: connect.dragSource()
}))(Note)
leanpub-end-delete
leanpub-start-insert
export default compose(
  DragSource(ItemTypes.NOTE, noteSource, connect => ({
    connectDragSource: connect.dragSource()
  })),
  DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  }))
)(Note)
leanpub-end-insert
```

If you try hovering a dragged note on top of another now, you should see messages like this at the console:

```bash
dragging note Object {} Object {className: "note", children: Array[2]}
```

Both decorators give us access to the `Note` props. In this case, we are using `monitor.getItem()` to access them at `noteTarget`. This is the key to making this to work properly.

## Developing `onMove` API for `Notes`

Now, that we can move notes around, we can start to define logic. The following steps are needed:

1. Capture `Note` id on `beginDrag`.
2. Capture target `Note` id on `hover`.
3. Trigger `onMove` callback on `hover` so that we can deal with the logic elsewhere. `LaneStore` would be the ideal place for that.

Based on the idea above we can see we should pass id to a `Note` through a prop. We also need to set up a `onMove` callback, define `LaneActions.move`, and `LaneStore.move` stub.

### Accepting `id` and `onMove` at `Note`

We can accept `id` and `onMove` props at `Note` like below. There is an extra check at `noteTarget` as we don't need trigger `hover` in case we are hovering on top of the `Note` itself:

**app/components/Note.jsx**

```javascript
...

const Note = ({
  connectDragSource, connectDropTarget,
leanpub-start-delete
  children, ...props
leanpub-end-delete
leanpub-start-insert
  oMove, id, children, ...props
leanpub-end-insert
}) => {
  return compose(connectDragSource, connectDropTarget)(
    <div {...props}>
      {children}
    </div>
  );
};

leanpub-start-delete
const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};
leanpub-end-delete
leanpub-start-insert
const noteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};
leanpub-end-insert

leanpub-start-delete
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();

    console.log('dragging note', sourceProps, targetProps);
  }
};
leanpub-end-delete
leanpub-start-insert
const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(sourceId !== targetId) {
      targetProps.onMove({sourceId, targetId});
    }
  }
};
leanpub-end-insert

...
```

Having these props isn't useful if we don't pass anything to them at `Notes`. That's our next step.

### Passing `id` and `onMove` from `Notes`

Passing a note `id` and `onMove` is simple enough:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';
import Editable from './Editable';

export default ({
  notes,
  onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => (
  <ul className="notes">{notes.map(({id, editing, task}) =>
    <li key={id}>
leanpub-start-delete
      <Note className="note" onClick={onNoteClick.bind(null, id)}>
leanpub-end-delete
leanpub-start-insert
      <Note className="note" id={id}
        onClick={onNoteClick.bind(null, id)}
        onMove={({sourceId, targetId}) =>
          console.log('moving from', sourceId, 'to', targetId)}>
leanpub-end-insert
        <Editable
          className="editable"
          editing={editing}
          value={task}
          onEdit={onEdit.bind(null, id)} />
        <button
          className="delete"
          onClick={onDelete.bind(null, id)}>x</button>
      </Note>
    </li>
  )}</ul>
)
```

If you hover a note on top of another, you should see console messages like this:

```bash
moving from 3310916b-5b59-40e6-8a98-370f9c194e16 to 939fb627-1d56-4b57-89ea-04207dbfb405
```

## Adding Action and Store Method for Moving

The logic of drag and drop goes as follows. Suppose we have a lane containing notes A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F.

In our case, we'll get some extra complexity due to lane to lane dragging. When we move a `Note`, we know its original position and the intended target position. `Lane` knows what `Notes` belong to it by id. We are going to need some way to tell `LaneStore` that it should perform the logic over the given notes. A good starting point is to define `LaneActions.move`:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete',
  'attachToLane', 'detachFromLane',
  'move'
);
```

We should connect this action with the `onMove` hook we just defined:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';
import Editable from './Editable';
leanpub-start-insert
import LaneActions from '../actions/LaneActions';
leanpub-end-insert

export default ({
  notes,
  onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => (
  <ul className="notes">{notes.map(({id, editing, task}) =>
    <li key={id}>
      <Note className="note" id={id}
        onClick={onNoteClick.bind(null, id)}
leanpub-start-delete
        onMove={({sourceId, targetId}) =>
          console.log('moving from', sourceId, 'to', targetId)}>
leanpub-end-delete
leanpub-start-insert
        onMove={LaneActions.move}>
leanpub-end-insert
        <Editable
          className="editable"
          editing={editing}
          value={task}
          onEdit={onEdit.bind(null, id)} />
        <button
          className="delete"
          onClick={onDelete.bind(null, id)}>x</button>
      </Note>
    </li>
  )}</ul>
)
```

T> It could be a good idea to refactor `onMove` as a prop to make the system more flexible. In our implementation the `Notes` component is coupled with `LaneActions`. This isn't particularly nice if you want to use it in some other context.

We should also define a stub at `LaneStore` to see that we wired it up correctly:

**app/stores/LaneStore.js**

```javascript
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  ...
  detachFromLane({laneId, noteId}) {
    ...
  }
leanpub-start-insert
  move({sourceId, targetId}) {
    console.log(`source: ${sourceId}, target: ${targetId}`);
  }
leanpub-end-insert
}
```

You should see the same log messages as earlier.

Next, we'll need to add some logic to make this work. We can use the logic outlined above here. We have two cases to worry about: moving within a lane itself and moving from lane to another.

## Implementing Note Drag and Drop Logic

Moving within a lane itself is complicated. When you are operating based on ids and perform operations one at a time, you'll need to take possible index alterations into account. As a result, I'm using `update` [immutability helper](https://facebook.github.io/react/docs/update.html) from React as that solves the problem in one pass.

It is possible to solve the lane to lane case using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice). First, we `splice` out the source note, and then we `splice` it to the target lane. Again, `update` could work here, but I didn't see much point in that given `splice` is nice and simple. The code below illustrates a mutation based solution:

**app/stores/LaneStore.js**

```javascript
leanpub-start-insert
import update from 'react-addons-update';
leanpub-end-insert
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  ...
leanpub-start-delete
  move({sourceId, targetId}) {
    console.log(`source: ${sourceId}, target: ${targetId}`);
  }
leanpub-end-delete
leanpub-start-insert
  move({sourceId, targetId}) {
    const lanes = this.lanes;
    const sourceLane = lanes.filter(lane => lane.notes.includes(sourceId))[0];
    const targetLane = lanes.filter(lane => lane.notes.includes(targetId))[0];
    const sourceNoteIndex = sourceLane.notes.indexOf(sourceId);
    const targetNoteIndex = targetLane.notes.indexOf(targetId);

    if(sourceLane === targetLane) {
      // move at once to avoid complications
      sourceLane.notes = update(sourceLane.notes, {
        $splice: [
          [sourceNoteIndex, 1],
          [targetNoteIndex, 0, sourceId]
        ]
      });
    }
    else {
      // get rid of the source
      sourceLane.notes.splice(sourceNoteIndex, 1);

      // and move it to target
      targetLane.notes.splice(targetNoteIndex, 0, sourceId);
    }

    this.setState({lanes});
  }
leanpub-end-insert
}
```

If you try out the application now, you can actually drag notes around and it should behave as you expect. Dragging to empty lanes doesn't work, though, and the presentation could be better.

It would be nicer if we indicated the dragged note's location more clearly. We can do this by hiding the dragged note from the list. React DnD provides us the hooks we need for this purpose.

### Indicating Where to Move

React DnD provides a feature known as state monitors. Through it we can use `monitor.isDragging()` and `monitor.isOver()` to detect which `Note` we are currently dragging. It can be set up as follows:

**app/components/Note.jsx**

```javascript
import React from 'react';
import {compose} from 'redux';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = ({
leanpub-start-delete
  connectDragSource, connectDropTarget,
  oMove, id, children, ...props
leanpub-end-delete
leanpub-start-insert
  connectDragSource, connectDropTarget, isDragging,
  isOver, onMove, id, children, ...props
leanpub-end-insert
}) => {
  return compose(connectDragSource, connectDropTarget)(
leanpub-start-delete
    <div {...props}>
      {children}
    </div>
leanpub-end-delete
leanpub-start-insert
    <div style={{
      opacity: isDragging || isOver ? 0 : 1
    }} {...props}>{children}</div>
leanpub-end-insert
  );
};

...

export default compose(
leanpub-start-delete
  DragSource(ItemTypes.NOTE, noteSource, connect => ({
    connectDragSource: connect.dragSource()
  })),
  DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  }))
leanpub-end-delete
leanpub-start-insert
  DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })),
  DropTarget(ItemTypes.NOTE, noteTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }))
leanpub-end-insert
)(Note)
```

If you drag a note within a lane, the dragged note should be shown as blank.

There is one little problem in our system. We cannot drag notes to an empty lane yet.

## Dragging Notes to Empty Lanes

To drag notes to empty lanes, we should allow them to receive notes. Just as above, we can set up `DropTarget` based logic for this. First, we need to capture the drag on `Lane`:

**app/components/Lane.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import {compose} from 'redux';
import {DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';
leanpub-end-insert
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
import LaneActions from '../actions/LaneActions';
import Notes from './Notes';
import LaneHeader from './LaneHeader';

const Lane = ({
leanpub-start-delete
  lane, notes, LaneActions, NoteActions, ...props
leanpub-end-delete
leanpub-start-insert
  connectDropTarget, lane, notes, LaneActions, NoteActions, ...props
leanpub-end-insert
}) => {
  ...

leanpub-start-delete
  return (
leanpub-end-delete
leanpub-start-insert
  return connectDropTarget(
leanpub-end-insert
    ...
  );
};

function selectNotesByIds(allNotes, noteIds = []) {
  ...
}

leanpub-start-insert
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    // If the target lane doesn't have notes,
    // attach the note to it.
    //
    // `attachToLane` performs necessarly
    // cleanup by default and it guarantees
    // a note can belong only to a single lane
    // at a time.
    if(!targetProps.lane.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.lane.id,
        noteId: sourceId
      });
    }
  }
};
leanpub-end-insert

leanpub-start-delete
export default connect(
  ({notes}) => ({
    notes
  }), {
    NoteActions,
    LaneActions
  }
)(Lane)
leanpub-end-delete
leanpub-start-insert
export default compose(
  DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  })),
  connect(({notes}) => ({
    notes
  }), {
    NoteActions,
    LaneActions
  })
)(Lane)
leanpub-end-insert
```

After attaching this logic, you should be able to drag notes to empty lanes.

Our current implementation of `attachToLane` does a lot of the hard work for us. If it didn't guarantee that a note can belong only to a single lane at a time, we would need to adjust our logic. It's good to have these sort of invariants within the state management system.

### Fixing Editing Behavior During Dragging

The current implementation has a small glitch. If you edit a note, you can still drag it around while it's being edited. This isn't ideal as it overrides the default behavior most people are used to. You cannot for instance double-click on an input to select all the text.

Fortunately, this is simple to fix. We'll need to use the `editing` state per each `Note` to adjust its behavior. First we need to pass `editing` state to an individual `Note`:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';
import Editable from './Editable';
import LaneActions from '../actions/LaneActions';

export default ({
  notes,
  onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => (
  <ul className="notes">{notes.map(({id, editing, task}) =>
    <li key={id}>
      <Note className="note" id={id}
leanpub-start-insert
        editing={editing}
leanpub-end-insert
        onClick={onNoteClick.bind(null, id)}
        onMove={LaneActions.move}>
        <Editable
          className="editable"
          editing={editing}
          value={task}
          onEdit={onEdit.bind(null, id)} />
        <button
          className="delete"
          onClick={onDelete.bind(null, id)}>x</button>
      </Note>
    </li>
  )}</ul>
)
```

Next we need to take this into account while rendering:

**app/components/Note.jsx**

```javascript
import React from 'react';
import {compose} from 'redux';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = ({
  connectDragSource, connectDropTarget, isDragging,
leanpub-start-delete
  isOver, onMove, id, children, ...props
leanpub-end-delete
leanpub-start-insert
  isOver, onMove, id, editing, children, ...props
leanpub-end-insert
}) => {
leanpub-start-insert
  // Pass through if we are editing
  const dragSource = editing ? a => a : connectDragSource;
leanpub-end-insert

leanpub-start-delete
  return compose(connectDragSource, connectDropTarget)(
leanpub-end-delete
leanpub-start-insert
  return compose(dragSource, connectDropTarget)(
leanpub-end-insert
    <div style={{
      opacity: isDragging || isOver ? 0 : 1
    }} {...props}>{children}</div>
  );
};

...
```

This small change gives us the behavior we want. If you try to edit a note now, the input should work as you might expect it to behave normally.

Design-wise it was a good idea to keep `editing` state outside of `Editable`. If we hadn't done that, implementing this change would have been a lot harder as we would have had to extract the state outside of the component.

Now we have a Kanban table that is actually useful! We can create new lanes and notes, and edit and remove them. In addition we can move notes around. Mission accomplished!

## Conclusion

In this chapter, you saw how to implement drag and drop for our little application. You can model sorting for lanes using the same technique. First, you mark the lanes to be draggable and droppable, then you sort out their ids, and finally, you'll add some logic to make it all work together. It should be considerably simpler than what we did with notes.

I encourage you to expand the application. The current implementation should work just as a starting point for something greater. Besides extending the DnD implementation, you can try adding more data to the system. You could also do something to the visual outlook. One option would be to try out various styling approaches discussed at the *Styling React* chapter.

To make it harder to break the application during development, you can also implement tests as discussed at *Testing React*. *Typing with React* discussed yet more ways to harden your code. Learning these approaches can be worthwhile. Sometimes it may be worth your while to design your applications test first. It is a valuable approach as it allows you to document your assumptions as you go.
