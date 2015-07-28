# From Notes to Kanban

![Kanban board](images/kanban.png)

So far we have managed to set up a nice little development environment and develop an application for keeping track of notes in `localStorage`. We still have work to do in order to turn this into a real Kanban as pictured above.

Most importantly our system is missing the concept of Lane. A Lane is something that should be able to contain multiple `Notes` within itself. In the current system that is implicit. We'll need to extract that into a component of its own.

## Extracting `Lanes`

As earlier we can use the same idea of two components here. There will be a component for higher level (i.e. `Lanes`) and for lower level (i.e. `Lane`). The higher level component will deal with lane ordering. An individual `Lane` will just render its contents (i.e. name and `Notes`) and provide basic manipulation operations as needed.

Just as with Notes we are going to need a set of actions. For now it is enough if we can just create new lanes so we can create a corresponding action for that as below:

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create');
```

In addition we are going to need a `LaneStore` and a method matching to `create`. The idea is pretty much the same as for `NoteStore` earlier. `create` will concatenate a new lane to the list of lanes. After that the change will propagate to the listeners (i.e. `FinalStore` and components).

**app/stores/LaneStore.js**

```javascript
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = this.lanes || [];
  }
  create(name) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.concat({
        name: name
      })
    });
  }
}

export default alt.createStore(LaneStore);
```

We are also going to need a stub for `Lanes`. We will expand this later. Now we just want something simple to show up.

**app/components/Lanes.jsx**

```javascript
import React from 'react';

export default class Lanes extends React.Component {
  render() {
    return (
      <div className='lanes'>
        lanes should go here
      </div>
    );
  }
}
```

Next we need to make room for `Lanes` at `App`. We will simply replace `Notes` references with `Lanes`, set up actions and store needed. Consider the example below:

**app/components/App.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Lanes from './Lanes';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';

export default class App extends React.Component {
  constructor() {
    super();

    this.addLane = this.addLane.bind(this);
  }
  render() {
    return (
      <div>
        <button onClick={this.addLane}>+</button>
        <AltContainer
          stores={[LaneStore]}
          inject={ {
            items: () => LaneStore.getState().lanes
          } }
        >
          <Lanes />
        </AltContainer>
      </div>
    );
  }
  addLane() {
    LaneActions.create('New lane');
  }
}
```

The current implementation doesn't do much. It just shows a plus button and *lanes should go here* text. We still need to model `Lane` and attach `Notes` to that to make this work.

## Modeling `Lane`

Each `Lane` will be able to render associated `Notes` just like our `App` did earlier. `Lanes` container in turn will render each `Lane` separately. It is analogous to `Notes` in this manner. The example below illustrates how to set up `Lanes`.

**app/components/Lanes.jsx**

```javascript
import React from 'react';
import Lane from './Lane';

export default class Lanes extends React.Component {
  constructor(props) {
    super(props);

    this.renderLane = this.renderLane.bind(this);
  }
  render() {
    const lanes = this.props.items;

    return <div className='lanes'>{lanes.map(this.renderLane)}</div>;
  }
  renderLane(lane, i) {
    return <Lane className='lane' key={`lane${i}`} {...lane} />;
  }
}
```

In addition we are going to need `Lane` component to make this work. It will render `Lane` name and associated `Notes`. To make it easier to customize, I will keep the prop interface generic. In other words I'll allow `Lanes` to attach custom HTML attributes to each. This way the `className` declaration above will work. I'll be using [Object rest syntax](https://github.com/sebmarkbage/ecmascript-rest-spread) (`{a, b, ...props} = this.props`) available as a Stage 1 feature. It is perfect for a case such as this as it will extract the props we don't need. This way we don't end up polluting the HTML element.

The example below has been modeled largely after our earlier implementation of `App`. It introduced Object rest syntax and will render an entire lane including its name and associated notes:

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props) {
    super(props);

    this.addNote = this.addNote.bind(this);
    this.noteEdited = this.noteEdited.bind(this);
  }
  render() {
    const {name, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <div className='lane-name'>{name}</div>
          <div className='lane-add-note'>
            <button onClick={this.addNote}>+</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => NoteStore.getState().notes || []
          } }
        >
          <Notes onEdit={this.noteEdited} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create('New note');
  }
  noteEdited(id, task) {
    if(task) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.remove(id);
    }
  }
}
```

Now we have something that sort of works. You can see there's something seriously wrong, though. If you add new Notes to a Lane, the Note appears to each Lane. Also if you modify a Note, also other Lanes update.

The reason why this happens is quite simple. Our `NoteStore` is a singleton. This means every component that is listening to `NoteStore` will receive the same data. We will need to resolve this problem somehow.

## Making Lanes Responsible of Notes

Currently our `Lane` model is very simple. We are just storing an array of objects. Each of the objects knows lane name and that's it. It would be beneficial if `Lanes` knew more about their contents. For instance if each `Lane` knew which `Notes` it contains, we could then pick just those `Notes` from `NoteStore` and render only them per each `Lane`. This means we would like to end up with a data model like this for `LaneStore`:

```javascript
[
  {
    id: 'de69027c-481b-4f99-b5b4-f2e77bc7fbca',
    name: 'Todo',
    notes: ['7be0cf54-66a6-4c80-b79e-53d992e8a0b5', ...]
  },
  {
    id: '2403e089-4b7a-44f8-a33e-0e55bdc16e5d',
    name: 'Doing',
    notes: [...]
  },
  {
    id: 'da290779-9953-489b-9139-1874bbbf56a8',
    name: 'Done',
    notes: [...]
  }
];
```

This scheme is built on the idea of indexing. The naive way would be to use `Notes` array indices directly. The problem with this approach is that it will get difficult if we start removing `Notes`. We would have to fix `Lane` indices. A better alternative is to generate a unique id per each `Note` and use that instead.

A standard known as [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) describes a good way to do this. We'll be using Node implementation of it. Invoke `npm i node-uuid --save` at project root to get it installed. If you open up Node cli (`node`) and try the following, you can see what kind of ids it outputs.

```javascript
> uuid = require('node-uuid')
{ [Function: v4]
  v1: [Function: v1],
  v4: [Circular],
  parse: [Function: parse],
  unparse: [Function: unparse],
  BufferClass: [Function: Array] }
> uuid.v4()
'1c8e7a12-0b4c-4f23-938c-00d7161f94fc'
```

T> If you are interested in the math behind this, check out [the calculations at Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Random_UUID_probability_of_duplicates) for details. You'll see that the possibility for collisions is somewhat miniscule.

The next step is to integrate this id scheme to our application. We will need to tweak application logic to be id based. Each `Lane` and `Note` will require an id of its own. These ids will be used by our actions. In addition we need to change our stores to work based on the improved data model. This represents a large amount of changes across a large portion of the codebase.

XXXXX: introduce ids earlier so less changes are needed here

## Going from Note Singletons to Instances

There are a few changes we need to make in order to convert the current singleton based solution to instances. Most importantly our current `NoteStore` and `NoteActions` have to drop their direct dependency on `alt`. We'll want to be able to manage that ourselves at `Lane`. This way we can create an instance per `Lane` and the problem we encountered will disappear.

Removing direct dependency to `alt` from `NoteActions` can be achieved by wrapping it within a function. After this we can create instances of actions whenever we need them.

**app/actions/NoteActions.js**

```javascript
export default (alt) => alt.generateActions('init', 'create', 'update', 'remove');
```

To break `NoteStore`'s dependency on `alt` we'll want to take control of `alt.createStore`. This means we'll need to remove the current invocation from the store. In addition we'll want to glue actions and store together. Depending on a single set of actions like earlier wouldn't work as then the same actions would trigger multiple stores. We'll want this to be one-to-one relation.

We can achieve this by passing actions as a parameter to our store. We can then use Alt's `bindActions` method to connect the store with the actions.

**app/stores/NoteStore.js**

```javascript
export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  ...
}
```

Finally we need to alter `Lane`. It has to be able to maintain a `NoteStore` and associated actions. The code below shows how to wire it up:

**app/components/Lane.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';

import alt from '../libs/alt';
import {getInitialData} from '../libs/storage';
import Notes from './Notes';
import createNoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props) {
    super(props);

    this.actions = createNoteActions(alt);

    const storeName = `NoteStore-${this.props.i}`;
    this.store = alt.createStore(NoteStore, storeName, this.actions);
    this.actions.init(getInitialData(storeName));

    this.addNote = this.addNote.bind(this);
    this.noteEdited = this.noteEdited.bind(this);
  }
  render() {
    const {i, name, ...props} = this.props;

    return (
      <div {...props}>
      ...
        <AltContainer
          stores={[this.store]}
          inject={ {
            items: () => this.store.getState().notes || []
          } }
        />
      ...
      </div>
    );
  }
  addNote() {
    this.actions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      this.actions.update({id, note});
    }
    else {
      this.actions.remove(id);
    }
  }
```

Now we have something that mostly works. We have separate lanes, you can add new notes to them and modify/remote them. There are still a few bits we're missing. Namely lane name editing and lane removal. Let's get those done next.

## Implementing Edit/Remove for `Lane`

We can follow the same idea as for `Note` here. I.e. if you click `Lane` name, it should become editable. In case the new name is empty, we'll simply remove it. Given it's the same behavior we can extract it from `Note` and then reuse at `Lane`.

Given `Note` already contains some of the logic we need, we can generalize the component. Rename `Note.jsx` as `Editable.jsx` and change its class name to avoid confusion:

**app/components/Editable.jsx**

```javascript
import React from 'react';

export default class Editable extends React.Component {
  ...
}
```

Make `Notes.jsx` point at `Editable` instead of `Note` like this:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Editable from './Editable';

export default class Notes extends React.Component {
  ...
  renderNote(note, i) {
    return (
      <li className='note' key={`note${i}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </li>
    );
  }
}
```

We should replace `Lane` name to be rendered through `Editable`:

**app/components/Lane.jsx**

```javascript
...

import Editable from './Editable';

...

<Editable className='lane-name' value={name} onEdit={this.nameEdited} />

...

nameEdited(id, name) {
  console.log('edited lane name', id, name);
}
```

If you try to edit a lane name now, you should see a console print. We still need some logic (i.e. actions and store tweaks) to make this work. A good starting point is to sketch out the component level logic:

**app/components/Lane.jsx**

```javascript
...
import LaneActions from '../actions/LaneActions';

...

nameEdited(id, name) {
  if(name) {
    LaneActions.update({id, name});
  }
  else {
    LaneActions.remove(id);
  }
}
```

This is exactly the same logic as for notes. In fact it is be possible to refactor the behavior into a method of its own. This can be done by extracting actions into a parameter. As duplication is the root of all evil, let's change it to this form:

**app/components/Lane.jsx**

```javascript
export default class Lane extends React.Component {
  constructor(props) {
    super(props);

    ...

    this.addNote = this.addNote.bind(this);
    this.nameEdited = this.edited.bind(this, LaneActions, 'name', props.i);
    this.taskEdited = this.edited.bind(this, this.actions, 'task');
  }

  render() {
    ...

    <Editable className='lane-name' value={name}
      onEdit={this.nameEdited} />

    ...

    <Notes onEdit={this.taskEdited} />

    ...
  }
  edited(actions, field, id, value) {
    if(value) {
      actions.update({id, [field]: value});
    }
    else {
      actions.remove(id);
    }
  }
}
```

Now our editing logic is in a single place. We could have done this modification later but this felt like a good place to do that. Sometimes it can be justified to get rid of duplicates and push them to methods, components or decorators. We are still missing some of the logic to make `Lane` edit/remove work, though. To achieve that we need to extend `Lane` actions and store.

**app/actions/LaneActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('init', 'create', 'update', 'remove');
```

It's the same idea as for `NoteActions` apart from the way we instantiate the stores. It would be possible to extract the instantiation logic from here as well. That could be a good idea especially if you want to have multiple boards in your application.

One radical option would be to use the same base class for both `LaneActions` and `NoteActions` but that feels like a premature optimization as it is difficult to say how these APIs might evolve. Some amount of duplication can be acceptable.

We still need those `LaneStore` methods. Not surprisingly it's going to be very similar to the `NoteStore` implementation. Again, a possible place to clean up later.

**app/stores/LaneStore.js**

```javascript
...

class LaneStore {
  ...
  update({id, name}) {
    const lanes = this.lanes;

    lanes[id].name = name;

    this.setState({lanes});
  }
  remove(id) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.slice(0, id).concat(lanes.slice(id + 1))
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
```

After these changes you should be able to modify lane names and remove lanes. Even persistency should just work without requiring any further tweaking. The implementation could be trimmed and some code could be removed but for now it's nice to have some room to maneuver. Who knows what sort of requirements might come up after all.

## Conclusion

In this chapter we managed to generalize our application somehow. We actually have something you can sort of use! It's not pretty and the user experience is quite horrible. Still, it's better than before. Before focusing on advanced functionality let's try to make the application look a little better and study some styling approaches.
