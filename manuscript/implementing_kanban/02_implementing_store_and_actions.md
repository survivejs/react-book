# Implementing `NoteStore` and `NoteActions`

Now that we have pushed data management related concerns in the right places, we can focus on implementing the remaining portions - `NoteStore` and `NoteActions`. These will encapsulate the application data and logic.

No matter what state management solution you end up using, there is usually something equivalent around. In Redux you would end up using actions that then trigger a state change through a reducer. In MobX you could model an action API within an ES6 class. The idea is that you will manipulate the data within the class and that will cause MobX to refresh your components as needed.

The idea is similar here. We will set up actions that will end up triggering our store methods that modify the state. As the state changes, our views will update. To get started, we can implement a `NoteStore` and then define logic to manipulate it. Once we have done that, we have completed porting our application to the Flux architecture.

## Setting Up a `NoteStore`

Currently we maintain the application state at `App`. The first step towards pushing it to Alt is to define a store and then consume it from there. This will break the logic of our application temporarily as that needs to be pushed to Alt as well. Setting up an initial store is a good step towards this overall goal, though.

To set up a store we need to perform three steps. We'll need to set it up, then connect it with Alt at `Provider`, and finally connect it with `App`.

In Alt we model stores using ES6 classes. Here's a minimal implementation modeled after our current state:

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
}
```

The next step is connecting the store with `Provider`. This is where that `setup` module comes in handy:

**app/components/Provider/setup.js**

```javascript
leanpub-start-delete
export default alt => {}
leanpub-end-delete
leanpub-start-insert
import NoteStore from '../../stores/NoteStore';

export default alt => {
  alt.addStore('NoteStore', NoteStore);
}
leanpub-end-insert
```

To prove that our setup works, we can adjust `App` to consume its data from the store. This will break the logic since we don't have any way to adjust the store data yet, but that's something we'll fix in the next section. Tweak `App` as follows to make `notes` available there:

**app/components/App.jsx**

```javascript
...

class App extends React.Component {
leanpub-start-delete
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
leanpub-end-delete
  render() {
leanpub-start-delete
    const {notes} = this.state;
leanpub-end-delete
leanpub-start-insert
    const {notes} = this.props;
leanpub-end-insert

    return (
      <div>
leanpub-start-delete
        {this.props.test}
leanpub-end-delete
        <button className="add-note" onClick={this.addNote}>+</button>
        <Notes
          notes={notes}
          onNoteClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
      </div>
    );
  }
  ...
}

leanpub-start-delete
export default connect(() => ({
  test: 'test'
}))(App)
leanpub-end-delete
leanpub-start-insert
export default connect(({notes}) => ({
  notes
}))(App)
leanpub-end-insert
```

If you refresh the application now, you should see exactly the same data as before. This time, however, we are consuming the data from our store. As a result our logic is broken. That's something we'll need to fix next as we define `NoteActions` and push our state manipulation to the `NoteStore`.

T> Given `App` doesn't depend on state anymore, it would be possible to port it as a function based component. Often most of your components will be based on functions just for this reason. If you aren't using state or refs, then it's safe to default to functions.

## Understanding Actions

Actions are one of the core concepts of the Flux architecture. To be exact, it is a good idea to separate **actions** from **action creators**. Often the terms might be used interchangeably, but there's a considerable difference.

Action creators are literally functions that *dispatch* actions. The payload of the action will then be delivered to the interested stores. It can be useful to think them as messages wrapped into an envelope and then delivered.

This split is useful when you have to perform asynchronous actions. You might for example want to fetch the initial data of your Kanban board. The operation might then either succeed or fail. This gives you three separate actions to dispatch. You could dispatch when starting to query and when you receive some response.

All of this data is valuable is it allows you to control the user interface. You could display a progress widget while a query is being performed and then update the application state once it has been fetched from the server. If the query fails, you can then let the user know about that.

You can see this theme across different state management solutions. Often you model an action as a function that returns a function (a *thunk*) that then dispatches individual actions as the asynchronous query progresses. In a naïve synchronous case it's enough to return the action payload directly.

T> The official documentation of Alt covers [asynchronous actions](http://alt.js.org/docs/createActions/) in greater detail.

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

class App extends React.Component {
  ...
}

leanpub-start-delete
export default connect(({notes}) => ({
  notes
}))(App)
leanpub-end-delete
leanpub-start-insert
export default connect(({notes}) => ({
  notes
}), {
  NoteActions
})(App)
leanpub-end-insert
```

This gives us `this.props.NoteActions.create` kind of API for triggering various actions. That's good for expanding the implementation further.

## Connecting `NoteActions` with `NoteStore`

Alt provides a couple of convenient ways to connect actions to a store:

* `this.bindAction(NoteActions.CREATE, this.create)` - Bind a specific action to a specific method.
* `this.bindActions(NoteActions)`- Bind all actions to methods by convention. I.e., `create` action would map to a method named `create`.
* `reduce(state, { action, data })` - It is possible to implement a custom method known as `reduce`. This mimics the way Redux reducers work. The idea is that you'll return a new state based on the given state and payload.

We'll use `this.bindActions` in this case as it's enough to rely on convention. Tweak the store as follows to connect the actions and to add initial stubs for the logic:

**app/stores/NoteStore.js**

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

## Porting `App.addNote` to Flux

`App.addNote` is a good starting point. The first step is to trigger the associate action (`NoteActions.create`) from the method and see if we see something at the browser console. If we do, then we can manipulate the state. Trigger the action like this:

**app/components/App.jsx**

```javascript
...

class App extends React.Component {
  render() {
    ...
  }
  addNote = () => {
leanpub-start-delete
    // It would be possible to write this in an imperative style.
    // I.e., through `this.state.notes.push` and then
    // `this.setState({notes: this.state.notes})` to commit.
    //
    // I tend to favor functional style whenever that makes sense.
    // Even though it might take more code sometimes, I feel
    // the benefits (easy to reason about, no side effects)
    // more than make up for it.
    //
    // Libraries, such as Immutable.js, go a notch further.
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'New task'
      }])
    });
leanpub-end-delete
leanpub-start-insert
    this.props.NoteActions.create({
      id: uuid.v4(),
      task: 'New task'
    });
leanpub-end-insert
  }
  ...
}

...
```

If you refresh and click the "add note" button now, you should see messages like this at the browser console:

```bash
create note Object {id: "62098959-6289-4894-9bf1-82e983356375", task: "New task"}
```

This means we have the data we need at the `NoteStore` `create` method. We still need to manipulate the data. After that we have completed the loop and we should see new notes through the user interface. Alt follows a similar API as React here. Consider the implementation below:

**app/stores/NoteStore.js**

```javascript
import uuid from 'uuid';
import NoteActions from '../actions/NoteActions';

export default class NoteStore {
  constructor() {
    ...
  }
  create(note) {
leanpub-start-delete
    console.log('create note', note);
leanpub-end-delete
leanpub-start-insert
    this.setState({
      notes: this.notes.concat(note)
    });
leanpub-end-insert
  }
  ...
}
```

If you try adding a note now, the update should go through. Alt maintains the state now and the edit goes through thanks to the architecture we set up. We still have to repeat the process for the remaining methods to complete the work.

## Porting `App.deleteNote` to Flux

The process exactly the same for `App.deleteNote`. We'll need to connect it with our action and then port it over. Here's the `App` portion:

**app/components/App.jsx**

```javascript
...

class App extends React.Component {
  ...
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

leanpub-start-delete
    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
leanpub-end-delete
leanpub-start-insert
    this.props.NoteActions.delete(id);
leanpub-end-insert
  }
  ...
}

...
```

If you refresh and try to delete a note now, you should see a message like this at the browser console:

```bash
delete note 501c13e0-40cb-47a3-b69a-b1f2f69c4c55
```

To finalize the porting, we'll need to move the `setState` logic to the `delete` method. Remember to drop `this.state.notes` and replace that with just `this.notes`:

**app/stores/NoteStore.js**

```javascript
import uuid from 'uuid';
import NoteActions from '../actions/NoteActions';

export default class NoteStore {
  ...
  delete(id) {
leanpub-start-delete
    console.log('delete note', id);
leanpub-end-delete
leanpub-start-insert
    this.setState({
      notes: this.notes.filter(note => note.id !== id)
    });
leanpub-end-insert
  }
}
```

After this change you should be able to delete notes just like before. There are still a couple of methods to port.

## Porting `App.activateNoteEdit` to Flux

`App.activateNoteEdit` is essentially an `update` operation. We'll need to change the `editing` flag of the given note as `true`. That will initiate the editing process. As usual, we can port `App` to the scheme first:

**app/components/App.jsx**

```javascript
...

class App extends React.Component {
  ...
  activateNoteEdit = (id) => {
leanpub-start-delete
    this.setState({
      notes: this.state.notes.map(note => {
        if(note.id === id) {
          note.editing = true;
        }

        return note;
      })
    });
leanpub-end-delete
leanpub-start-insert
    this.props.NoteActions.update({id, editing: true});
leanpub-end-insert
  }
  ...
}

...
```

If you refresh and try to edit now, you should see messages like this at the browser console:

```bash
update note Object {id: "2c91ba0f-12f5-4203-8d60-ea673ee00e03", editing: true}
```

We still need to commit the change to make this work. The logic is the same as in `App` before except we have generalized it further using `Object.assign`:

**app/stores/NoteStore.js**

```javascript
import uuid from 'uuid';
import NoteActions from '../actions/NoteActions';

export default class NoteStore {
  ...
  update(updatedNote) {
leanpub-start-delete
    console.log('update note', updatedNote);
leanpub-end-delete
leanpub-start-insert
    this.setState({
      notes: this.notes.map(note => {
        if(note.id === updatedNote.id) {
          return Object.assign({}, note, updatedNote);
        }

        return note;
      })
    });
leanpub-end-insert
  }
  ...
}
```

It should be possible to start editing a note now. If you try to finish editing, you should get an error like `Uncaught TypeError: Cannot read property 'notes' of null`. This is because we are missing one final portion of the porting effort, `App.editNote`.

## Porting `App.editNote` to Flux

This final part is easy. We have already the logic we need. Now it's just a matter of connecting `App.editNote` to it in a correct way. We'll need to call our `update` method the correct way:

**app/components/App.jsx**

```javascript
...

class App extends React.Component {
  ...
  editNote = (id, task) => {
leanpub-start-delete
    this.setState({
      notes: this.state.notes.map(note => {
        if(note.id === id) {
          note.editing = false;
          note.task = task;
        }

        return note;
      })
    });
leanpub-end-delete
leanpub-start-insert
    const {NoteActions} = this.props;

    NoteActions.update({id, task, editing: false});
leanpub-end-insert
  }
}

...
```

After refreshing you should be able to modify tasks again and the application should work just like before now. As we alter `NoteStore` through actions, this leads to a cascade that causes our `App` state to update through `setState`. This in turn will cause the component to `render`. That's Flux's unidirectional flow in practice.

We actually have more code now than before, but that's okay. `App` is a little neater and it's going to be easier to develop as we'll soon see. Most importantly we have managed to implement the Flux architecture for our application.

T> The current implementation is naïve in that it doesn't validate parameters in any way. It would be a very good idea to validate the object shape to avoid incidents during development. [Flow](http://flowtype.org/) based gradual typing provides one way to do this. In addition you could write tests to support the system.

### What's the Point?

Even though integrating a state management system took a lot of effort, it was not all in vain. Consider the following questions:

1. Suppose we wanted to persist the notes within `localStorage`. Where would you implement that? One approach would be to handle that at the `Provider` `setup`.
2. What if we had many components relying on the data? We would just consume the data through `connect` and display it, however we want.
3. What if we had many, separate Note lists for different types of tasks? We could set up another store for tracking these lists. That store could refer to actual Notes by id. We'll do something like this in the next chapter, as we generalize the approach.

Adopting a state management system can be useful as the scale of your React application grows. The abstraction comes with some cost as you end up with more code. But on the other hand if you do it right, you'll end up with something that's easy to reason and develop further. Especially the unidirectional flow embraced by these systems helps when it comes to debugging and testing.

## Conclusion

In this chapter, you saw how to port our simple application to use Flux architecture. In the process we learned more about **actions** and **stores** of Flux. Now we are ready to start adding more functionality to our application. We'll add `localStorage` based persistency to the application next and perform a little clean up while at it.
