# Implementing `NoteStore` and `NoteActions`

Now that we have pushed data management related concerns in the right places, we can focus on implementing the remaining portions - `NoteStore` and `NoteActions`. These will encapsulate the application data and logic.

No matter what state management solution you end up using, there is usually something equivalent around. In Redux you would end up using actions that then trigger a state change through a reducer. In MobX you could model action API within an ES6 class that then manipulates the data causing your views to refresh as needed.

The idea is similar here. We set up actions that will end up triggering our store methods that modify the state. As the state changes, our views will update. To get started, we can implement a `NoteStore` and then define logic to manipulate it. Once we have done that, we have completed porting our application to the Flux architecture.

## Setting Up a `NoteStore`

Currently we maintain the application state at `App`. The first step towards pushing it to Alt is to define a store and then consume it from there. This will break the logic of our application temporarily as that needs to be pushed to Alt as well. Setting up an initial store is a good step towards this overall goal, though.

To set up a store we need to perform three steps. We'll need to set it up, then connect it with Alt at `Provider`, and finally connect it with `App`.

In Alt we model stores using ES6 classes. To make it easy to `connect` later on, we can implement a `static` method known as `getState` that describes the default state of the store. Here's a minimal implementation modeled after our current state:

**app/stores/NoteStore.js**

```javascript
import uuid from 'uuid';

export default class NoteStore {
  constructor() {
    this.notes = [
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];
  }
  static getState() {
    return this.state.notes;
  }
}
```

The next step is connecting the store with `Provider`. This is where that `setup` module comes in handy:

**app/components/Provider/setup.js**

```javascript
leanpub-start-remove
export default alt => {}
leanpub-end-remove
leanpub-start-insert
import NoteStore from '../../stores/NoteStore';

export default alt => {
  alt.addStore('notes', NoteStore);
}
leanpub-end-insert
```

To prove that our setup works, we can adjust `App` to consume its data from the store. This will break the logic since we don't have any way to adjust the store data yet, but that's something we'll fix in the next section. Tweak `App` as follows to make `notes` available there:

**app/components/App.jsx**

```javascript
...

leanpub-start-remove
@connect(() => ({test: 'test'}))
leanpub-end-remove
leanpub-start-insert
@connect(({notes}) => ({notes}))
leanpub-end-insert
export default class App extends React.Component {
leanpub-start-remove
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    }
  }
leanpub-end-remove
  render() {
leanpub-start-remove
    const {notes} = this.state;
leanpub-end-remove
leanpub-start-insert
    const {notes} = this.props;
leanpub-end-insert

    return (
      <div>
leanpub-start-remove
        {this.props.test}
leanpub-end-remove
        <button className="add-note" onClick={this.addNote}>+</button>
        <Notes
          notes={notes}
          onValueClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
      </div>
    );
  }
  ...
}
```

If you refresh the application now, you should see exactly the same data as before. This time, however, we are consuming the data from our store. As a result our logic is broken. That's something we'll need to fix next as we define `NoteActions` and push our state manipulation to the `NoteStore`.

## Understanding Actions

Actions are one of the core concepts of the Flux architecture. To be exact, it is a good idea to separate **actions** from **action creators**. Often the terms might be used interchangeably, but there's a considerably difference.

Action creators are literally functions that *dispatch* actions. The payload of the action will then be delivered to the interested stores. It can be useful to think them as messages wrapped into an envelope and then delivered.

This split is useful when you have to perform asynchronous actions. You might for example want to fetch the initial data of your Kanban board. The operation might then either succeed or fail. This gives you three separate actions to dispatch. You could dispatch when starting to query and when you receive some response.

All of this data is valuable is it allows you to control the user interface. You could display a progress widget while a query is being performed and then update the application state once it has been fetched from the server. If the query fails, you can then let the user know about that.

You can see this theme across different state management solutions. Often you model an action as a function that returns a function (a *thunk*) that then dispatches individual actions as the asynchronous query progresses. In a naïve synchronous case it's enough to return the action payload directly.

## Setting Up `NoteActions`

Alt provides a little helper method known as `alt.generateActions` that can generate simple action creators for us. They will simply dispatch the data passed to them. We'll then connect these actions at the relevant stores. In this case that will be the `NoteStore` we defined earlier.

When it comes to the application, it is enough if we model basic CRUD (Create, Read, Update, Delete) operations. Given Read is implicit, we can skip that. But having the rest available as actions is useful. Set up `NoteActions` using the `alt.generateActions` shorthand like this:

**app/actions/NoteActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'update', 'delete');
```

This doesn't do much by itself. Given we need to `connect` the actions with `App` to actually trigger them, this would be a good place to do that. We can start worrying about individual actions after that as we expand our store. To `connect` the actions, tweak `App` like this:

**app/components/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';
import connect from '../libs/connect';
leanpub-start-insert
import NoteActions from '../actions/NoteActions';
leanpub-end-insert

leanpub-start-remove
@connect(({notes}) => ({notes}))
leanpub-end-remove
leanpub-start-insert
@connect(({notes}) => ({notes}), {
  noteActions: NoteActions
})
leanpub-end-insert
export default class App extends React.Component {
  ...
}
```

This gives us `this.props.noteActions.create` kind of API for triggering various actions. That's a good for expanding the implementation further.

T> The official documentation covers [asynchronous actions](http://alt.js.org/docs/createActions/) in greater detail.

## Connecting `NoteActions` with `NoteStore`

Alt provides a couple of convenient ways to connect actions to a store:

* `this.bindAction(NoteActions.CREATE, this.create)` - Bind a specific action to a specific method.
* `this.bindActions(NoteActions)`- Bind all actions to methods by convention. I.e., `create` action would map to a method named `create`.
* `reduce(state, { action, data })` - It is possible to implement a custom method known as `reduce`. This mimics the way Redux reducers work. The idea is that you'll return a new state based on the given state and payload.

We'll use `this.bindActions` in this case as it's enough to rely on convention. Tweak the store as follows to connect the actions and to add initial stubs for the logic:

**app/stores/NoteStore.jsx**

```javascript
import uuid from 'uuid';
leanpub-start-insert
import NoteActions from '../actions/NoteActions';
leanpub-end-insert

export default class NoteStore {
  constructor() {
leanpub-start-insert
    this.bindActions(NoteActions);
leanpub-end-insert

    this.notes = [
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];
  }
  static getState() {
    return this.state.notes;
  }
leanpub-start-insert
  create(note) {
    console.log('create note', note);
  }
  update(updatedNote) {
    console.log('update note', updatedNote);
  }
  delete(id) {
    console.log('delete note', id);
  }
leanpub-end-insert
}
```

To actually see it working, we'll need to start connecting our actions at `App` and the start porting the logic over.

## XXX

XXX: show how to port ops one by one

## Defining a Store for `Notes`

A store is a single source of truth for a part of your application state. In this case, we need one to maintain the state of the notes. We will connect all the actions we defined above using the `bindActions` function.

We have the logic we need for our store already at `App`. We will move that logic to `NoteStore`.

### Setting Up a Skeleton

As a first step, we can set up a skeleton for our store. We can fill in the methods we need after that. Alt uses standard ES6 classes, so it's the same syntax as we saw earlier with React components. Here's a starting point:

**app/stores/NoteStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];
  }
  create(note) {

  }
  update(updatedNote) {

  }
  delete(id) {

  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

We call `bindActions` to map each action to a method by name. After that we trigger the appropriate logic at each method. Finally, we connect the store with Alt using `alt.createStore`.

Note that assigning a label to a store (`NoteStore` in this case) isn't required. It is a good practice, though, as it protects the code against minification. These labels become important when we persist the data.

### Implementing `create`

Compared to the earlier logic, `create` will generate an id for a `Note` automatically. This is a detail that can be hidden within the store:

**app/stores/NoteStore.js**

```javascript
import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    ...
  }
  create(note) {
leanpub-start-insert
    const notes = this.notes;

    note.id = uuid.v4();

    this.setState({
      notes: notes.concat(note)
    });
leanpub-end-insert
  }
  ...
}

export default alt.createStore(NoteStore, 'NoteStore');
```

To keep the implementation clean, we are using `this.setState`. It is a feature of Alt that allows us to signify that we are going to alter the store state. Alt will signal the change to possible listeners.

### Implementing `update`

`update` follows the earlier logic apart from some renaming. Most importantly we commit the new state through `this.setState`:

**app/stores/NoteStore.js**

```javascript
...

class NoteStore {
  ...
  update(updatedNote) {
leanpub-start-insert
    const notes = this.notes.map(note => {
      if(note.id === updatedNote.id) {
        // Object.assign is used to patch the note data here. It
        // mutates target (first parameter). In order to avoid that,
        // I use {} as its target and apply data on it.
        //
        // Example: {}, {a: 5, b: 3}, {a: 17} -> {a: 17, b: 3}
        //
        // You can pass as many objects to the method as you want.
        return Object.assign({}, note, updatedNote);
      }

      return note;
    });

    // This is same as `this.setState({notes: notes})`
    this.setState({notes});
leanpub-end-insert
  }
  delete(id) {

  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

We have one final operation left, `delete`.

T> `{notes}` is known as a an ES6 feature known as [property shorthand](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer). This is equivalent to `{notes: notes}`.

### Implementing `delete`

`delete` is straightforward. Seek and destroy, as earlier, and remember to commit the change:

**app/stores/NoteStore.js**

```javascript
...

class NoteStore {
  ...
  delete(id) {
leanpub-start-insert
    this.setState({
      notes: this.notes.filter(note => note.id !== id)
    });
leanpub-end-insert
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

Instead of slicing and concatenating data, it would be possible to operate directly on it. For example a mutable variant, such as `this.notes.splice(targetId, 1)` would work. We could also use a shorthand, such as `[...notes.slice(0, noteIndex), ...notes.slice(noteIndex + 1)]`. The exact solution depends on your preferences. I prefer to avoid mutable solutions (i.e., `splice`) myself.

It is recommended that you use `setState` with Alt to keep things clean and easy to understand. Manipulating `this.notes` directly would work, but that would miss the intent and could become problematic in larger scale as mutation is difficult to debug. `setState` provides a nice analogue to the way React works so it's worth using.

We have almost integrated Flux with our application now. We have a set of actions that provide an API for manipulating `Notes` data. We also have a store for actual data manipulation. We are missing one final bit, integration with our view. It will have to listen to the store and be able to trigger actions to complete the cycle.

T> The current implementation is naïve in that it doesn't validate parameters in any way. It would be a very good idea to validate the object shape to avoid incidents during development. [Flow](http://flowtype.org/) based gradual typing provides one way to do this. Alternatively you could write nice tests. That's a good idea regardless.

## Gluing It All Together

Gluing this all together is a little complicated as there are multiple concerns to take care of. Dealing with actions is going to be easy. For instance, to create a Note, we would need to trigger `NoteActions.create({task: 'New task'})`. That would cause the associated store to change and, as a result, all the components listening to it.

Our `NoteStore` provides two methods in particular that are going to be useful. These are `NoteStore.listen` and `NoteStore.unlisten`. They will allow views to subscribe to the state changes.

As you might remember from the earlier chapters, React provides a set of lifecycle methods. We can subscribe to `NoteStore` within our view at `componentDidMount` and `componentWillUnmount`. By unsubscribing, we avoid possible memory leaks.

Based on these ideas we can connect `App` with `NoteStore` and `NoteActions`:

**app/components/App.jsx**

```javascript
leanpub-start-delete
import uuid from 'node-uuid';
leanpub-end-delete
import React from 'react';
import Notes from './Notes.jsx';
leanpub-start-insert
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
leanpub-end-insert

export default class App extends React.Component {
  constructor(props) {
    super(props);

leanpub-start-delete
    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    };
leanpub-end-delete
leanpub-start-insert
    this.state = NoteStore.getState();
leanpub-end-insert
  }
leanpub-start-insert
  componentDidMount() {
    NoteStore.listen(this.storeChanged);
  }
  componentWillUnmount() {
    NoteStore.unlisten(this.storeChanged);
  }
  storeChanged = (state) => {
    // Without a property initializer `this` wouldn't
    // point at the right context because it defaults to
    // `undefined` in strict mode.
    this.setState(state);
  };
leanpub-end-insert
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button className="add-note" onClick={this.addNote}>+</button>
        <Notes notes={notes}
          onEdit={this.editNote}
          onDelete={this.deleteNote} />
      </div>
    );
  }
leanpub-start-delete
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
  };
leanpub-end-delete
leanpub-start-insert
  deleteNote(id, e) {
    // Avoid bubbling to edit
    e.stopPropagation();

    NoteActions.delete(id);
  }
leanpub-end-insert
leanpub-start-delete
  addNote = () => {
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'New task'
      }])
    });
  };
leanpub-end-delete
leanpub-start-insert
  addNote() {
    NoteActions.create({task: 'New task'});
  }
leanpub-end-insert
leanpub-start-delete
  editNote = (id, task) => {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    const notes = this.state.notes.map(note => {
      if(note.id === id  && task) {
        note.task = task;
      }

      return note;
    });

    this.setState({notes});
  };
leanpub-end-delete
leanpub-start-insert
  editNote(id, task) {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    NoteActions.update({id, task});
  }
leanpub-end-insert
}
```

The application should work just like before now. As we alter `NoteStore` through actions, this leads to a cascade that causes our `App` state to update through `setState`. This in turn will cause the component to `render`. That's Flux's unidirectional flow in practice.

We actually have more code now than before, but that's okay. `App` is a little neater and it's going to be easier to develop as we'll soon see. Most importantly we have managed to implement the Flux architecture for our application.

### What's the Point?

Even though integrating Alt took a lot of effort, it was not all in vain. Consider the following questions:

1. Suppose we wanted to persist the notes within `localStorage`. Where would you implement that? One approach would be to handle that at application initialization.
2. What if we had many components relying on the data? We would just consume `NoteStore` and display it, however we want.
3. What if we had many, separate Note lists for different types of tasks? We could set up another store for tracking these lists. That store could refer to actual Notes by id. We'll do something like this in the next chapter, as we generalize the approach.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code, it is easier to reason about. Given we are dealing with a unidirectional flow we have something that is simple to debug and test.

## Conclusion

In this chapter, you saw how to port our simple application to use Flux architecture. In the process we learned about basic concepts of Flux. Now we are ready to start adding more functionality to our application. We'll add `localStorage` based persistency next and perform a little clean up while at it.
