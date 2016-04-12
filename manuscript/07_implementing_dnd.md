# Implementing Drag and Drop

Our Kanban application is almost usable now. It looks alright and there's some basic functionality in place. In this chapter, I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter, you should be able to sort notes within a lane and drag them from one lane to another.

## Setting Up React DnD

As a first step, we'll need to connect React DnD with our project. We are going to use the HTML5 Drag and Drop based back-end. There are specific back-ends for testing and [touch](https://github.com/yahoo/react-dnd-touch-backend). In order to set it up, we need to use the `DragDropContext` decorator and provide the back-end to it:

**app/components/App.jsx**

```javascript
...
leanpub-start-insert
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
leanpub-end-insert

leanpub-start-insert
@DragDropContext(HTML5Backend)
leanpub-end-insert
export default class App extends React.Component {
  ...
}
```

After this change, the application should look exactly the same as before. We are now ready to add some sweet functionality to it.

T> If you aren't using *npm-install-webpack-plugin*, remember to install *react-dnd* and associated utilities to your project through `npm i react-dnd react-dnd-html5-backend react-addons-update -S`.

T> Decorators provide us simple means to annotate our components. Alternatively we could use syntax, such as `DragDropContext(HTML5Backend)(App)`, but this would get rather unwieldy when we want to apply multiple decorators. See the decorator appendix to understand in detail how they work and how to implement them yourself.

## Preparing Notes to Be Sorted

Next, we will need to tell React DnD what can be dragged and where. Since we want to move notes, we'll need to annotate them accordingly. In addition, we'll need some logic to tell what happens during this process.

Earlier, we extracted editing functionality from `Note` and ended up dropping `Note`. It seems like we'll want to add that concept back to allow drag and drop.

We can use a handy little technique here that allows us to avoid code duplication. We can implement `Note` as a wrapper component. It will accept `Editable` and render it. This will allow us to keep DnD related logic in `Note`. This avoids having to duplicate any logic related to `Editable`.

The magic lies in a React property known as `children`. React will render possible child components in the slot `{this.props.children}`. Replace *Note.jsx* with the code shown below:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <li {...this.props}>{this.props.children}</li>;
  }
}
```

We also need to tweak `Notes` to use our wrapper component. We will simply wrap `Editable` using `Note`, and we are good to go. We will pass `note` data to the wrapper as we'll need that later when dealing with logic:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable.jsx';
leanpub-start-insert
import Note from './Note.jsx';
leanpub-end-insert

export default ({notes, onValueClick, onEdit, onDelete}) => {
  return (
    <ul className="notes">{notes.map(note =>
leanpub-start-delete
      <li className="note" key={note.id}>
        <Editable
          editing={note.editing}
          value={note.task}
          onValueClick={onValueClick.bind(null, note.id)}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
      </li>
leanpub-end-delete
leanpub-start-insert
      <Note className="note" id={note.id} key={note.id}>
        <Editable
          editing={note.editing}
          value={note.task}
          onValueClick={onValueClick.bind(null, note.id)}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
      </Note>
leanpub-end-insert
    )}</ul>
  );
}
```

After this change, the application should look exactly the same as before. We have achieved nothing yet. Fortunately, we can start adding functionality, now that we have the foundation in place.

## Allowing Notes to Be Dragged

React DnD uses constants to tell different draggables apart. Set up a file for tracking `Note` as follows:

**app/constants/itemTypes.js**

```javascript
export default {
  NOTE: 'note'
};
```

This definition can be expanded later as we add new types to the system.

Next, we need to tell our `Note` that it's possible to drag and drop it. This is done through `@DragSource` and `@DropTarget` annotations.

### Setting Up `Note` `@DragSource`

Marking a component as a `@DragSource` simply means that it can be dragged. Set up the annotation like this:

**app/components/Note.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import {DragSource} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};
leanpub-end-insert

leanpub-start-delete
export default class Note extends React.Component {
  render() {
    return <li {...this.props}>{this.props.children}</li>;
  }
}
leanpub-end-delete
leanpub-start-insert
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
leanpub-end-insert
```

There are a couple of important changes:

* We set up imports for the new logic.
* We defined a `noteSource`. It contains a `beginDrag` handler. We can set the initial state for dragging here. For now we just have a debug log there.
* `@DragSource` connects `NOTE` item type with `noteSource`.
* `id` and `onMove` props are extracted from `this.props`. We'll use these later on to set up a callback so that the parent of a `Note` can deal with the moving related logic.
* Finally `connectDragSource` prop wraps the element at `render()`. It could be applied to a specific part of it. This would be handy for implementing handles for example.

If you drag a `Note` now, you should see a debug message at the console.

We still need to make sure `Note` works as a `@DropTarget`. Later on this will allow swapping them as we add logic in place.

W> Note that React DnD doesn't support hot loading perfectly. You may need to refresh the browser to see the log messages you expect!

### Setting Up `Note` `@DropTarget`

`@DropTarget` allows a component to receive components annotated with `@DragSource`. As `@DropTarget` triggers, we can perform actual logic based on the components. Expand as follows:

**app/components/Note.jsx**

```javascript
import React from 'react';
leanpub-start-delete
import {DragSource} from 'react-dnd';
leanpub-end-delete
leanpub-start-insert
import {DragSource, DropTarget} from 'react-dnd';
leanpub-end-insert
import ItemTypes from '../constants/itemTypes';

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

@DragSource(ItemTypes.NOTE, noteSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
leanpub-start-insert
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
leanpub-end-insert
export default class Note extends React.Component {
leanpub-start-delete
  render() {
    const {connectDragSource, id, onMove, ...props} = this.props;

    return connectDragSource(
      <li {...props}>{props.children}</li>
    );
  }
leanpub-end-delete
leanpub-start-insert
  render() {
    const {connectDragSource, connectDropTarget,
      id, onMove, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
leanpub-end-insert
}
```

Refresh the browser and try to drag a note around. You should see a lot of log messages.

Both decorators give us access to the `Note` props. In this case, we are using `monitor.getItem()` to access them at `noteTarget`. This is the key to making this to work properly.

## Developing `onMove` API for `Notes`

Now, that we can move notes around, we still need to define logic. The following steps are needed:

1. Capture `Note` id on `beginDrag`.
2. Capture target `Note` id on `hover`.
3. Trigger `onMove` callback on `hover` so that we can deal with the logic at a higher level.

You can see how this translates to code below:

**app/components/Note.jsx**

```javascript
...

const noteSource = {
leanpub-start-delete
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
leanpub-end-delete
leanpub-start-insert
  beginDrag(props) {
    return {
      id: props.id
    };
  }
leanpub-end-insert
};

const noteTarget = {
leanpub-start-delete
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();

    console.log('dragging note', sourceProps, targetProps);
  }
leanpub-end-delete
leanpub-start-insert
  hover(targetProps, monitor) {
    const targetId = targetProps.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(sourceId !== targetId) {
      targetProps.onMove({sourceId, targetId});
    }
  }
leanpub-end-insert
};

...
```

If you run the application now, you'll likely get a bunch of `onMove` related errors. We should make `Notes` aware of it:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable.jsx';
import Note from './Note.jsx';

export default ({notes, onValueClick, onEdit, onDelete}) => {
  return (
    <ul className="notes">{notes.map(note => {
      return (
leanpub-start-delete
        <Note className="note" id={note.id} key={note.id}>
leanpub-end-delete
leanpub-start-insert
        <Note className="note" id={note.id} key={note.id}
          onMove={({sourceId, targetId}) =>
            console.log(`source: ${sourceId}, target: ${targetId}`)
        }>
leanpub-end-insert
          <Editable
            editing={note.editing}
            value={note.task}
            onValueClick={onValueClick.bind(null, note.id)}
            onEdit={onEdit.bind(null, note.id)}
            onDelete={onDelete.bind(null, note.id)} />
        </Note>
      );
    })}
    </ul>
  );
}
```

If you drag a `Note` around now, you should see log messages like `source <id> target <id>` in the console. We are getting close. We still need to figure out what to do with these ids, though.

## Adding Action and Store Method for Moving

The logic of drag and drop goes as follows. Suppose we have a lane containing notes A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F.

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

We should connect this action with the `onMove` hook we just defined:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable.jsx';
import Note from './Note.jsx';
leanpub-start-insert
import LaneActions from '../actions/LaneActions';
leanpub-end-insert

export default ({notes, onValueClick, onEdit, onDelete}) => {
  return (
    <ul className="notes">{notes.map(note => {
      return (
leanpub-start-delete
        <Note className="note" id={note.id} key={note.id}
          onMove={({sourceId, targetId}) =>
            console.log(`source: ${sourceId}, target: ${targetId}`)
        }>
leanpub-end-delete
leanpub-start-insert
        <Note className="note" id={note.id} key={note.id}
          onMove={LaneActions.move}>
leanpub-end-insert
          <Editable
            editing={note.editing}
            value={note.task}
            onValueClick={onValueClick.bind(null, note.id)}
            onEdit={onEdit.bind(null, note.id)}
            onDelete={onDelete.bind(null, note.id)} />
        </Note>
      );
    })}
    </ul>
  );
}
```

T> It could be a good idea to refactor `onMove` as a prop to make the system more flexible. In our implementation the `Notes` component is coupled with `LaneActions`. This isn't particularly nice if you want to use it in some other context.

We should also define a stub at `LaneStore` to see that we wired it up correctly:

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
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

export default alt.createStore(LaneStore, 'LaneStore');
```

You should see the same log messages as earlier. Next, we'll need to add some logic to make this work. We can use the logic outlined above here. We have two cases to worry about: moving within a lane itself and moving from lane to another.

## Implementing Note Drag and Drop Logic

Moving within a lane itself is complicated. When you are operating based on ids and perform operations one at a time, you'll need to take possible index alterations into account. As a result, I'm using `update` [immutability helper](https://facebook.github.io/react/docs/update.html) from React as that solves the problem in one pass.

It is possible to solve the lane to lane case using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice). First, we `splice` out the source note, and then we `splice` it to the target lane. Again, `update` could work here, but I didn't see much point in that given `splice` is nice and simple. The code below illustrates a mutation based solution:

**app/stores/LaneStore.js**

```javascript
...
leanpub-start-insert
import update from 'react-addons-update';
leanpub-end-insert

class LaneStore {
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

export default alt.createStore(LaneStore, 'LaneStore');
```

If you try out the application now, you can actually drag notes around and it should behave as you expect. Dragging to empty lanes doesn't work, though, and the presentation could be better.

It would be better if we indicated the dragged note's location more clearly. We can do this by hiding the dragged note from the list. React DnD provides us the hooks we need for this purpose.

### Indicating Where to Move

React DnD provides a feature known as state monitors. Through it we can use `monitor.isDragging()` to detect which `Note` we are currently dragging. It can be set up as follows:

**app/components/Note.jsx**

```javascript
...

leanpub-start-delete
@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource()
}))
leanpub-end-delete
leanpub-start-insert
@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging() // map isDragging() state to isDragging prop
}))
leanpub-end-insert
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
leanpub-start-delete
  render() {
    const {connectDragSource, connectDropTarget,
      id, onMove, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
leanpub-end-delete
leanpub-start-insert
  render() {
    const {connectDragSource, connectDropTarget, isDragging,
      onMove, id, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li style={{
        opacity: isDragging ? 0 : 1
      }} {...props}>{props.children}</li>
    ));
  }
leanpub-end-insert
}
```

If you drag a note within a lane, the dragged note should be shown as blank.

There is one little problem in our system. We cannot drag notes to an empty lane yet.

## Dragging Notes to Empty Lanes

To drag notes to empty lanes, we should allow them to receive notes. Just as above, we can set up `DropTarget` based logic for this. First, we need to capture the drag on `Lane`:

**app/components/Lane.jsx**

```javascript
...
leanpub-start-insert
import {DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    console.log(`source: ${sourceId}, target: ${targetId}`);
  }
};

@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
leanpub-end-insert
export default class Lane extends React.Component {
  render() {
leanpub-start-delete
    const {lane, ...props} = this.props;
leanpub-end-delete
leanpub-start-insert
    const {connectDropTarget, lane, ...props} = this.props;
leanpub-end-insert

leanpub-start-delete
    return (
leanpub-end-delete
leanpub-start-insert
    return connectDropTarget(
leanpub-end-insert
      ...
    );
  }
  ...
}
```

If you refresh your browser and drag a note to a lane now, you should see log messages at your console. The question is what to do with this data? Before actually moving the note to a lane, we should check whether it's empty or not. If it has content already, the operation doesn't make sense. Our existing logic can deal with that.

This is a simple check to make. Given we know the target lane at our `noteTarget` `hover` handler, we can check its `notes` array as follows:

**app/components/Lane.jsx**

```javascript
...

const noteTarget = {
leanpub-start-delete
  hover(targetProps, monitor) {
    const targetId = targetProps.lane.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    console.log(`source: ${sourceId}, target: ${targetId}`);
  }
leanpub-end-delete
leanpub-start-insert
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      console.log('source', sourceId, 'target', targetProps);
    }
  }
leanpub-end-insert
};

...
```

If you refresh your browser and drag around now, the log message should appear only when you drag a note to a lane that doesn't have any notes attached to it yet.

### Triggering `move` Logic

Now we know what `Note` to move into which `Lane`. `LaneStore.attachToLane` is ideal for this purpose. Adjust `Lane` as follows:

**app/components/Lane.jsx**

```javascript
...

const noteTarget = {
leanpub-start-delete
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(!targetProps.lane.notes.length) {
      console.log('source', sourceId, 'target', targetProps);
    }
  }
leanpub-end-delete
leanpub-start-insert
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
leanpub-end-insert
};

...
```

There is one problem, though. What happens to the old instance of the `Note`? In the current solution, the old lane will have an id pointing to it. As a result, we will have duplicate data in the system.

Earlier, we resolved this using `detachFromLane`. The problem is that we don't know to which lane the note belonged. We could pass this data through the component hierarchy, but that doesn't feel particularly nice.

We can resolve this by adding a check against the case at `attachToLane`:

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    const lanes = this.lanes.map(lane => {
leanpub-start-insert
      if(lane.notes.includes(noteId)) {
        lane.notes = lane.notes.filter(note => note !== noteId);
      }
leanpub-end-insert

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
  ...
}
```

`removeNote(noteId)` goes through `LaneStore` data. If it finds a note by id, it will get rid of it. After that, we have a clean slate, and we can add a note to a lane. This change allows us to drop `detachFromLane` from the system entirely, but I'll leave that up to you.

After these changes you should be able to drag notes to empty lanes.

### Fixing Editing Behavior During Dragging

The current implementation has a small glitch. If you edit a note, you can still drag it around while it's being edited. This isn't ideal as it overrides the default behavior most people are used to. You cannot for instance double-click on an input to select all the text.

Fortunately, this is simple to fix. We'll need to use the `editing` state per each `Note` to adjust its behavior. First we need to pass `editing` state to an individual `Note`:

**app/components/Notes.jsx**

```javascript
...

export default ({notes, onValueClick, onEdit, onDelete}) => {
  return (
    <ul className="notes">{notes.map(note =>
leanpub-start-delete
      <Note className="note" id={note.id} key={note.id}
        onMove={LaneActions.move}>
leanpub-end-delete
leanpub-start-insert
      <Note className="note" id={note.id} key={note.id}
        editing={note.editing} onMove={LaneActions.move}>
leanpub-end-insert
        <Editable
          editing={note.editing}
          value={note.task}
          onValueClick={onValueClick.bind(null, note.id)}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
      </Note>
    )}</ul>
  );
}
```

Next we need to take this into account while rendering:

**app/components/Note.jsx**

```javascript
...

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
  render() {
leanpub-start-delete
    const {connectDragSource, connectDropTarget, isDragging,
      onMove, id, ...props} = this.props;
leanpub-end-delete
leanpub-start-insert
    const {connectDragSource, connectDropTarget, isDragging,
      onMove, id, editing, ...props} = this.props;
    // Pass through if we are editing
    const dragSource = editing ? a => a : connectDragSource;
leanpub-end-insert

leanpub-start-delete
    return connectDragSource(connectDropTarget(
leanpub-end-delete
leanpub-start-insert
    return dragSource(connectDropTarget(
leanpub-end-insert
      <li style={{
        opacity: isDragging ? 0 : 1
      }} {...props}>{props.children}</li>
    ));
  }
}
```

This small change gives us the behavior we want. If you try to edit a note now, the input should work as you might expect it to behave normally. Design-wise it was a good idea to keep `editing` state outside of `Editable`. If we hadn't done that, implementing this change would have been a lot harder as we would have had to extract the state outside of the component.

Now we have a Kanban table that is actually useful! We can create new lanes and notes, and edit and remove them. In addition we can move notes around. Mission accomplished!

## Conclusion

In this chapter, you saw how to implement drag and drop for our little application. You can model sorting for lanes using the same technique. First, you mark the lanes to be draggable and droppable, then you sort out their ids, and finally, you'll add some logic to make it all work together. It should be considerably simpler than what we did with notes.

I encourage you to expand the application. The current implementation should work just as a starting point for something greater. Besides extending the DnD implementation, you can try adding more data to the system. You could also do something to the visual outlook. One option would be to try out various styling approaches discussed at the *Styling React* chapter.

To make it harder to break the application during development, you can also implement tests as discussed at *Testing React*. *Typing with React* discussed yet more ways to harden your code. Learning these approaches can be worthwhile. Sometimes it may be worth your while to design your applications test first. It is a valuable approach as it allows you to document your assumptions as you go.

In the next chapter, we'll set up a production level build for our application. You can use the techniques discussed in your own projects.
