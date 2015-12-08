# Implementing Drag and Drop

Our Kanban application is almost usable now. It looks alright and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane and drag them from one lane to another.

## Setting Up React DnD

Before going further hit

```bash
npm i react-dnd react-dnd-html5-backend --save
```

to add React DnD to the project.

As a first step we'll need to connect it with our project. Currently it provides an HTML5 Drag and Drop API specific back-end. There's no official support for touch yet, but it's possible to add later on. In order to set it up, we need to use the `DragDropContext` decorator and provide the back-end to it:

**app/components/App.jsx**

```javascript
...
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext(HTML5Backend)
export default class App extends React.Component {
  ...
}
```

After this change the application should look exactly the same as before. We are now ready to add some sweet functionality to it.

T> Decorators provide us simple means to annotate our components. Alternatively we could use syntax such as `DragDropContext(HTML5Backend)(App)` but this would get rather unwieldy when we want to apply multiple decorators. It's a valid alternative, though. See the decorator appendix to understand in detail how they work and how to implement them yourself.

T> Back-ends allow us to customize React DnD behavior. For instance, we can add [support for touch](https://github.com/gaearon/react-dnd/pull/240) to our application using one. There's also a testing specific one available.

## Preparing Notes to Be Sorted

Next we will need to tell React DnD what can be dragged and where. Since we want to move notes, we'll need to annotate them accordingly. In addition, we'll need some logic to tell what happens during this process.

Earlier we extracted editing functionality from `Note` and ended up dropping `Note`. It seems like we'll want to add that concept back to allow drag and drop.

We can use a handy little technique here that allows us to avoid code duplication. We can implement `Note` as a wrapper component. It will accept `Editable` and render it. This will allow us to keep DnD related logic in `Note`. This avoids having to duplicate any logic related to `Editable`.

The magic lies in a single property known as `children`. React will render possible child components in the slot `{this.props.children}` as shown below:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return (
      <li {...this.props}>{this.props.children}</li>
    );
  }
}
```

We also need to tweak `Notes` to use our wrapper component. We will simply wrap `Editable` using `Note`, and we are good to go. We will pass `note` data to the wrapper as we'll need that later when dealing with logic:

**app/components/Notes.jsx**

```javascript
...
import Note from './Note.jsx';

export default class Notes extends React.Component {
  ...
  renderNote = (note) => {
    return (
      <Note className="note" id={note.id} key={note.id}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)}
          onDelete={this.props.onDelete.bind(null, note.id)} />
      </Note>
    );
  }
}
```

After this change the application should look exactly the same as before. We have achieved nothing yet. Fortunately we can start adding functionality, now that we have the foundation in place.

## Allowing Notes to Be Dragged

React DnD uses constants to tell different draggables apart. Set up a file for tracking `Note` as follows:

**app/constants/itemTypes.js**

```javascript
export default {
  NOTE: 'note'
};
```

This definition can be expanded later as we add new types to the system.

Next we need to tell our `Note` that it's possible to drag and drop it. This is done through `@DragSource` and `@DropTarget` annotations.

### Setting Up `Note` `@DragSource`

Marking a component as a `@DragSource` simply means that it can be dragged. Set up the annotation as follows:

**app/components/Note.jsx**

```javascript
...
import {DragSource} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
export default class Note extends React.Component {
  render() {
    const {connectDragSource, id, onMove, ...props} = this.props;

    return connectDragSource(
      <li {...props}>{props.children}</li>
    );
  }
}
```

There are a couple of important changes:

* We set up imports for the new logic.
* We defined a `noteSource`. It contains a `beginDrag` handler. We can set the initial state for dragging here. For now we just have a debug log there.
* `@DragSource` connects `NOTE` item type with `noteSource`.
* `id` and `onMove` props are extracted from `this.props`. We'll use these later on to set up a callback so that the parent of a `Note` can deal with the moving related logic.
* Finally `connectDragSource` prop wraps the element at `render()`. It could be applied to a specific part of it. This would be handy for implementing handles for example.

If you drag a `Note` now, you should see a debug log at the console.

We still need to make sure `Note` works as a `@DropTarget`. Later on this will allow swapping them as we add logic in place.

W> Note that React DnD doesn't support hot loading perfectly. You may need to refresh the browser to see the logs you expect!

### Setting Up `Note` `@DropTarget`

`@DropTarget` allows a component to receive components annotated with `@DragSource`. As `@DropTarget` triggers, we can perform actual logic based on the components. Expand as follows:

**app/components/Note.jsx**

```javascript
...
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();

    console.log('dragging note', sourceProps, targetProps);
  }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget,
      id, onMove, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
```

Besides the initial debug log, we should see way more logs as we drag a `Note` around. Note that both decorators give us access to the `Note` props. In this case we are using `monitor.getItem()` to access them at `noteTarget`.

## Developing `onMove` API for `Notes`

Now that we can move notes around, we still need to define logic. The following steps are needed:

* Capture `Note` id on `beginDrag`.
* Capture target `Note` id on `hover`.
* Trigger `onMove` callback on `hover` so that we can deal with the logic at a higher level.

You can see how this translates to code below:

**app/components/Note.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

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

...
```

If you run the application now, you'll likely get a bunch of `onMove` related errors. We should make `Notes` aware of that:

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  ...
  renderNote = (note) => {
    return (
      <Note className="note" onMove={this.onMoveNote}
        id={note.id} key={note.id}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)}
          onDelete={this.props.onDelete.bind(null, note.id)} />
      </Note>
    );
  }
  onMoveNote({sourceId, targetId}) {
    console.log('source', sourceId, 'target', targetId);
  }
}
```

If you drag a `Note` around now, you should see logs like `source <id> target <id>` in the console. We are getting close. We still need to figure out what to do with these ids, though.

## Adding Action and Store Method for Moving

The logic of drag and drop is quite simple. Suppose we have a lane containing notes A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F.

In our case, we'll get some extra complexity due to lane to lane dragging. When we move a `Note`, we know its original position and the intended target position. `Lane` knows what `Notes` belong to it by id. We are going to need some way to tell `LaneStore` that it should perform the logic over given notes. A good starting point is to define `LaneActions.move`:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete',
  'attachToLane', 'detachFromLane',
  'move'
);
```

We should connect this action with `onMove` hook we just defined:

**app/components/Notes.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

export default class Notes extends React.Component {
  ...
  renderNote = (note) => {
    return (
      <Note className="note" onMove={LaneActions.move}
        id={note.id} key={note.id}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)}
          onDelete={this.props.onDelete.bind(null, note.id)} />
      </Note>
    );
  }
}
```

We should also define a stub at `LaneStore` to see that we wired it up correctly:

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  move({sourceId, targetId}) {
    console.log('source', sourceId, 'target', targetId);
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

You should see the same logs as earlier. Next, we'll need to add some logic to make this work. We can use the logic outlined above here. We have two cases to worry about. Moving within a lane itself and moving from lane to another.

## Implementing Note Drag and Drop Logic

Moving within a lane itself is more complicated. When you are operating based on ids and perform operations one at a time, you'll need to take possible index alterations into account. As a result, I'm using `update` [immutability helper](https://facebook.github.io/react/docs/update.html) from React as that solves the problem in one pass. It is included in a separate package. To get started, install it using:

```bash
npm i react-addons-update --save
```

It is possible to solve the lane to lane case using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice). First we `splice` out the source note, and then we `splice` it to the target lane. Again, `update` could work here, but I didn't see much point in that given `splice` is nice and simple. The code below illustrates a mutation based solution:

**app/stores/LaneStore.js**

```javascript
...
import update from 'react-addons-update';

export default class LaneStore {
  ...
  move({sourceId, targetId}) {
    const lanes = this.lanes;
    const sourceLane = lanes.filter((lane) => {
      return lane.notes.indexOf(sourceId) >= 0;
    })[0];
    const targetLane = lanes.filter((lane) => {
      return lane.notes.indexOf(targetId) >= 0;
    })[0];
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
}
```

If you try out the application now, you can actually drag notes around and it should behave as you expect. The presentation could be better, though.

It would be better if indicated the note target better. We can do this by hiding the dragged note from the list. React DnD provides us the hooks we need.

### Indicating Where to Move

React DnD provides a feature known as state monitors. We can use `monitor.isDragging()` to detect which note we are currently dragging. It can be set up as follows:

**app/components/Note.jsx**

```javascript
...

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging() // map isDragging() state to isDragging prop
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget, isDragging,
      onMove, id, ...props} = this.props;

      return connectDragSource(connectDropTarget(
        <li style={{
          opacity: isDragging ? 0 : 1
        }} {...props}>{props.children}</li>
      ));
  }
}
```

If you drag a note within a lane, you should see the behavior we expect. The target should be shown as blank. If you try moving the note to another lane and move it there, you will see this doesn't quite work.

The problem is that our note component gets unmounted during this process. This makes it lose `isDragging` state. Fortunately we can override the default behavior by implementing a `isDragging` check of our own to fix the issue. Perform the following addition:

**app/components/Note.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  },
  isDragging(props, monitor) {
    return props.id === monitor.getItem().id;
  }
};

...
```

This tells React DnD to perform our custom check instead of relying on the default logic. After this change, unmounting won't be an issue and the feature works as we expect.

There is one little problem in our system. We cannot drag notes to an empty lane yet.

## Dragging Notes to an Empty Lanes

To drag notes to an empty lane, we should allow lanes to receive notes. Just as above, we can set up `DropTarget` based logic for this. First we need to capture the drag on `Lane`:

**app/components/Lane.jsx**

```javascript
...
import {DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    console.log('source', sourceId, 'target', targetId);
  }
};

@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Lane extends React.Component {
  ...
  render() {
    const {connectDropTarget, lane, ...props} = this.props;

    return connectDropTarget(
      ...
    );
  }
}
```

If you drag a note to a lane now, you should see logs at your console. The question is what to do with this data? Before actually moving the note to a lane, we should check whether it's empty or not. If it has content already, the operation doesn't make sense. Our existing logic can deal with that.

This is a simple check to make. Given we know the target lane at our `noteTarget` `hover` handler, we can check its `notes` array as follows:

**app/components/Lane.jsx**

```javascript
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      console.log('source', sourceId, 'target', targetProps);
    }
  }
};
```

If you refresh your browser and drag around now, the log should appear only when you drag a note to a lane that doesn't have any notes attached to it yet.

### Triggering `move` Logic

Now we know what `Note` to move into which `Lane`. `LaneStore.attachToLane` is ideal for this purpose. Adjust `Lane` as follows:

**app/components/Lane.jsx**

```javascript
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.lane.id,
        noteId: sourceId
      });
    }
  }
};
```

There is one problem, though. What happens to the old instance of the `Note`? In the current solution, the old lane will have an id pointing to it. As a result we have duplicate data in the system.

Earlier we resolved this using `detachFromLane`. The problem is that we don't know to which lane the note belonged. We could pass this data through the component hierarchy, but that doesn't feel particularly nice.

We could resolve this on store level instead by implementing an invariant at `attachToLane` that makes sure any possible earlier references get removed. This can be achieved by implementing `this.removeNote(noteId)` check:

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    if(!noteId) {
      this.waitFor(NoteStore);

      noteId = NoteStore.getState().notes.slice(-1)[0].id;
    }

    this.removeNote(noteId);

    ...
  }
  removeNote(noteId) {
    const lanes = this.lanes;
    const removeLane = lanes.filter((lane) => {
      return lane.notes.indexOf(noteId) >= 0;
    })[0];

    if(!removeLane) {
      return;
    }

    const removeNoteIndex = removeLane.notes.indexOf(noteId);

    removeLane.notes = removeLane.notes.slice(0, removeNoteIndex).
      concat(removeLane.notes.slice(removeNoteIndex + 1));
  }
  ...
}
```

`removeNote(noteId)` goes through `LaneStore` data. If it finds a note by id, it will get rid of it. After that we have a clean slate, and we can add a note to a lane. This change allows us to drop `detachFromLane` from the system entirely, but I'll leave that up to you.

Now we have a Kanban table that is actually useful! We can create new lanes and notes, and edit and remove them. In addition we can move notes around. Mission accomplished!

## Conclusion

In this chapter you saw how to implement drag and drop for our little application. You can model sorting for lanes using the same technique. First you mark the lanes to be draggable and droppable, then you sort out their ids, and finally you'll add some logic to make it all work together. It should be considerably simpler than what we did with notes.

I encourage you to expand the application. The current implementation should work just as a starting point for something greater. Besides extending the DnD implementation, you can try adding more data to the system.

In the next chapter we'll set up a production level build for our application. You can use the same techniques in your own projects.
