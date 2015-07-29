# Implementing Drag and Drop

Our Kanban application is almost usable now. It doesn't look that bad and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane and drag them from a lane to another.

## Setting Up React DnD

Before going further hit `npm i react-dnd --save` to add React DnD to the project. Next we'll need to patch our application to use it. React DnD supports the idea of backends. This means it is possible to adapt it to work on different platforms. Even a testing backend is feasible. As of writing it supports only HTML5 Drag and Drop API based backend. As a result the application won't work on touch yet.

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

@DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
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
  renderNote(note, i) {
    return (
      <Note className='note' onMove={this.onMoveNote}
        data={note} key={`note${note.id}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </Note>
    );
  }
  onMoveNote({sourceData, targetData}) {
    console.log('source', sourceData, 'target', targetData);
  }
}
```

If you drag a `Note` around now, you should see prints like `source [Object] target [Object]` at console. We are getting close. We still need to figure out what to do with this data, though.

## Implementing Note Drag and Drop Logic

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

export default alt.createStore(LaneStore);
```

You should see the same prints as earlier. Next we'll need to add some logic to make this work.

XXXXX

**app/stores/NoteStore.jsx**

```javascript
...
import update from 'react/lib/update';

...

export default class NoteStore {
  move({source, target}) {
    const notes = this.notes;
    const sourceIndex = findIndex(notes, 'id', source.id);
    const targetIndex = findIndex(notes, 'id', target.id);

    if(sourceIndex >= 0 && targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [sourceIndex, 1],
            [targetIndex, 0, source]
          ]
        })
      });
    }
    else if(targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [targetIndex, 0, source]
          ]
        })
      });
    }
    else if(sourceIndex >= 0) {
      this.remove(sourceIndex);
    }
  }
}

function findIndex(arr, prop, value) {
  const o = arr.filter(c => c[prop] === value)[0];

  return o && arr.indexOf(o);
}
```

There is actually quite a bit going on here. I modeled the solution based on React DnD draggable example and then expanded on it. Primarily there are three cases to worry about. In the first case we're dragging within the lane itself. We can use `$splice` there from [React immutability helpers](https://facebook.github.io/react/docs/update.html).

In this case we splice an item out of source index and move source to target as you might expect. In the second case we are dragging into a new lane so it's enough just to add to target position. The final case gets rid of possible data remaining at a previous lane.

T> This probably isn't the most effective solution as we'll be performing the check for each lane. But given we'll have likely only a couple of lanes in our system it seems like an acceptable compromise. A more optimized solution would operate using minimal amount of lanes (maximum of two) per operation but that would get more complex to handle.

## Conclusion

In this chapter you saw how to implement drag and drop for our little application. You can model sorting for lanes using the same technique. First you mark the lanes to be draggable and droppable, then you sort out their ids and finally you'll add some logic to make it all work together.

The solution presented here isn't the only possible one. In our case we have some complexity at store level as we decided to model a store per `Notes`. An alternative solution for that would have been simply to have a single store for all notes and deal with the complexity there.

In that case it wouldn't be necessary to set up a shared `move` action. Instead you could deal with the move logic in a single method. On the other hand some other operations might become more complex to implement as you need to deal with collections yourself. Now they are implicit in the structure.
