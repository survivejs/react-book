# React and Flux

You can get quite far by keeping everything in components but eventually that will become painful. [Flux application architecture](https://facebook.github.io/flux/docs/overview.html) was designed to help bring clarity to our React applications.

Flux will allow us to separate data and application state from our Views. This allows us to keep them clean and keep the application maintainable. Flux was designed large teams in mind. As a result you might find it quite verbose. This comes with great advantages, though, as it can be straight-forward to work with.

## Introduction to Flux

![Flux dataflow](images/flux.png)

So far we've been dealing only with Views. Flux architecture introduces a couple of new concepts to the mix. These are Actions, Dispatcher and Stores. Flux implements a unidirectional flow in contrast to popular frameworks such as Angular. Even though two-direction bindings can be convenient and some things are easier to implement using them, the Flux way of doing things comes with its benefits.

### Dataflow in Flux

Using Flux we'll model data related aspects at Stores. Views may still retain some state but in practice a lot of it will go to Stores. Besides application data they can maintain application state as well (i.e. is something loading). You then consume this data at your View components. Views can trigger Actions that cause Store to change somehow.

You could for instance have an action for creating a new Note. Pressing a button at your View could trigger it. Based on this Dispatcher will trigger relevant Stores. They in turn will update their state somehow (i.e. create a Note) and pass their state forward. As a result Views will know to render themselves with the new data.

### Advantages of Flux

Even though this sounds a little complicated, the arrangement gives our application flexibility. We can for instance implement API communication, caching and i18n outside of our Views. This way they stay clean of logic while keeping the application easier to understand.

Implementing Flux architecture in your application will actually increase the amount of code somewhat. It is important to understand minimizing the amount of code written isn't the goal of Flux. It has been designed to allow productivity across larger teams. You could say explicit is better than implicit.

### Relay?

Facebook's [Relay](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) can be considered an improvement over Flux. It improves especially on data fetching department and allows you to push data requirements to View level. As it still completely new technology we don't be discussing it yet.

### Which Flux Implementation to Use?

The library situation keeps on changing constantly as there is no single right way to interpret the architecture. You will find implementations fitting for different tastes. [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison) provides a nice comparison between some of the more popular ones.

When choosing a library it comes down to your own personal preferences. You will have to consider factors such as API, features, documentation and support. Starting with one of the more popular alternatives can be a good idea. As you begin to understand the architecture you are able to make choices that serve you better.

## Porting to Alt

![Alt](images/alt.png)

In this chapter we'll be using one of the current top dogs, a library known as [Alt](http://alt.js.org/). It is a flexible, full-featured implementation that has been designed isomorphic rendering in mind.

In Alt you'll deal in terms of Actions and Stores. Dispatcher is hidden but you will still have access to it if needed. There are special features to allow you to save and restore application state. This is handy for implementing persistency and isomorphic rendering.

### Setting Up Alt Instance

Everything in Alt begins from Alt instance. It keeps track of Actions and Stores and keeps communication going on. It is a singleton by default but it's possible to create Alt instances as needed. Alt doesn't force you to any particular design. To get started hit

> npm i alt --save

to add Alt to our project.

To keep things simple we'll be treating Alt as a singleton. This is possible to achieve by pushing it to a module of its own and then referring to that from everywhere. Set it up as follows:

**app/libs/alt.js**

```javascript
import Alt from 'alt';
//import chromeDebug from 'alt/utils/chromeDebug';

const alt = new Alt();
//chromeDebug(alt);

export default alt;
```

T> There is a Chrome plugin known as [alt-devtool](https://github.com/goatslacker/alt-devtool). After installed you can connect Alt with it by uncommenting the lines below. You can use it to debug the state of your stores, search and travel in time.

### Defining CRUD API for Notes

Next we'll need to define a basic API for operating over Note data. To keep this simple, let's CRUD (CReate, Update, Delete) it. These will be the basic Actions we use to operate our Notes. Alt provides a shorthand known as `generateActions`. We can use it like this:

**app/actions/NoteActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'update', 'delete');
```

Alt provides an alternative, verbose syntax for defining Actions. It is handy when you begin to communicating with an external API. Each API query would go here and you would trigger other Actions based on the result. You could then decide what to do with the results.

T> You can even track request state by setting up a custom Store just for that. In that case you would trigger Actions that alter the state of that Store. You could have a component that logs the result or shows it at the user interface based on that.

If we wanted to model Actions using the verbose syntax it would look like this:

```javascript
class NoteActions {
  create({id, task}) {
    this.dispatch({id, task});
  }
  update({id, task}) {
    this.dispatch({id, task});
  }
  delete(id) {
    this.dispatch(id);
  }
}

export default alt.createActions(NoteActions);
```

Having a nice set of Actions is a starting point. As you might remember we still need Stores. And we need to complete the cycle by connecting all of this to a View.

### Defining Store for Notes

The main purpose of a Store is to deal with data and application state related concerns. In this case it will maintain the state of Notes and alter it based on operations we apply on it. We will connect it with the actions we defined above using `bindActions` shortcut.

`bindActions` maps each Action to a method by name. We trigger appropriate logic at each method based on that. Finally we connect the Store with Alt using `alt.createStore`. This will treat our Stores as singleton so it's the same idea as for Alt instance. It is possible to create individual Store instances but singleton works for our case.

The implementation below describes logic that will be sufficient for this application. A lot of it might be familiar from the previous chapter. Here we are lifting that logic out of View level.

To keep the implementation clean we are using `this.setState`, a feature of Alt that allows us to signify that we are going to alter Store state and that it should signal the change to possible listeners.

**app/stores/NoteStore.js**

```javascript
import findIndex from 'find-index';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];
  }
  create(note) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat(note)
    });
  }
  update(note) {
    const notes = this.notes;
    const targetId = findIndex(notes, (o) => o.id === note.id);

    notes[targetId].task = note.task;

    this.setState({notes});
  }
  delete(id) {
    const notes = this.notes;
    const targetId = findIndex(notes, (o) => o.id === id);

    this.setState({
      notes: notes.slice(0, targetId).concat(notes.slice(targetId + 1))
    });
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

T> It would be possible to operate directly on data. E.g. a oneliner such as `this.notes.splice(targetId, 1)` would work for `delete`. Even though this works it is recommended that you use `setState` with Alt to keep things clean and easy to understand.

Note that assigning an id (`NoteStore` in this case) to a store isn't absolutely required. It is a good practice, however, as it protects the code against minification and possible id collisions. These ids become important when we persist the data.

We have almost integrated Flux to our application. Now we have a set of Actions that provide an API for manipulating `Notes` data. We also have a Store for actual data manipulation. We are missing one final bit - integration with our View. It will have to listen to the Store and be able to trigger Actions.

T> The current implementation is naive in that it doesn't validate parameters in any way. It would be a very good idea to validate the object shape to avoid incidents during development. [Flow](http://flowtype.org/) based gradual typing provides one way to do this. Alternatively you could write nice tests. That's a good idea regardless.

### Gluing It All Together

Gluing this all together is a little complicated as there are multiple concerns to take care of. Dealing with Actions is going to be easy. For instance to create a Note, we would need to trigger `NoteActions.create({id: uuid.v4(), task: 'New task'})`. This would cause the associated Store to change according to the logic. Because Store changes so do all the components listening to it.

There are multiple ways to connect the Store to our View. Our `NoteStore` provides two methods in particular that are going to be useful. These are `NoteStore.listen` and `NoteStore.unlisten`. They will allow us to keep track of the state and synchronize it with our components.

As you might remember from the earlier chapters React provides a set of lifecycle hooks. We can connect `NoteStore` with our View using `listen/unlisten` at `componentDidMount` and `componentWillUnmount`. Doing it this way makes sure we don't have weird references hanging around if/when components get created and removed.

Performing all of the needed changes piecewise wouldn't be nice I have included whole `App` View below. Take note how we use `NoteActions` and `NoteStore` in particular. As we alter `NoteStore`, this leads to a cascade that causes our `App` state update through `setState`. This in turn will trigger component `render`.

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.storeChanged = this.storeChanged.bind(this);
    this.state = NoteStore.getState();
  }
  componentDidMount() {
    NoteStore.listen(this.storeChanged);
  }
  componentWillUnmount() {
    NoteStore.unlisten(this.storeChanged);
  }
  storeChanged(state) {
    this.setState(state);
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addItem}>+</button>
        <Notes items={notes} onEdit={this.itemEdited} />
      </div>
    );
  }
  addItem() {
    NoteActions.create({id: uuid.v4(), task: 'New task'});
  }
  itemEdited(id, task) {
    if(task) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.delete(id);
    }
  }
}
```

As you can see, we pushed the logic out of `App`. We actually have more code now than before but that's okay. `App` is a little neater now and it's going to be easier to develop as we'll see soon. Most importantly we have managed to implement Flux architecture for our application. Things can only get better.

### Dispatching in Alt

Even though you can get far without ever using Flux dispatcher, it can be useful to know something about it. Alt provides two ways to use it. If you want to log everything that goes through your `alt` instance, you can use a snippet such as `alt.dispatcher.register(console.log.bind(console))`.

You can use the same mechanism on Store level. In that case you would trigger `this.dispatcher.register(...)` at constructor. These mechanisms allow you to implement effective logging to your system.

### What's the Point?

Even though integrating Alt took a lot of effort, it was not all in vain. Consider the following questions:

1. Let's say we wanted to persist the Notes within `localStorage`, where would you implement that? It would be natural to plug that into our `NoteStore`. Alternatively we could do something more generic as we'll be doing next.
2. What if we had multiple components relying on the data? We would just consume `NoteStore` and display it however we want.
3. What if we had multiple, separate Note lists for different type of tasks? We could set up another Store for tracking these lists. That Store could refer to actual Notes by id. We'll do something like this in the next chapter as we generalize the approach.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code, it is easier to reason about. Given we are dealing with unidirectional flow we have something that is simple to debug and test.

## Implementing Persistency over `localStorage`

Given it's not nice to lose your Notes after a refresh, we can tweak our implementation of `NoteStore` to persist the data on change. One way to achieve this is to use [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage). It is a well supported feature that allows you to persist data at browser.

### Understanding `localStorage`

It has a sibling known as `sessionStorage`. `sessionStorage` loses its data when browser is closed, `localStorage` doesn't.

They both share [the same API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) as discussed below:

* `storage.getItem(k)` - Returns stored string
* `storage.removeItem(k)` - Removes data matching to key
* `storage.setItem(k, v)` - Stores given value using given key
* `storage.clear()` - Empties storage contents

Note that it is convenient to operate on the API using your browser developer tools. For instance in Chrome you can see the state of the storages through the *Resources* tab. *Console* tab allows you to perform direct operations on the data. You can even use `storage.key` and `storage.key = 'value'` shorthands for quick modifications.

`localStorage` and `sessionStorage` can use up to 10 MB of data combined. Even though they are well supported there are certain corner cases that may yield interesting failures. These include running out of memory at Internet Explorer (fails silently) and failing altogether at Safari private mode. It is possible to work around these glitches, though.

T> You can support Safari private mode by trying to write into `localStorage` first. If that fails, you can use in-memory store instead or just let the user know about the situation. See [Stack Overflow](https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an) for details.

### Implementing a Wrapper for `localStorage`

To keep things simple and manageable we can implement a little wrapper for `storage`. It will wrap all of these complexities. Given the API operates over strings and it is convenient to store objects we'll deal with serialization here using `JSON.parse` and `JSON.stringify`.

In a more serious case it could be a good idea to use a library such as [localForage](https://github.com/mozilla/localForage) to hide all the complexity for you. You could even integrate it behind this little interface of ours. All we need are just `storage.get(k)` and `storage.set(k, v)` as seen in the implementation below:

**app/libs/storage.js**

```javascript
export default {
  get: function(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    }
    catch(e) {
      return null;
    }
  },
  set: function(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }
};
```

### Persisting Application Using `FinalStore`

Besides this little utility we'll need to adapt our application to use it. Alt provides handy functionality just for this purpose. We can persist the entire state of our application using `FinalStore`, bootstrapping and snapshotting. `FinalStore` is store that listens to all existing stores. Every time some store changes, `FinalStore` will know about it. This makes it ideal for persistency.

We can take a snapshot of the entire app state and push it to `localStorage` every time `FinalStore` changes. That solves one part of the problem. Bootstrapping solves the remaining part. `alt.bootstrap` allows us to set state of the all stores. In our case we'll fetch the data from `localStorage` and invoke it to populate our stores. This is handy for other cases as well. The data can come from elsewhere through a WebSocket for instance.

T> An alternative way would be to take a snapshot only when the window gets closed. There's a Window level `beforeunload` hook that could be used. The problem with this approach is that it is brittle. What if something unexpected happens and the hook doesn't get triggered for some reason? You'll lose data.

In order to integrate this idea to our application we will need to implement a little module to manage it, take the possible initial data in count at `NoteStore` and finally trigger the new logic at initialization phase.

*app/libs/persist.js*  does the hard part. It will set up a `FinalStore`, deal with bootstrapping (restore data) and listening the store for snapshotting (save data). I have included an escape hatch in form of `debug` flag. If it is set, the data won't get saved to `localStorage`. The reasoning is that now you can set the flag (`localStorage.setItem('debug', 'true')`), hit `localStorage.clear()` and refresh the browser to get a clean slate. The implementation below illustrates these ideas:

**app/libs/persist.js**

```javascript
import makeFinalStore from 'alt/utils/makeFinalStore';

export default function(alt, storage, storeName) {
  const finalStore = makeFinalStore(alt);

  alt.bootstrap(storage.get(storeName));

  finalStore.listen(() => {
    if(!storage.get('debug')) {
      storage.set(storeName, alt.takeSnapshot());
    }
  });
}
```

In order to make our `NoteStore` aware of possibly existing data, we'll need to tweak our constructor to take it in count. The data might not exist already, though, so we'll still need a default.

**app/stores/NoteStore.js**

```javascript
...

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = this.notes || [];
  }
  ...
}

export default alt.createStore(NoteStore, 'NoteStore');
```

Finally we need to trigger persistency logic at initialization. We will need to pass relevant data to it (Alt instance, storage, storage name) and off we go.

**app/main.jsx**

```javascript
...
import alt from './libs/alt';
import storage from './libs/storage';
import persist from './libs/persist';

main();

function main() {
  persist(alt, storage, 'app');

  ...
}
```

If you try refreshing the browser now, the application should retain its state. More interestingly the solution should scale with minimal effort if we add more stores to the system. Integrating a real backend wouldn't be a problem. There are hooks in place for that now.

You could for instance pass the initial payload as a part of your HTML (isomorphic rendering), load it up and then persist the data to the backend. You have a great deal of control over how to do this and you can use `localStorage` as a backup if you want.

W> Our `persist` implementation isn't without its flaws. It is easy to end up in a situation where `localStorage` contains invalid data due to changes made to the data model. This brings you to the world of database schemas and migrations. There are no easy solutions. Regardless this is something to keep in mind when developing something more sophisticated. The lesson here is that the more you inject state to your application, the more complicated it gets.

## Extracting Connection Decorator

Even though the application is starting to look a little better now, there's still work to be done. For instance `App` contains plenty of store connection related logic. This isn't nice. We should extract that so it's easier to manage.

### Decorators - What Are They?

If you have used languages such as Java or Python before you might be familiar with the concept of decorators. They are syntactical sugar that allow us to wrap classes and functions. In short they provide us a way to annotate and push logic elsewhere while keeping our components simple to read.

There is a [Stage 1 decorator proposal](https://github.com/wycats/javascript-decorators) for JavaScript. We'll be using that. By definition a decorator is simply a function that returns a function. For instance invocation of our `connect` decorator could look like `connect(NoteStore)(App)` without using the decorator syntax (`@connect(NoteStore)`).

### Implementing `@connect`

`@connect` will wrap our component in another component that in turn will deal with the connection logic (`listen/unlisten/setState`). It will maintain the store state internally and then pass it to the child component we are wrapping. During this process it will pass the state through props. The implementation below illustrates the idea:

**app/decorators/connect.js**

```javascript
import React from 'react';

const connect = (Component, store) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.storeChanged = this.storeChanged.bind(this);
      this.state = store.getState();

      store.listen(this.storeChanged);
    }
    componentWillUnmount() {
      store.unlisten(this.storeChanged);
    }
    storeChanged() {
      this.setState(store.getState());
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};

export default (store) => {
  return (target) => connect(target, store);
};
```

You can connect it with `App` like this:

**app/components/App.jsx**

```javascript
...
import connect from '../decorators/connect';

...

@connect(NoteStore)
export default class App extends React.Component {
  render() {
    const notes = this.props.notes;

    ...
  }
  ...
}
```

Note how much code this simple decorator removes from our `App`. If we wanted to add more stores to the system and connect them to components, it would be trivial now. Even better we could connect multiple stores to a single component easily.

### Decorator Ideas

We can build new decorators for various functionalities, such as undo, in this manner. Every time we feel like logic is starting to creep into our components, it can be a good idea to stop for a while and see if a decorator could be extracted.

Decorators provide a nice way to slice logic out of our components while increasing maintainability of our projects. Even better well designed decorators can be usable across projects.

### Alt's `@connectToStores`

Alt provides a similar decorator known as `@connectToStores`. It relies on static methods. This a ES6 feature and you might be familiar with it from other languages. Rather than normal methods that are bound to a specific instance these are bound on class level. This means you can call them through the class itself (i.e. `App.getStores()`). The example below shows how we might integrate `@connectToStores` into our application.

```javascript
...
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
export default class App extends React.Component {
  static getStores(props) {
    return [NoteStore];
  }
  static getPropsFromStores(props) {
    return NoteStore.getState();
  }
  ...
}
```

This more verbose approach is roughly equivalent to our implementation. It actually does more as it allows you to connect to multiple stores at once. It also provides more control over the way you can shape store state to props.

In order to get familiar with more approaches we'll be using `AltContainer` in this project instead. That said using the decorator is completely acceptable as well and it comes down to your personal preferences.

## Using `AltContainer` Instead of a Decorator

[AltContainer](http://alt.js.org/docs/components/altContainer/) wrapper that does the same thing and a bit more. It provides a greater degree of customizability than our own solution and it's officially supported by Alt protecting us from possible API changes.

You will see the wrapper pattern later again in this book and you will learn to implement it yourself. In this case the pattern it will allow us to set up arbitrary connections to multiple stores while having control over how to inject them to the contained components. Particularly this fact will become important as we grow the application.

The implementation below illustrates how to bind it all together. We'll drop `@connect` from the project altogether and expand `render()` to use `AltContainer`. After these changes we are good to go.

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.addItem}>+</button>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => NoteStore.getState().notes
          } }
        >
          <Notes onEdit={this.itemEdited} />
        </AltContainer>
      </div>
    );
  }
  ...
}
```

Integrating `AltContainer` actually grew our component a little bit. It also tied this component to Alt. If you wanted something forward-looking, you could consider pushing it into component of your own. That facade would hide Alt effectively and allow you to replace it with something else later on.

## Conclusion

In this chapter you saw how to port our simple application to use Flux architecture. In the process we learned about basic concepts of Flux. We also learned to extract logic into decorators. Now we are ready to start adding more functionality to our application with less frustration.
