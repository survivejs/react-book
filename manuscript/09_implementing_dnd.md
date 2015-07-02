# Implementing Drag and Drop

Our Kanban application is almost usable now. It doesn't look that bad and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane, drag them from a lane to another and sort lanes.

## Setting Up React DnD

Before going further hit `npm i react-dnd --save` to add React DnD to the project. Next we'll need to patch our application to use it.

**app/components/App.jsx**

```javascript
...
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

...

@DragDropContext(HTML5Backend)
@persist(storage, storageName, () => JSON.parse(alt.takeSnapshot()))
export default class App extends React.Component {
...
}
```

This will tell our application that it's going to have some DnD goodies in it. We'll use `HTML5Backend`. In the future there might be other backends to support specific targets (ie. touch and such).

In order to silence that `new-cap` error ESlint gives, switch it off as follows. We won't be needing that.

**.eslintrc**

```json
"rules": {
  "new-cap": 0,
  ...
}
```

The application looks exactly the same as before. We are now ready to add some sweet functionality to it, though.

## Preparing Notes to Be Sorted

Next we will need to tell React DnD what can be dragged and where. Since we want to move notes, we'll want to annotate them accordingly. In addition we'll need some logic to tell what happens during this process.

Earlier we extracted some of the editing functionality from `Note` and ended up dropping it. Since we need to decorate the component and don't want to end up with a mess, it seems like we'll want to add that concept back if only for decoration purposes.

**app/components/Notes.jsx**

```javascript
...

import Note from './Note';

...

<ul className='notes'>{notes.map((note, i) =>
  <Note className='note' key={'note' + i}>
    <Editable
      value={note.task}
      onEdit={this.props.onEdit.bind(null, i)} />
  </Note>
)}</ul>
```

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

Now we have a little `Note` wrapper which we can decorate. The design could have been different. `Note` could contain `Editable` itself but then we would have to maintain a constructor since we need to pass the data there. Now `Note` is more about encapsulating DnD logic and showing whatever we pass to it. Next we need to connect that logic to it.

## Allowing Notes to Be Dragged

React DnD uses constants to tell different draggables apart. Set up a file for tracking `Note` as follows:

**app/components/ItemTypes.js**

```javascript
export default {
  NOTE: 'note',
};
```

We'll expand this later as we add new types to the system but this is enough for now. Next we need to tell our `Note` that it's possible to drag and drop it.

**app/components/Note.jsx**

```javascript
import { DragSource, DropTarget } from 'react-dnd';

import ItemTypes from './ItemTypes';

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

const noteTarget = {
  hover(props, monitor) {
    console.log('dragging note', props, monitor);
  }
};

@DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
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

If you drag a `Note` now, you should see some debug prints at console. We still need to figure out logic. Both `noteSource` and `noteTarget` give us access to `Note` props. In addition at `noteTarget` we can access the source `Note` through `monitor.getItem()` while `props` map to target. For DnD operations to make sense we'll to be able to tell individual notes apart. We'll need to model the concept of identity before we can move further.

W> Note that React DnD isn't hot loading compatible so you may need to refresh browser manually while testing these changes.

## Developing `onMove` API for Notes

In order to make `Note` operate based on id, we'll need to tweak it a little.

**app/components/Note.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
  const targetData = props.data || {};
  const sourceProps = monitor.getItem();
  const sourceData = sourceProps.data || {};

  if(sourceData.id !== targetData.id) {
    props.onMove({
      source: sourceProps.data,
      target: props.data,
    });
  }
  }
};

export default class Note extends React.Component {
  constructor(props: {
    data: Object;
    onMove: Function;
  }) {
    super(props);
  }
  ...
}
```

Now `Note` will trigger the `onMove` callback whenever something is dragged on top of a `Note`. Next we need to make `Notes` aware of that.

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  ...
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <Note onMove={() => this.onMoveNote()} className='note'
          key={'note-' + i} data={note}>
          <Editable
            value={note.task}
            onEdit={this.props.onEdit.bind(null, i)} />
        </Note>
      )}</ul>
    );
  }
  onMoveNote(source, target) {
    console.log('source', source, 'target', target);
  }
}
```

If you drag a `Note` around now, you should see prints like `source [Object] target [Object]` at console. It doesn't take long to see we have a little flaw in our system. The way we are deriving `Note` ids doesn't scale to this purpose as they aren't unique enough. They are unique per lane but not globally. This will be an issue when moving notes between lanes. Normally dealing with ids would be the backend's problem but since we don't have a backend we can generate some ourselves.

## Generating Unique Ids for Notes

One of the simplest ways to generate unique ids is simply to use an UUID generator. Hit `npm i node-uuid --save` to add one to our project. There are more possible approaches listed at [a Stackoverflow question about the topic](https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript) but this will do fine for our purposes.

Next we'll need to tweak our `Notes` to contain these ids. This is logic that should go to `NoteStore` as follows.

**app/stores/NoteStore.js**

```javascript
import uuid from 'node-uuid';

export default class NoteStore {
  ...
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task, id: uuid.v4()}),
    });
  }
  ...
}
```

Now newly created `Notes` should contain unique ids. Possible older data won't. We could simply nuke our `localStorage` by doing something like `localStorage.clear()` and `localStorage.debug = true` at console, then refreshing the page and setting `debug` flag back to false. That's not a solution that works well in production environment. Instead we can perform a little migration trick.

**app/stores/NoteStore.js**

```javascript
...

export default class NoteStore {
  ...
  init(data) {
    this.setState(data ? migrate(data) : {notes: []});
  }
  ...
}

function migrate(data) {
  // patch data with ids in case they are missing
  if(data) {
    data.notes = data.notes.map((note) => {
      if(!note.id) {
        note.id = uuid.v4();
      }

      return note;
    });
  }

  return data;
}
```

Now in case some of the notes is missing an id, we will generate one for them. The approach could be improved. You could for instance attach version information to store data. Then you would check against version and perform only migrations that are needed to bring it to current. You can get inspiration from various backend libraries.

## Implementing Note Drag and Drop Logic

The logic of drag and drop is quite simple. Let's say we have a list A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F.

In our case we'll get some extra complexity due to lane to lane dragging. Note that when we move a `Note` we know its original position and the intended target position. While dragging around, however, we'll want to make sure the store data gets updated as well. The problem is how to communicate this to our `NoteStores` so that they know to update their state?

This can be solved by setting up a custom action for this particular purpose. We'll model `move` method there and make `NoteStores` react to that. After that it's up to each `NoteStore` to deal with it. In order to achieve this we'll need to do some wiring.

**app/components/Notes.jsx**

```javascript
...
import NoteDndActions from '../actions/NoteDndActions';

export default class Notes extends React.Component {
  ...
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <Note onMove={NoteDndActions.move} className='note'
          key={'note-' + note.id} data={note}>
          <Editable
            value={note.task}
            onEdit={this.props.onEdit.bind(null, i)} />
        </Note>
      )}</ul>
    );
  }
}
```

**app/actions/NoteDndActions.jsx**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('move');
```

**app/stores/NoteStore.jsx**

```javascript
...

import NoteDndActions from '../actions/NoteDndActions';

export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
    this.bindActions(NoteDndActions);
  }
  move({source, target}) {
    console.log('source', source, 'target', target);
  }
}
```

If you drag and drop a `Note` now, you should see each `NoteStore` trigger. Next we'll need to add some logic to make this work.

**app/stores/NoteStore.jsx**

```javascript
import update from 'react/lib/update';

...

export default class NoteStore {
  move({source, target}) {
    const notes = this.notes;
    const sourceIndex = findIndex(notes, {
      id: source.id,
    });
    const targetIndex = findIndex(notes, {
      id: target.id,
    });

    if(sourceIndex >= 0 && targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [sourceIndex, 1],
            [targetIndex, 0, source],
          ],
        }),
      });
    }
    else if(targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [targetIndex, 0, source],
          ],
        }),
      });
    }
    else if(sourceIndex >= 0) {
      this.remove(sourceIndex);
    }
  }
}

function findIndex(arr, prop, value) {
  var o = arr.filter(c => c[prop] === value)[0];

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
