# React and Flux

You can get pretty far by keeping everything in components. That's an entirely valid way to get started. The problems begin as you add state to your application and need to share it across different parts. This is the reason why various state management solutions have emerged. Each one of those tries to solve the problem in its own way.

The [Flux application architecture](https://facebook.github.io/flux/docs/overview.html) was the first proper solution to the problem. It allows you to model your application in terms of **Actions**, **Stores**, and **Views**. It also has a part known as **Dispatcher** to manage actions and allow you to model dependencies between different calls.

This separation is particularly useful when you are working with large teams. The unidirectional flow makes it easy to tell what's going on. That's a common theme in various data management solutions available for React.

## Quick Introduction to Redux

A solution known as [Redux](http://redux.js.org/) took the core ideas of Flux and pushed them to a certain form. Redux is more of a guideline, though a powerful one, that gives your application certain structure and pushes you to model data related concerns in a certain way. You will maintain the state of your application in a single tree which you then alter using pure functions (no side effects) through reducers.

This might sound a little complex but in practice Redux makes your data flow very explicit. Standard Flux isn't as opinionated in certain parts. I believe understanding basic Flux before delving into Redux is a good move as you can see shared themes in both.

## Quick Introduction to MobX

[MobX](https://mobxjs.github.io/mobx/) takes an entirely different view on data management. If Redux helps you to model data flow explicitly, MobX makes a large part of that implicit. It doesn't force you to any certain structure. Instead you will annotate your data structures as **observable** and let MobX handle updating your views.

Whereas Redux embraces the concept of immutability through its idea of reducers, MobX does something opposite and relies on mutation. This means aspects like reference handling can be surprisingly simple in MobX while in Redux you will most likely be forced to normalize your data so that it is easy to manipulate through reducers.

Both Redux and MobX are valuable in their own ways. There's no one right solution when it comes to data management. I'm sure more alternatives will appear as time goes by. Each solution comes with its pros/cons. By understanding the alternatives you have a better chance of picking a solution that fits your purposes at a given time.

## Which Data Management Solution to Use?

![Alt](images/alt.png)

The data management situation is changing constantly. At the moment [Redux](http://rackt.org/redux/) is very strong, but there are good alternatives in sight. [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison) provides a nice comparison between some of the more popular ones.

When choosing a library, it comes down to your own personal preferences. You will have to consider factors, such as API, features, documentation, and support. Starting with one of the more popular alternatives can be a good idea. As you begin to understand the architecture, you are able to make choices that serve you better.

In this application we'll use a Flux implementation known as [Alt](http://alt.js.org/). The API is neat and enough for our purposes. As a bonus, Alt has been designed universal (isomorphic) rendering in mind. If you understand Flux, you have a good starting point for understanding the alternatives.

The book doesn't cover the alternative solutions in detail yet, but we'll design our application architecture so that it's possible to plug in alternatives at a later time. The idea is that we isolate our view portion from the data management so that we can swap parts without tweaking our React code. It's one way to design for change.

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

![Cyclical Flux dataflow](images/flux.png)

### Advantages of Flux

Even though this sounds a little complicated, the arrangement gives our application flexibility. We can, for instance, implement API communication, caching, and i18n outside of our views. This way they stay clean of logic while keeping the application easier to understand.

Implementing Flux architecture in your application will actually increase the amount of code somewhat. It is important to understand that minimizing the amount of code written isn't the goal of Flux. It has been designed to allow productivity across larger teams. You could say that explicit is better than implicit.

## Porting to Alt

In Alt, you'll deal with actions and stores. The dispatcher is hidden, but you will still have access to it if needed. Compared to other implementations, Alt hides a lot of boilerplate. There are special features to allow you to save and restore the application state. This is handy for implementing persistency and universal rendering.

There are a couple of steps we must take to push our application state to Alt:

1. Set up an Alt instance to keep track of actions and stores and to coordinate communication.
2. Connect Alt with views.
3. Push our data to a store.
4. Define actions to manipulate the store.

We'll do this gradually. The Alt specific portions will go behind adapters. It would be possible to interact with it directly. The adapter approach allows us to change our mind later easier so it's worth following.

### Setting Up an Alt Instance

Everything in Alt begins from an Alt instance. It keeps track of actions and stores and keeps communication going on. To keep things simple, we'll be treating all Alt components as a [singleton](https://en.wikipedia.org/wiki/Singleton_pattern). With this pattern, we reuse the same instance within the whole application.

To achieve this we can push it to a module of its own and then refer to that from everywhere. Configure it as follows:

**app/libs/alt.js**

```javascript
import Alt from 'alt';

const alt = new Alt();

export default alt;
```

Webpack caches the modules so the next time you import Alt from somewhere, it will return the same instance again.

T> The boilerplate uses a Webpack plugin known as [npm-install-webpack-plugin](https://github.com/ericclemmons/npm-install-webpack-plugin). It will install Alt automatically as your project dependency. You'll see similar behavior as we develop our project further.

### Connecting Alt with Views

Normally state management solutions provide two parts you can use to connect them with a React application. These are a `Provider` component and a `connect` higher order function (function returning function generating a component). The `Provider` sets up a React [context](https://facebook.github.io/react/docs/context.html).

Context is an advanced feature that can be used to pass data through a component hierarchy implicitly without going through props. The `connect` function uses the context to dig the data we want and then passes it to a component.

It is possible to use a `connect` through function invocation or a decorator as we'll see soon. The *Understanding Decorators* appendix digs deeper into the pattern.

To keep our application architecture easy to modify, we'll need to set up two adapters. One for `Provider` and one for `connect`. We'll deal with Alt specific details in both places.

### Setting Up a `Provider`

In order to keep our `Provider` flexible, I'm going to use special configuration. We'll wrap it within a module that will choose a `Provider` depending on our environment. This enables us to use development tooling without including it to the production bundle. There's some additional setup involved, but it's worth it given you end up with a cleaner result.

The core of this arrangement is the index of the module. CommonJS picks up the **index.js** of a directory by default when we perform an import against the directory. Given the behavior we want is dynamic, we cannot rely on ES6 modules here. The idea is that our tooling will rewrite the code depending on `process.env.NODE_ENV` and choose the actual module to include based on that. Here's the entry point of our `Provider`:

**app/components/Provider/index.js**

```javascript
if(process.env.NODE_ENV === 'production') {
  module.exports = require('./Provider.prod');
}
else {
  module.exports = require('./Provider.dev');
}
```

We also need the files the index is pointing at. The first part is easy. We'll need to point to our Alt instance there, connect it with a component known as `AltContainer`, and then render out application within it. That's where `props.children` comes in. It's the same idea as before.

`AltContainer` will enable us to connect the data of our application at component level when we implement `connect`. To get to the point, here's the production level implementation:

**app/components/Provider/Provider.prod.jsx**

```javascript
import React from 'react';
import AltContainer from 'alt-container';
import alt from '../../libs/alt';
import setup from './setup';

setup(alt);

export default ({children}) =>
  <AltContainer flux={alt}>
    {children}
  </AltContainer>
```

The implementation of `Provider` can change based on which state management solution we are using. It is possible it ends up doing nothing, but that's acceptable. The idea is that we have an extension point where to alter our application if needed.

We are still missing one part, the development related setup. It is like the production one except this time we can enable development specific tooling. This is a good chance to move the *react-addons-perf* setup here from the *app/index.jsx* of the application. I'm also enabling [Alt's Chrome debug utilities(https://github.com/goatslacker/alt-devtool). You'll need to install the Chrome portion separately if you want to use those.

Here's the full code of the development provider:

**app/components/Provider/Provider.dev.jsx**

```javascript
import React from 'react';
import AltContainer from 'alt-container';
import chromeDebug from 'alt-utils/lib/chromeDebug';
import alt from '../../libs/alt';
import setup from './setup';

setup(alt);

chromeDebug(alt);

React.Perf = require('react-addons-perf');

export default ({children}) =>
  <AltContainer flux={alt}>
    {children}
  </AltContainer>
```

That `setup` module allows us to perform Alt related setup that's common for both production and development environment. For now it's enough to do nothing there like this:

**app/components/Provider/setup.js**

```javascript
export default alt => {}
```

We still need to connect the `Provider` with our application by tweaking *app/index.jsx*. Perform the following changes to hook it up:

**app/index.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
leanpub-start-insert
import Provider from './components/Provider';
leanpub-end-insert

leanpub-start-remove
if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}
leanpub-end-remove

ReactDOM.render(
leanpub-start-remove
  <App />,
leanpub-end-remove
leanpub-start-insert
  <Provider><App /></Provider>,
leanpub-end-insert
  document.getElementById('app')
);
```

If you check out Webpack output, you'll likely see it is installing new dependencies to the project. That's expected given the changes. The process might take a while to complete. Once completed, refresh the browser.

Given we didn't change the application logic in any way, everything should still look the same. A good next step is to implement an adapter for connecting data to our views.

T> You can see a similar idea in [react-redux](https://www.npmjs.com/package/react-redux). MobX won't need a Provider at all. In that case our implementation would simply return `children`.

### Understanding `connect`

The idea of `connect` is to allow us to attach specific data and actions to components. I've modeled the API after react-redux. Fortunately we can adapt various data management systems to work against it. Here's how you would connect lane data and actions with `App`:

```javascript
@connect(({lanes}) => ({lanes}), {
  laneActions: LaneActions
})
export default class App extends React.Component {
  render() {
    return (
      <div>
        <button className="add-lane" onClick={this.addLane}>+</button>
        <Lanes lanes={this.props.lanes} />
      </div>
    );
  }
  addLane = () => {
    this.props.laneActions.create({name: 'New lane'});
  }
}
```

The same could be written without decorators:

```javascript
class App extends React.Component {
  ...
}

export default connect(({lanes}) => ({lanes}), {
  laneActions: LaneActions
})(App)
```

In case you need to apply multiple higher order functions against a component, you could use an utility like `compose` and end up with `compose(a, b)(App)`. This would be equal to `a(b(App))` and it would read a little better.

As the examples show, `compose` is a function returning a function. That's why we call it a higher order function. In the end we get a component out of it. This wrapping allows us to handle our data connection concern.

We could use a higher order function to annotate our components to give them other special properties as well. We will see the idea again when we implement drag and drop later in this part. Decorators provide a nicer way to attach these types of annotations. The *Understanding Decorators* appendix delves deeper into the topic.

Now that we have a basic understanding of how `connect` should work, we can implement it.

### Setting Up `connect`

In order to save some effort, I'll be using a package known as [connect-alt](https://www.npmjs.com/package/connect-alt) and then model `connect` through it. The implementation won't be ideal when it comes to performance as it will watch all the stores. It is enough for this application, however.

It would be possible to optimize the behavior with further effort. That's one reason why having control over `Provider` and `connect` is useful. It allows further customization.

Consider the implementation of a `connect` adapter below and add it to the project. You can see certain familiar ideas there. We need to perform careful checking over the first parameter given it can be either a function or an object containing values. If it is either, then we need to apply *connect-alt*. Otherwise it's enough to attach just actions to the resulting component:

**app/libs/connect.jsx**

```javascript
import React from 'react';
import connect from 'connect-alt';

const connectAdapter = (Component, actions) => {
  return props => <Component {...Object.assign({}, props, actions)} />
};

export default (state, actions) => {
  if(typeof state === 'function' ||
    (typeof state === 'object') &&
    Object.keys(state).length) {
    return target => connect(state)(connectAdapter(target, actions));
  }

  return target => connectAdapter(target, actions);
};
```

In order to see `connect` in action, we could use it to attach some dummy data to `App` and then render it. Adjust it as follows to pass data `test` to `App` and then show it in the user interface:

**app/components/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';
leanpub-start-insert
import connect from '../libs/connect';
leanpub-end-insert

leanpub-start-insert
@connect(() => ({test: 'test'}))
leanpub-end-insert
export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const {notes} = this.state;

    return (
      <div>
leanpub-start-insert
        {this.props.test}
leanpub-end-insert
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

To make the text show up, refresh the browser. In addition to the text, you should see `Uncaught TypeError: Cannot read property 'listen' of undefined` at the console. This is because *connect-alt* expects some store and actions to exist. This is something we can fix next as we implement a store and actions for our application.

### Setting Up a `NoteStore`

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

**app/components/Provider/Provider.dev.jsx**

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

### Setting Up `NoteActions`

XXX

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
