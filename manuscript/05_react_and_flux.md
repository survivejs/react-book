# React and Flux

You can get quite far by keeping everything in components but eventually that will become painful. [Flux application architecture](https://facebook.github.io/flux/docs/overview.html) was designed to help bring clarity to our React applications.

## Introduction to Flux

So far we've been operating solely on View components. Flux brings a couple of new concepts: Actions, Dispatchers and Stores. All of this works as a single loop. You can for instance trigger an Action at some view. This in turn will trigger a Dispatcher which decides which Stores to touch. As Stores get changed the Views listening them will receive new data to show.

This cyclic nature of Flux makes it easy to debug. You simply follow the flow. There is always a single direction to follow. Compared to two-way binding based systems this is refreshingly simple.

In Flux we'll be pushing most of our state within Stores. It is possible that View components will still retain some of it, though, so it's not an either-or proposition. The arrangement allows you to push concerns such as API communication, caching, i18n and such outside of your Views. For instance an Action could trigger an API query and then cause Stores to be updated based on the result.

Implementing Flux architecture in your application will actually increase the amount of code somewhat. It is important to understand minimizing the amount of code written isn't the goal of Flux. It has been designed to allow productivity across larger teams. You could say explicit is better than implicit.

There is a massive amount of Flux implementations available. [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison) provides a nice comparison between some of the more popular ones.

## Alt

![Alt](images/alt.png)

In this chapter we'll be using one of the current top dogs, a library known as [Alt](http://alt.js.org/). It is a flexible, full-featured implementation that has been designed isomorphic rendering in mind.

In Alt you'll deal in terms of Actions and Stores. Alt provides `waitFor` just like Facebook's architecture for synchronizing Stores. There are also special features such as snapshots and bootstrapping for saving and restoring application state.

## Porting Notes Application to Alt

To get started hit

> npm i alt --save

to add the dependency we need to our project. A good first step is setting up an instance of Alt. This instance will keep the application running. Our Actions and Stores will depend on it. Set it up as follows:

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

If we wanted to be verbose, the following would be equivalent:

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

The verbose form would come in handy if we wanted to communicate with a backend for instance. We would trigger our queries here and then `dispatch` based on the result. We could even define a Store for dealing with possible errors and related logging. As you can see this is a good extension point for ideas like these.

Having a nice set of Actions doesn't take us far. We'll trigger them from our View. We're missing one crucial bit, though. We are going to need a Store which will contain our Note state. We also need to connect this Store with our View so that the cycle is complete.

### Defining Store for Notes

The main purpose of a Store is to deal with data related concerns. In this case it will maintain the state of Notes and alter it based on operations we apply on it. We will connect it with the actions we defined above using `bindActions` shortcut.

It maps each Action to a method by name. We trigger appropriate logic at each method then. Finally we connect the Store with Alt using `alt.createStore`. The implementation below goes deeper into the logic.

**app/stores/NoteStore.js**

```javascript
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';
import findIndex from '../libs/find_index';

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
    const targetId = findIndex(notes, 'id', note.id);

    notes[targetId].task = note.task;

    this.setState({notes});
  }
  delete(id) {
    const notes = this.notes;
    const targetId = findIndex(notes, 'id', id);

    this.setState({
      notes: notes.slice(0, targetId).concat(notes.slice(targetId + 1))
    });
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
```

Note that in this case `this.notes` refers to the internal state of the store. Whenever we hit `setState`, we modify it and pass the to possible listeners in the process. This is how we can pass the state back to View components completing the cycle.

T> It would be possible to operate directly on data. E.g. a oneliner such as `this.notes.splice(targetId, 1)` would work for `delete`. Even though this works it is recommended that you use `setState` with Alt to keep things clean and easy to understand.

Note that assigning an id (`NoteStore` in this case) to a store isn't absolutely required. It is a good practice, however, as it protects the code against minification and possible id collisions. These ids become important when we persist the data.

We have almost integrated Flux to our application. Now we have a set of Actions that provide an API for manipulating `Notes` data. We also have a Store for actual data manipulation. We are missing one final bit - integration with our View. It will have to listen to the Store and be able to trigger Actions. Before that it's a good idea to discuss the concept of ids in more detail.

T> The current implementation is naive in that it doesn't validate parameters in any way. It would be a very good idea to validate the object shape to avoid incidents during development. [Flow](http://flowtype.org/) based gradual typing provides one way to do this.

### Gluing It All Together

Gluing this all together is a little complicated as there are multiple concerns to take care of. Dealing with Actions is going to be easy. For instance to create a Note, we would need to trigger `NoteActions.create({id: id, task: 'New task'})`. This would cause the associated Store to change according to the logic. Because Store changes so do all the components listening to it.

There are multiple ways to connect the Store to our View. Our `NoteStore` provides two methods in particular that are going to be useful. These are `NoteStore.listen` and `NoteStore.unlisten`. They will allow us to keep track of the state and synchronize it with out components.

As you might remember from earlier chapters React provides a set of lifecycle hooks. We can connect `NoteStore` with our View using `listen/unlisten` at `componentDidMount` and `componentWillUnmount`. Doing it this way makes sure we don't have weird references hanging around if/when components get created and removed.

Performing all of the needed changes piecewise wouldn't be nice I have included whole `App` View below. Take note how we use `NoteActions` and `NoteStore` in particular. As we alter `NoteStore`, this leads to a cascade that causes our `App` state update through `setState`. This in turn will trigger component `render`.

I have included a complete version of `App` below as this is going to require multiple changes as described above.

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

As you can see, we pushed the logic out of `App`. We actually have more code now than before but that's okay. `App` is a little neater now and it's going to be easier to develop as we'll see soon.

### Dispatching in Alt

Even though you can get far without ever using Flux dispatcher, it can be useful to know something about it. Alt provides two ways to use it. If you want to log everything that goes through your `alt` instance, you can use a snippet such as `alt.dispatcher.register(console.log.bind(console))`.

You can use the same mechanism on Store level. In that case you would trigger `this.dispatcher.register(...)` at constructor. These mechanisms allow you to implement effective logging to your system.

## What's the Point?

Even though integrating Alt took a lot of effort, it was not all in vain. Consider the following questions:

1. Let's say we wanted to persist the Notes within `localStorage`, where would you implement that? It would be natural to plug that into our `NoteStore`. Alternatively we could do something more generic as we'll be doing next.
2. What if we had multiple components relying on the data? We would just consume `NoteStore` and display it however we want.
3. What if we had multiple, separate Note lists for different type of tasks? We could set up another Store for tracking these lists. That Store could refer to actual Notes by id. We'll do something like this in the next chapter as we generalize the approach.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code, it is easier to reason about. Given we are dealing with unidirectional flow we have something that is simple to debug and test.

## Implementing Persistency over `localStorage`

Given it's not nice to lose your Notes after a refresh, we can tweak our implementation of `NoteStore` to persist the data on change. One way to achieve this is to use [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage). It is a well supported feature that allows you to persist data at browser.

It has a sibling known as `sessionStorage`. `sessionStorage` loses its data when browser is closed, `localStorage` doesn't.

They both share [the same API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) as discussed below:

* `storage.getItem(k)` - Returns stored string
* `storage.removeItem(k)` - Removes data matching to key
* `storage.setItem(k, v)` - Stores given value using given key
* `storage.clear()` - Empties storage contents

Note that it is convenient to operate on the API using your browser developer tools. For instance in Chrome you can see the state of the storages through the *Resources* tab. *Console* tab allows you to perform direct operations on the data. You can even use `storage.key` and `storage.key = 'value'` shorthands for quick modifications.

`localStorage` and `sessionStorage` can use up to 10 MB of data combined. Even though they are well supported there are certain corner cases that may yield interesting failures. These include running out of memory at Internet Explorer (fails silently) and failing altogether at Safari private mode. It is possible to work around these glitches, though.

T> You can support Safari private mode by trying to write into `localStorage` first. If that fails, you can use in-memory store instead or just let the user know about the situation. See [Stack Overflow](https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an) for details.

To keep things simple and manageable we can implement a little wrapper for `storage`. It will wrap all of these complexities. Given the API operates over strings and it is convenient to store objects we'll deal with serialization here using `JSON.parse` and `JSON.stringify`.

In a more serious case it could be a good idea to use a library such as [localStorage](https://github.com/mozilla/localForage) to hide all the complexity for you. You could even integrate it behind this little interface of ours. All we need are just `storage.get(k)` and `storage.set(k, v)` as seen in the implementation below:

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

If you have used languages such as Java or Python before you might be familiar with the concept of decorators. They are syntactical sugar that allow us to wrap classes and functions. In short they provide us a way to annotate and push logic elsewhere while keeping our components simple to read.

There is a [Stage 1 decorator proposal](https://github.com/wycats/javascript-decorators) for JavaScript. We'll be using that. By definition a decorator is simply a function that returns a function. For instance invocation of our `connect` decorator could look like `connect(NoteStore)(App)` without using the decorator syntax (`@connect(NoteStore)`).

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

We can build new decorators for various functionalities, such as undo, in this manner. Every time we feel like logic is starting to creep into our components, it can be a good idea to stop for a while and see if a decorator could be extracted.

Decorators provide a nice way to slice logic out of our components while increasing maintainability of our projects. Even better well designed decorators can be usable across projects.

## Using `AltContainer` Instead of a Decorator

Even though our `@connect` is kind of cool, we can use something special Alt provides just for this purpose. It provides [AltContainer](http://alt.js.org/docs/components/altContainer/) wrapper that does the same thing and a bit more. It provides a greater degree of customizability than our own solution and it's officially supported by Alt protecting us from possible API changes.

You will see the wrapper pattern later again in this book and you will learn to implement it yourself. It is a powerful pattern and you see it quite often in React code. In this case it will allow us to set up arbitrary connections to multiple stores while having control over how to inject them to the contained components. Particularly this fact will become important as we grow the application.

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

Integrating `AltContainer` actually grew our component a little bit. It also tied this component to Alt. If you wanted something forward-looking, you could consider pushing it into component of your own. That facade would hide Alt effectively and allow you to replace it with something else later on. React allows patterns such as this easily. An alternative would have been to develop `@connect` further but to keep things simple I'll be relying on `AltContainer` from now on.

## Conclusion

In this chapter you saw how to port our simple application to use Flux architecture. In the process we learned about basic concepts of Flux. We also learned to extract logic into decorators. Now we are ready to start adding more functionality to our application with less frustration.
