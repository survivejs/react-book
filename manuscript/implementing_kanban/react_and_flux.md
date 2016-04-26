# React and Flux

You can get pretty far by keeping everything in components. Eventually, that will become painful, though. [Flux application architecture](https://facebook.github.io/flux/docs/overview.html) helps to bring clarity to our React applications. It's not the only solution, but it's a decent starting point.

Flux will allow us to separate data and application state from our views. This helps us to keep them clean and the application maintainable. Flux was designed with large teams in mind. As a result, you might find it quite verbose. This comes with great advantages, though, as it can be straightforward to work with.

## Introduction to Flux

![Unidirectional Flux dataflow](images/flux_linear.png)

So far, we've been dealing only with views. Flux architecture introduces a couple of new concepts to the mix. These are actions, dispatcher, and stores. Flux implements unidirectional flow in contrast to popular frameworks, such as Angular or Ember. Even though two-directional bindings can be convenient, they come with a cost. It can be hard to deduce what's going on and why.

### Actions and Stores

Flux isn't entirely simple to understand as there are many concepts to worry about. In our case, we will model `NoteActions` and `NoteStore`. `NoteActions` provide concrete operations we can perform over our data. For instance, we can have `NoteActions.create({task: 'Learn React'})`.

### Dispatcher

When we trigger an action, the dispatcher will get notified. The dispatcher will be able to deal with possible dependencies between stores. It is possible that a certain action needs to happen before another. The dispatcher allows us to achieve this.

At the simplest level, actions can just pass the message to the dispatcher as is. They can also trigger asynchronous queries and hit the dispatcher based on the result eventually. This allows us to deal with received data and possible errors.

Once the dispatcher has dealt with an action, the stores listening to it get triggered. In our case, `NoteStore` gets notified. As a result, it will be able to update its internal state. After doing this, it will notify possible listeners of the new state.

### Flux Dataflow

This completes the basic unidirectional, yet linear, process flow of Flux. Usually, though, the unidirectional process has a cyclical flow and it doesn't necessarily end. The following diagram illustrates a more common flow. It is the same idea again, but with the addition of a returning cycle. Eventually, the components depending on our store data become refreshed through this looping process.

This sounds like a lot of steps for achieving something simple as creating a new `Note`. The approach does come with its benefits. Given the flow is always in a single direction, it is easy to trace and debug. If there's something wrong, it's somewhere within the cycle.

![Flux dataflow with cycle](images/flux.png)

### Advantages of Flux

Even though this sounds a little complicated, the arrangement gives our application flexibility. We can, for instance, implement API communication, caching, and i18n outside of our views. This way they stay clean of logic while keeping the application easier to understand.

Implementing Flux architecture in your application will actually increase the amount of code somewhat. It is important to understand that minimizing the amount of code written isn't the goal of Flux. It has been designed to allow productivity across larger teams. You could say that explicit is better than implicit.

### Which Flux Implementation to Use?

The library situation is constantly changing. There is no single right way to interpret the architecture. You will find implementations that fit different tastes. [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison) provides a nice comparison between some of the more popular ones.

When choosing a library, it comes down to your own personal preferences. You will have to consider factors, such as API, features, documentation, and support. Starting with one of the more popular alternatives can be a good idea. As you begin to understand the architecture, you are able to make choices that serve you better.

T> [Redux](http://rackt.org/redux/) has taken the core ideas of Flux and pushed them into a tiny form (2 kB). Despite this, it's quite powerful approach and worth checking out. There's a [Redux implementation](https://github.com/survivejs/redux-demo) of the Kanban board. It can be interesting to compare it to the Alt one.

## Porting to Alt

![Alt](images/alt.png)

In this chapter, we'll be using a library known as [Alt](http://alt.js.org/). It is a flexible, full-featured implementation that has been designed with universal (isomorphic) rendering in mind.

In Alt, you'll deal with actions and stores. The dispatcher is hidden, but you will still have access to it if needed. Compared to other implementations, Alt hides a lot of boilerplate. There are special features to allow you to save and restore the application state. This is handy for implementing persistency and universal rendering.

### Setting Up an Alt Instance

Everything in Alt begins from an Alt instance. It keeps track of actions and stores and keeps communication going on. To keep things simple, we'll be treating all Alt components as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern). With this pattern, we reuse the same instance within the whole application. To achieve this we can push it to a module of its own and then refer to that from everywhere. Set it up as follows:

**app/libs/alt.js**

```javascript
import Alt from 'alt';
//import chromeDebug from 'alt-utils/lib/chromeDebug';

const alt = new Alt();
//chromeDebug(alt);

export default alt;
```

Webpack caches the modules so the next time you import Alt, it will return the same instance again.

T> There is a Chrome plugin known as [alt-devtool](https://github.com/goatslacker/alt-devtool). After it is installed, you can connect to Alt by uncommenting the related lines above. You can use it to debug the state of your stores, search, and travel in time.

### Defining CRUD API for Notes

Next, we'll need to define a basic API for operating over the Note data. To keep this simple, we can CRUD (Create, Read, Update, Delete) it. Given Read is implicit, we won't be needing that. We can model the rest as actions, though. Alt provides a shorthand known as `generateActions`. We can use it like this:

**app/actions/NoteActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'update', 'delete');
```

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

As you might remember from the earlier chapters, React provides a set of lifecycle hooks. We can subscribe to `NoteStore` within our view at `componentDidMount` and `componentWillUnmount`. By unsubscribing, we avoid possible memory leaks.

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
