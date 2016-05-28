# Handling Data Dependencies

So far we have developed an application for keeping track of notes in `localStorage`. Most importantly our system is missing the concept of `Lane`. A `Lane` is something that should be able to contain many `Notes` within itself and track their order. One way to model this is simply to make a `Lane` point at `Notes` through an array of `Note` ids.

This relation could be reversed. A `Note` could point at a `Lane` using an id and maintain information about its position within a `Lane`. In this case, we are going to stick with the former design as that works well with re-ordering later on.

## Extracting `Lanes`

As earlier, we can use the same idea of two components here. There will be a component for the higher level (i.e., `Lanes`) and for the lower level (i.e., `Lane`). The higher level component will deal with lane ordering. A `Lane` will render itself (i.e., name and `Notes`) and have basic manipulation operations.

Just as with `Notes`, we are going to need a set of actions. For now it is enough if we can just create new lanes so we can create a corresponding action for that as below:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create');
```

In addition, we are going to need a `LaneStore` and a method matching to `create`. The idea is pretty much the same as for `NoteStore` earlier. `create` will concatenate a new lane to the list of lanes. After that, the change will propagate to the listeners (i.e., `FinalStore` and components).

**app/stores/LaneStore.js**

```javascript
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = [];
  }
  create(lane) {
    // If `notes` aren't provided for some reason,
    // default to an empty array.
    lane.notes = lane.notes || [];

    this.setState({
      lanes: this.lanes.concat(lane)
    });
  }
}
```

To connect `LaneStore` with our application, we need to connect it to it through `setup`:

**app/components/Provider/setup.js**

```javascript
import storage from '../../libs/storage';
import persist from '../../libs/persist';
import NoteStore from '../../stores/NoteStore';
leanpub-start-insert
import LaneStore from '../../stores/LaneStore';
leanpub-end-insert

export default alt => {
  alt.addStore('NoteStore', NoteStore);
leanpub-start-insert
  alt.addStore('LaneStore', LaneStore);
leanpub-end-insert

  persist(alt, storage(localStorage), 'app');
}
```

We are also going to need a `Lanes` container to display our lanes:

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane';

export default ({lanes}) => (
  <div className="lanes">{lanes.map(lane =>
    <Lane className="lane" key={lane.id} lane={lane} />
  )}</div>
)
```

And finally we can add a little stub for `Lane` to make sure our application doesn't crash when we connect `Lanes` with it. A lot of the current `App` logic will move here eventually:

**app/components/Lane.jsx**

```javascript
import React from 'react';

export default ({lane, ...props}) => (
  <div {...props}>{lane.name}</div>
)
```

## Connecting `Lanes` with `App`

Next, we need to make room for `Lanes` at `App`. We will simply replace `Notes` references with `Lanes`, set up lane actions, and store. This means a lot of the old code can disappear. Replace `App` with the following code:

**app/components/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
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

export default connect(({LaneStore}) => ({
  lanes: LaneStore.lanes
}), {
  LaneActions
})(App)
```

If you check out the implementation at the browser, you can see that the current implementation doesn't do much. You should be able to add new lanes to the Kanban and see "New lane" text per each but that's about it. To restore the note related functionality, we need to focus on modeling `Lane` further.

## Modeling `Lane`

`Lane` will render a name and associated `Notes`. The example below has been modeled largely after our earlier implementation of `App`. Replace the file contents entirely as follows:

**app/components/Lane.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
import Notes from './Notes';

const Lane = ({
  lane, notes, NoteActions, ...props
}) => {
  const editNote = (id, task) => {
    NoteActions.update({id, task, editing: false});
  }
  const addNote = e => {
    e.stopPropagation();

    const noteId = uuid.v4();

    NoteActions.create({
      id: noteId,
      task: 'New task'
    });
  }
  const deleteNote = (noteId, e) => {
    e.stopPropagation();

    NoteActions.delete(noteId);
  }
  const activateNoteEdit = id => {
    NoteActions.update({id, editing: true});
  }

  return (
    <div {...props}>
      <div className="lane-header">
        <div className="lane-add-note">
          <button onClick={addNote}>+</button>
        </div>
        <div className="lane-name">{lane.name}</div>
      </div>
      <Notes
        notes={notes}
        onNoteClick={activateNoteEdit}
        onEdit={editNote}
        onDelete={deleteNote} />
    </div>
  );
};

export default connect(
  ({NoteStore}) => ({
    notes: NoteStore.notes
  }), {
    NoteActions
  }
)(Lane)
```

If you run the application and try adding new notes, you can see there's something wrong. Every note you add is shared by all lanes. If a note is modified, other lanes update too.

![Duplicate notes](images/kanban_01.png)

The reason why this happens is simple. Our `NoteStore` is a singleton. This means every component that is listening to `NoteStore` will receive the same data. We will need to resolve this problem somehow.

## Making `Lanes` Responsible of `Notes`

Currently, our `Lane` contains just an array of objects. Each of the objects knows its *id* and *name*. We'll need something more sophisticated.

Each `Lane` needs to know which `Notes` belong to it. If a `Lane` contained an array of `Note` ids, it could then filter and display the `Notes` belonging to it. We'll implement a scheme to achieve this next.

### Understanding `attachToLane`

When we add a new `Note` to the system using `addNote`, we need to make sure it's associated to some `Lane`. This association can be modeled using a method, such as `LaneActions.attachToLane({laneId: <id>, noteId: <id>})`. Here's an example of how it could work:

```javascript
const addNote = e => {
  e.stopPropagation();

  const noteId = uuid.v4();

  NoteActions.create({
    id: noteId,
    task: 'New task'
  });
  LaneActions.attachToLane({
    laneId: lane.id,
    noteId
  });
}
```

This is just one way to handle `noteId`. We could push the generation logic within `NoteActions.create` and then return the generated id from it. We could also handle it through a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This would be very useful if we added a back-end to our implementation. Here's how it would look like then:

```javascript
const addNote = e => {
  e.stopPropagation();

  NoteActions.create({
    task: 'New task'
  }).then(noteId => {
    LaneActions.attachToLane({
      laneId: lane.id,
      noteId: noteId
    });
  })
}
```

Now we have declared a clear dependency between `NoteActions.create` and `LaneActions.attachToLane`. This would be one valid alternative especially if you need to go further with the implementation.

T> You could model the API using positional parameters and end up with `LaneActions.attachToLane(laneId, note.id)`. I prefer the object form as it reads well and you don't have to care about the order.

T> Another way to handle the dependency problem would be to use Flux dispatcher related feature known as [waitFor](http://alt.js.org/guide/wait-for/). It allows us to state dependencies on store level. It is better to avoid that if you can, though, as data management solutions like Redux make it redundant. Using `Promises` as above can help as well.

### Setting Up `attachToLane`

To get started we should add `attachToLane` to actions as before:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'attachToLane'
);
```

In order to implement `attachToLane`, we need to find a lane matching to the given lane id and then attach note id to it. Furthermore, each note should belong only to one lane at a time. We can perform a rough check against that:

**app/stores/LaneStore.js**

```javascript
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  ...
leanpub-start-insert
  attachToLane({laneId, noteId}) {
    this.setState({
      lanes: this.lanes.map(lane => {
        if(lane.notes.includes(noteId)) {
          lane.notes = lane.notes.filter(note => note !== noteId);
        }

        if(lane.id === laneId) {
          lane.notes = lane.notes.concat([noteId]);
        }

        return lane;
      })
    });
  }
leanpub-end-insert
}
```

Just being able to attach notes to a lane isn't enough. We are also going to need some way to detach them. This comes up when we are removing notes.

### Setting Up `detachFromLane`

We can model a similar counter-operation `detachFromLane` using an API like this:

```javascript
LaneActions.detachFromLane({noteId, laneId});
NoteActions.delete(noteId);
```

T> Just like with `attachToLane`, you could model the API using positional parameters and end up with `LaneActions.detachFromLane(laneId, noteId)`.

Again, we should set up an action:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions(
  'create', 'attachToLane', 'detachFromLane'
);
```

The implementation will resemble `attachToLane`. In this case, we'll remove the possibly found `Note` instead:

**app/stores/LaneStore.js**

```javascript
import LaneActions from '../actions/LaneActions';

export default class LaneStore {
  ...
leanpub-start-insert
  detachFromLane({laneId, noteId}) {
    this.setState({
      lanes: this.lanes.map(lane => {
        if(lane.id === laneId) {
          lane.notes = lane.notes.filter(note => note !== noteId);
        }

        return lane;
      })
    });
  }
leanpub-end-insert
}
```

Given we have enough logic in place now, we can start connecting it with the user interface.

### Connecting `Lane` with the Logic

To make this work, there are a couple of places to tweak at `Lane`:

* When adding a note, we need to **attach** it to the current lane.
* When deleting a note, we need to **detach** it from the current lane.
* When rendering a lane, we need to **select** notes belonging to it. This needs extra logic.

These changes map to `Lane` as follows:

**app/components/Lane.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
leanpub-start-insert
import LaneActions from '../actions/LaneActions';
leanpub-end-insert
import Notes from './Notes';

const Lane = ({
leanpub-start-delete
  lane, notes, NoteActions, ...props
leanpub-end-delete
leanpub-start-insert
  lane, notes, LaneActions, NoteActions, ...props
leanpub-end-insert
}) => {
  const editNote = (id, task) => {
    ...
  }
  const addNote = e => {
    e.stopPropagation();

    const noteId = uuid.v4();

    NoteActions.create({
      id: noteId,
      task: 'New task'
    });
leanpub-start-insert
    LaneActions.attachToLane({
      laneId: lane.id,
      noteId
    });
leanpub-end-insert
  }
  const deleteNote = (noteId, e) => {
    e.stopPropagation();

leanpub-start-insert
    LaneActions.detachFromLane({
      laneId: lane.id,
      noteId
    });
leanpub-end-insert
    NoteActions.delete(noteId);
  }
  const activateNoteEdit = id => {
    NoteActions.update({id, editing: true});
  }

  return (
    <div {...props}>
      <div className="lane-header">
        <div className="lane-add-note">
          <button onClick={addNote}>+</button>
        </div>
        <div className="lane-name">{lane.name}</div>
      </div>
      <Notes
leanpub-start-insert
        notes={notes}
leanpub-end-insert
leanpub-start-insert
        notes={selectNotesByIds(notes, lane.notes)}
leanpub-end-insert
        onNoteClick={activateNoteEdit}
        onEdit={editNote}
        onDelete={deleteNote} />
    </div>
  );
};

leanpub-start-insert
function selectNotesByIds(allNotes, noteIds = []) {
  // `reduce` is a powerful method that allows us to
  // fold data. You can implement `filter` and `map`
  // through it. Here we are using it to concatenate
  // notes matching to the ids.
  return noteIds.reduce((notes, id) =>
    // Concatenate possible matching ids to the result
    notes.concat(
      allNotes.filter(note => note.id === id)
    )
  , []);
}
leanpub-end-insert

export default connect(
  ({NoteStore}) => ({
    notes: NoteStore.notes
  }), {
leanpub-start-delete
    NoteActions
leanpub-end-delete
leanpub-start-insert
    NoteActions,
    LaneActions
leanpub-end-insert
  }
)(Lane)
```

If you try using the application now, you should see that each lane is able to maintain its own notes:

![Separate notes](images/kanban_02.png)

The current structure allows us to keep singleton stores and a flat data structure. Dealing with references is a little awkward, but that's consistent with the Flux architecture. You can see the same theme in the [Redux implementation](https://github.com/survivejs-demos/redux-demo). The [MobX one](https://github.com/survivejs-demos/mobx-demo) avoid the problem altogether given we can use proper references there.

T> Normalizing the data would have made `selectNotesByIds` trivial. If you are using a solution like Redux, normalization can make operations like this easy.

## Conclusion

We managed to solve the problem of handling data dependencies in this chapter. It is a problem that comes up often. Each data management solution provides a way of its own to deal with it. Flux based alternatives and Redux expect you to manage the references. Solutions like MobX have reference handling integrated. Data normalization can make these type of operations easier.

In the next chapter we will focus on adding missing functionality to the application. This means tackling editing lanes. We can also make the application look a little nicer again. Fortunately a lot of the logic has been developed already.
