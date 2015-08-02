# Implementing Drag and Drop

Our Kanban application is almost usable now. It doesn't look that bad and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane and drag them from a lane to another.

## Setting Up React DnD

Before going further hit

> npm i react-dnd --save`

to add React DnD to the project. Next we'll need to patch our application to use it. React DnD supports the idea of backends. This means it is possible to adapt it to work on different platforms. Even a testing backend is feasible. As of writing it supports only HTML5 Drag and Drop API based backend. As a result the application won't work on touch yet.

To get started we'll need to hook up React DnD's HTML5Backend with our `App`. After this has been done we can start worrying about actual functionality.

**app/components/App.jsx**

```javascript
...
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

...

@DragDropContext(HTML5Backend)
export default class App extends React.Component {
  ...
}
```

After this change the application should look exactly the same as before. We are now ready to add some sweet functionality to it.

## Preparing Notes to Be Sorted

Next we will need to tell React DnD what can be dragged and where. Since we want to move notes, we'll want to annotate them accordingly. In addition we'll need some logic to tell what happens during this process.

Earlier we extracted some of the editing functionality from `Note` and ended up dropping it. Since we need to decorate the component and don't want to end up with a mess, it seems like we'll want to add that concept back if only for decoration purposes.

We can use a handy little technique here that allows us to avoid code duplication. We can implement `Note` as a wrapper component. It will accept `Editable` and render it. This will allow us to keep DnD related logic at `Note` without having to duplicate any logic related to `Editable`. The magic lies in a single property known as `children` as seen in the implementation below. React will render possible child components at `{this.props.children}`slot.

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

We also need to tweak `Notes` to use our wrapper component. We will simply wrap `Editable` using `Note` and we are good to go. We will pass `note` data to the wrapper as we'll need that later when dealing with logic.

**app/components/Notes.jsx**

```javascript
...
import Note from './Note';

export default class Notes extends React.Component {
  ...
  renderNote(note) {
    return (
      <Note className='note' data={note} key={`note${note.id}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)} />
      </Note>
    );
  }
}
```

After this change the application should look exactly same as before. We have achieved nothing yet. Fortunately we can start adding functionality now that we have foundation in place.

## Allowing Notes to Be Dragged

React DnD uses constants to tell different draggables apart. Set up a file for tracking `Note` as follows:

**app/components/ItemTypes.js**

```javascript
export default {
  NOTE: 'note'
};
```

We'll expand this definition later as we add new types to the system. Next we need to tell our `Note` that it's possible to drag and drop it.

We will be relying on `DragSource` and `DropTarget` decorators. In our case `Note` is both. After all we'll want to be able to sort them. Both decorators give us access to `Note` props. In addition we can access the source `Note` through `monitor.getItem()` at `noteTarget` while `props` map to target.

**app/components/Note.jsx**

```javascript
...
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';

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

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
  render() {
    const { isDragging, connectDragSource, connectDropTarget,
      onMove, data, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
```

If you drag a `Note` now, you should see some debug prints at console. We are still missing some vital logic to make this all work.

W> Note that React DnD doesn't support hot loading perfectly so you may need to refresh browser to see prints you expect!

## Developing `onMove` API for Notes

In order to make `Note` operate based on id, we'll need to do a few things:

* Capture `Note` data on `beginDrag`
* Capture target `Note` data on `hover`
* Trigger a callback on `hover` so that we can deal with the logic on higher level

You can see how this translates to code below.

**app/components/Note.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data
    };
  }
};

const noteTarget = {
  hover(targetProps, monitor) {
    const targetData = targetProps.data || {};
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(sourceData.id !== targetData.id) {
      targetProps.onMove({sourceData, targetData});
    }
  }
};

...
```

If you run the application now, you'll likely get a bunch of `onMove` related errors. We should make `Notes` aware of that.

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  ...
  renderNote(note) {
    return (
      <Note className='note' onMove={this.onMoveNote}
        data={note} key={`note${note.id}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)} />
      </Note>
    );
  }
  onMoveNote({sourceData, targetData}) {
    console.log('source', sourceData, 'target', targetData);
  }
}
```

If you drag a `Note` around now, you should see prints like `source [Object] target [Object]` at console. We are getting close. We still need to figure out what to do with this data, though.

## Adding Action and Store Method for Moving

The logic of drag and drop is quite simple. Let's say we have a list A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F.

In our case we'll get some extra complexity due to lane to lane dragging. Note that when we move a `Note` we know its original position and the intended target position. `Lane` knows what `Notes` belong to it by id. We are going to need some way to tell `LaneStore` that it should perform the logic over given notes. A good starting point is to define `LaneActions.move`.

**app/actions/LaneActions.jsx**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'update', 'delete',
  'attachToLane', 'detachFromLane',
  'move'
);
```

We also need to trigger it when moving. We should connect this action with `onMove` hook we just defined.

**app/components/Notes.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

export default class Notes extends React.Component {
  ...
  renderNote(note) {
    return (
      <Note className='note' onMove={LaneActions.move}
        data={note} key={`note${note.id}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)} />
      </Note>
    );
  }
}
```

We should also define a stub at `LaneStore` to see that we wired it up correctly.

**app/stores/LaneStore.jsx**

```javascript
...

class LaneStore {
  ...
  move({sourceData, targetData}) {
    console.log('source', sourceData, 'target', targetData);
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

You should see the same prints as earlier. Next we'll need to add some logic to make this work. We can use the logic outlined above here. We have two cases to worry about. Moving within a lane itself and moving from lane to another.

## Implementing Note Drag and Drop Logic

Moving within a lane itself is more complicated because given you are operating based on ids and perform operations one at a time, you'll need to take possible index alterations in count. Therefore I'm using `update` [immutability helper](https://facebook.github.io/react/docs/update.html) from React as that solves the problem in one pass.

It is possible to solve the lane to lane case using [splice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice). First we `splice` out the source note and then we `splice` it to the target lane. Again, `update` could work here but I didn't see much point in that given `splice` is nice and simple.

Note that these operations will mutate our `lanes` structure. At least we have the mutation contained now and it won't leak out of the store. It is possible to implement the same algorithm without mutation.

The code below illustrates mutation based solution.

**app/stores/LaneStore.jsx**

```javascript
...
import update from 'react/lib/update';

export default class LaneStore {
  ...
  move({sourceData, targetData}) {
    const lanes = this.lanes;
    const sourceId = sourceData.id;
    const targetId = targetData.id;
    const sourceLane = lanes.filter((lane) => {
      return lane.notes.indexOf(sourceId) >= 0;
    })[0];
    const targetLane = lanes.filter((lane) => {
      return lane.notes.indexOf(targetId) >= 0;
    })[0];
    const sourceNoteId = sourceLane.notes.indexOf(sourceId);
    const targetNoteId = targetLane.notes.indexOf(targetId);

    if(sourceLane === targetLane) {
      // move at once to avoid complications
      sourceLane.notes = update(sourceLane.notes, {
        $splice: [
          [sourceNoteId, 1],
          [targetNoteId, 0, sourceId]
        ]
      });
    }
    else {
      // get rid of the source
      sourceLane.notes.splice(sourceNoteId, 1);

      // and move it to target
      targetLane.notes.splice(targetNoteId, 0, sourceId);
    }

    this.setState({lanes});
  }
}
```

If you try out the application now, you can actually drag notes around and it should behave as you expect. You cannot, however, drag notes to an empty lane.

## Dragging Notes to an Empty Lanes

In order to drag notes to an empty lane we should allow lanes to receive notes. Just as above we can set up `DropTarget` based logic for this. First we need to capture the drag on `Lane`. It's the same idea as earlier.

**app/components/Lane.jsx**

```javascript
...
import { DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';

const noteTarget = {
  hover(targetProps, monitor) {
    const targetData = targetProps.data || {};
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    console.log('source', sourceProps, 'target', targetProps);
  }
};

@DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Lane extends React.Component {
  render() {
    const { isDragging, connectDropTarget,
      id, name, notes, ...props } = this.props;

    return connectDropTarget(
      ...
    );
  }
}
```

If you drag a note to a lane now, you should see prints at your console. The question is what to do with this data? Before actually moving the note to a lane we should check whether it's empty or not. If it has content already, the operation doesn't make sense. Our existing logic can deal with that.

This is a simple check to make. Given we know the target lane at our `noteTarget` `hover` handler, we can check its `notes` array as below:

**app/components/Lane.jsx**

```javascript
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(!targetProps.notes.length) {
      console.log('source', sourceProps, 'target', targetProps);
    }
  }
};
```

If you refresh your browser and drag around now, the print should appear only when you drag a note to a lane that doesn't have any notes attached to it yet.

Next we'll need to trigger logic that can perform the move operation. We have some actions we can apply for this purpose. Remember those attach/detach actions we implemented earlier? To remind you of their signatures they look like this:

* `LaneStore.attachToLane({laneId, noteId})`
* `LaneStore.detachFromLane({laneId, noteId})`

By the looks of it we have enough data to perform `attachToLane`. `detachFromLane` is more problematic as we would need to know where to detach the note from. There are a couple of ways to solve this problem. We could pass lane id to `Note` through the hierarchy. This doesn't feel particularly nice, though.

Instead it feels more reasonable to solve this on store level. We can have the nasty logic there. Given a note can belong to only a single lane in our system we can enforce this rule at `attachToLane`. We simply remove the note before attaching it should it exist somewhere within the system.

The `noteTarget` part of this is simple. We need to trigger `LaneActions.attachToLane` using the ids we know based on the data we have available.

**app/components/Lane.jsx**

```javascript
const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(!targetProps.notes.length) {
      LaneActions.attachToLane({
        laneId: targetProps.id,
        noteId: sourceData.id
      });
    }
  }
};
```

The store part is more complicated. I've separated the search and destroy part to a method of its own. Given we use search elsewhere it might be beneficial to refactor that to method as well. The code also relies on mutation which isn't particularly nice.

**app/stores/LaneStore.jsx**

```javascript
...

class LaneStore {
  ...
  attachToLane({laneId, noteId}) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', laneId);

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

    const removeNoteId = removeLane.notes.indexOf(noteId);

    removeLane.notes = removeLane.notes.slice(0, removeNoteId).
      concat(removeLane.notes.slice(removeNoteId + 1));
  }
  ...
}
```

After these changes we have a Kanban table that is actually useful! We can create new lanes and notes, edit and remove them. In addition we can move notes around. Mission accomplished!

## Conclusion

In this chapter you saw how to implement drag and drop for our little application. You can model sorting for lanes using the same technique. First you mark the lanes to be draggable and droppable, then you sort out their ids and finally you'll add some logic to make it all work together. It should be considerably simpler than what we did with notes.

I encourage you to expand the application. The current implementation should work just as a starting point for something greater. Besides extending DnD implementation you can try adding more data to the system.

The next chapters go into advanced topics we have so far glanced over. They are more theoretical in nature and should give you further ideas to integrate into your development workflow.
