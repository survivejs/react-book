# Polishing Kanban

Our Kanban application is almost usable now. It doesn't look that bad and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane, drag them from a lane to another and sort lanes.

## Setting Up React DnD

Before going further hit `npm i react-dnd --save` to add React DnD to the project. Next we'll need to patch out application to use it.

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

This will tell us application that it's going to have some DnD goodies in it. We'll use `HTML5Backend`. In the future there might be other backends to support specific targets (ie. touch and such).

In order to silence that `new-cap` error ESlint gives, set it off as follows. We won't be needing that.

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
      onEdit={this.props.onEdit.bind(this, i)} />
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
    const { isDragging, connectDragSource, connectDropTarget, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
```

If you drag a `Note` now, you should see some debug prints at console. We still need to figure out logic. Both `noteSource` and `noteTarget` give us access to `Note` props. In addition at `noteTarget` we can access the source `Note` through `monitor.getItem()` while `props` map to target. For DnD operations to make sense we'll to be able to tell individual notes apart. We'll need to model the concept of identity before we can move further.

W> Note that React DnD isn't hot loading compatible so you may need to refresh browser manually while doing testing these changes.

## Developing `onMove` API for Notes

In order to make `Note` operate based on id, we'll need to tweak it a little.

**app/components/Note.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const targetId = props.id;
    const sourceId = monitor.getItem().id;

    if(sourceId !== targetId) {
      props.onMove(sourceId, targetId);
    }
  }
};

export default class Note extends React.Component {
  constructor(props: {
    id: number;
    onMove: Function;
  }) {
    super(props);
  }
  ...
}
```

Now `Note` will trigger `onMove` callback whenever something is dragged on top of a `Note`. Next we need to make `Notes` aware of that.

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  ...
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <Note onMove={this.onMoveNote.bind(this)} className='note' key={'note' + i} id={i}>
          <Editable
            value={note.task}
            onEdit={this.props.onEdit.bind(this, i)} />
        </Note>
      )}</ul>
    );
  }
  onMoveNote(source, target) {
    console.log('source', source, 'target', target);
  }
}
```

If you drag a `Note` around now, you should see prints like `source 1 target 0` at console. It doesn't take long to see we have a little flaw in our system. The way we are deriving ids doesn't scale to this purpose as they aren't unique enough. We could try to generate ids based on the lane in which the notes belong and their position within all.

This won't work for drag and drop, though, as just as you would swap items it would just swap them right back as the callback gets triggered! So clearly we can't go this way. Normally we can just leave dealing with unique ids to the backend. In this case it won't be as simple. Instead we have to generate some unique ids ourselves.

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

Now in case some of the notes is missing an id, we will generate one for it. The approach could be improved a lot. You could for instance attach version information to store data. Then you would check against version and perform only migrations that are needed to bring it to current. You can get inspiration from various backend libraries.

## Using Note Ids While Dragging

Our data structures should be up to the task now. Next we'll need to start gluing things together. First we need to pass the correct id to a `Note`.

**app/components/Notes.jsx**

```javascript
...

<Note onMove={this.onMoveNote.bind(this)} className='note'
  key={'note-' + note.id} id={note.id}>

...
```

As this will blow up our type definition, we'll want to tweak that as well.

**app/components/Note.jsx**

```javascript
...
export default class Note extends React.Component {
  constructor(props: {
    id: string;
    onMove: Function;
  }) {
    ...
  }
  ...
}
```

In case you drag a `Note` around now, you should see correct `source` and `target` ids at console. Now that we have the right data at the right place we can finally put logic in place to manipulate our data structures.

## Sketching Up Note Drag and Drop Logic

The logic of drag and drop is quite simple. Let's say we have a list A, B, C. In case we move A below C we should end up with B, C, A. In case we have another list, say D, E, F, and move A to the beginning of it, we should end up with B, C and A, D, E, F. So first we have to get rid of the source item and then add it to an appropriate place depending on target. This logic can be modeled at `onMoveNote` as follows.

**app/components/Notes.jsx**

```javascript
...
onMoveNote(source, target) {
  console.log('source', source, 'target', target);

  source.actions.remove({id: source.data.id});

  if(source.actions === target.actions) {
    target.actions.createAfter(target.data.id, source.data);
  }
  else {
    target.actions.createBefore(target.data.id, source.data);
  }
}
...
```

The logic is a bit different depending on whether we are operating within the same lane or targeting another one. In addition it appears we will need information about actions at `onMoveNote` and some new API needs to be set up.

## Passing Needed Data to `onMoveNote`

Since a `Note` is going to need a reference to `NoteStore` we had better start by passing that.

**app/components/Lane.jsx**

```javascript
...

<Notes actions={this.actions} onEdit={this.edited.bind(this, this.actions)} />

...
```

Next we need to take this in count at `Notes`.

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  constructor(props: {
    actions: Object;
    items: Array;
    onEdit: Function;
  }) {
    super(props);
  }
  render() {
    ...

    <Note onMove={this.onMoveNote.bind(this)} className='note'
      key={'note-' + note.id} actions={this.props.actions} data={note}>

    ...
  }
}
```

And finally at `Note`.

**app/components/Notes.jsx**

```javascript
...

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data,
      actions: props.actions,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const targetData = props.data || {};
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(sourceData.id !== targetData.id) {
      props.onMove(sourceProps, props);
    }
  }
};

...
export default class Note extends React.Component {
  constructor(props: {
    actions: Object;
    data: Object;
    onMove: Function;
  }) {
    super(props);
  }
  render() {
    const { isDragging, connectDragSource, connectDropTarget,
      actions, data, ...props } = this.props;

    ...
  }
}
```

Now we have the data our sket

## Implementing Note Drag and Drop Logic

Next we'll need to implement the APIs we're missing. As a first step we should fill in the missing actions.

**app/actions/NoteActions.js**

```javascript
export default class NoteActions {
  ...
  createAfter(id, data) {
    this.dispatch({id, data});
  }
  createBefore(id, data) {
    this.dispatch({id, data});
  }
  ...
```

Now we shouldn't be getting any errors at console anymore. Next we'll need to tweak `remove` method of `NoteStore` to operate based on object correctly and implement the missing methods. As `lodash` will come in handy here, move it from `devDependencies` to `dependencies` at `package.json`.

**package.json**

```json
{
  ...
  "dependencies": {
    ...
    "lodash": "^3.8.0",
    ...
  },
  ...
}
```

Next we can use it for implementing the missing `remove` bit:

**app/stores/NoteStore.js**

```javascript
...
import findIndex from 'lodash/array/findIndex';
import isObject from 'lodash/lang/isObject';

export default class NoteStore {
  ...
  remove(id) {
    const notes = this.notes;

    if(isObject(id)) {
      id = findIndex(notes, id);
    }

    if(id < 0) {
      return console.warn('Failed to remove by id', id, notes);
    }

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
  ...
}
```

That's halfway there. We still need to add the data removed back through those create methods we specified earlier.

**app/stores/NoteStore.js**

```javascript
  ...

  ...
}
```

## Conclusion

TODO
