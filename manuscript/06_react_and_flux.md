# React and Flux

[Flux application architecture](https://facebook.github.io/flux/docs/overview.html) helps to bring clarity to our React applications. You can get quite far by keeping everything in components but eventually that will become painful. Flux provides one way out of this.

In this chapter we will be using [Alt](http://alt.js.org/), a light Flux implementation. It gets rid of a lot of baggage provided with Flux and allows you to focus on the essential. It was chosen because it's versatile enough and has a strong community behind it. At the time of writing it was the most popular implementation based on npm download statistics.

There are dozens of other Flux implementations out there. [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison) is a good starting point if you are interested in alternatives.

T> For debugging purposes you might want to pick up [alt-devtool](https://github.com/goatslacker/alt-devtool), a Chrome plugin. It won't be absolutely necessary but it might come in handy.

## Introduction to Flux

So far we have all of state within our components. It will become complicated to manage as we grow our application. Flux allows us to push some of it outside into **Stores**. After that we don't need to care *how* the state is derived. It could be fetched from a backend or it could come from *localStorage*. On component **View** level we don't need to care.

Stores may be modified through **Actions**. In our Notes application we could define a set of basic operations such as `create`, `update` and `remove`. We would then trigger these Actions at our View. This in turn would cause Store to change which in turn would cause our components to update.

As you can see it's a cyclic system. This makes Flux easy to reason about and to visualize. The original architecture contains one extra component, **Dispatcher**, but we will skip it in this case as in practice you can get far by keeping it implicit. It is a part that would sit between Actions and Stores. Dispatchers would allow more fine-grained control over which Stores an Action would trigger.

## Relay - an Alternative?

Flux isn't without its problems. Facebook's [Relay architecture](https://gist.github.com/wincent/598fa75e22bdfa44cf47) aims to solve some of those. Most importantly Relay allows you to push component data requirements to component level. It then composes queries based on this information.

This means Relay would fit particularly well cases where you need to deal with asynchronous data fetching from server. In case you are using Flux this can become quite complicated. Relay uses a specific query language known as **GraphQL** to abstract this. You will need a backend compatible with it. It will likely be possible to build adapters on top of RESTful APIs to provide support for GraphQL.

At least in the time of writing no open source Relay/GraphQL implementation exists. For now it's a good idea to learn Flux as it will greatly simplify React development.

## Porting Notes Application to Alt

![Alt](images/alt.png)

Alt is an implementation of Flux that doesn't get into your way. The implementation supports isomorphic rendering out of the box and supports interesting features such as snapshots. We can take a snapshot of our application and restore its state back to where it was. To get started `npm i alt --save` to add the dependency we need to our project.

### Defining Actions

As discussed earlier, we'll need a set of actions to operate on our data. In terms of Alt it would look like this:

**app/actions/NoteActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('create', 'update', 'remove');
```

### Defining Store

Next we will need to define a Store that maintains the data based on these actions:

**app/stores/NoteStore.js**

```javascript
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task}),
    });
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({notes});
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
}

export default alt.createStore(NoteStore);
```

`bindActions` is a shortcut that allows us to map Action handlers automatically based on name. We need to use a factory in order to pass Actions to Store.

The Store listens to our actions and then updates its state accordingly. The functions have been adapted based on our earlier implementation of `App`.

T> It would be possible to operate directly on data. Ie. a oneliner such as `this.notes.splice(id, 1)` would work for `remove`. Even though this works it is recommended that you use `setState` with Alt to keep things clear.

### Maintaining an Instance of Alt

We will also need a module to maintain an instance of Alt. It will deal with coordination of our Actions and Stores.

**app/libs/alt.js**

```javascript
import Alt from 'alt';
export default new Alt();
```

### Gluing It All Together

Finally we'll need to tweak our `App` to operate based on `NoteStore` and `NoteActions`:

**app/components/App.jsx**

```javascript
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
    var notes = this.state.notes;

    return (
      <div>
        <button onClick={() => this.addItem()}>+</button>
        <Notes items={notes} onEdit={this.itemEdited.bind(this)} />
      </div>
    );
  }
  addItem() {
    NoteActions.create('New task');
  }
  itemEdited(id, task) {
    if(task) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.remove(id);
    }
  }
}
```

As you can see, we pushed the logic out of our application. We actually have more code now than before. On the plus side we managed to tidy up our `App` a little bit.

## On Component Design

Note that given we are using Flux now and have concepts of Actions and Stores, we can push logic lower in the hierarchy if we want to; i.e. in case of `Notes` we could trigger the actions we want there. This depends on what sort of coupling we want to create between components.

One alternative would be to factor `Notes` like this:

```javascript
<Notes
  items={notes}
  item={(note, i) => <span onClick={...}>{item.task}</span>} />
```

Now we give the consumer absolute control over how list items are rendered. This approach is more generic than our `onEdit` property and allows you to customize components significantly more.

More specific components can be developed on top of generic ones. You could have a set of generic components you use from project to project and share as libraries. These would be then wrapped by more specific ones based on need.

## What's the Point?

Fortunately the effort was not all in vain. Consider the following questions:

1. Let's say we wanted to persist the Notes within `localStorage`, where would you implement that? It would be natural to plug that into our `NoteStore`.
2. What if we had multiple components relying on the data? We would just consume `NoteStore` and display it however we want.
3. What if we had multiple, separate Note lists for different type of tasks? We would set up multiple instances of `NoteStore`. If we wanted to move items between lists, we would already have ready-made Actions for that purpose.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code it is easier to reason about. Given we are dealing with unidirectional flow we have something that is simple to debug and test.

## Implementing Persistency over `localStorage`

Given it's not nice to lose your Notes during a refresh, we can tweak our implementation of `NoteStore` to persist the data on change. Most of the work is related to `localStorage`. In order to deal with it, here's a little wrapper:

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

As `localStorage` deals with strings by default we'll need to serialize and deserialize data. That brings some overhead to the implementation. A smarter implementation would abstract storage and provide some form of caching to avoid `JSON.parse` always.

In addition it would take `localStorage` size limits in count. Most browsers raise an exception if you try to write even though there is no space left. Internet Explorer can fail silently and you will have to treat that case separately by inspecting a property containing remaining space.

Besides this little utility we'll need to adapt our application to use it.

**app/components/App.jsx**

```javascript
...
import storage from '../libs/storage';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.storeChanged = this.storeChanged.bind(this);

    NoteActions.init(storage.get('notes'));
    this.state = NoteStore.getState();
  }
  ...
  storeChanged(state) {
    storage.set('notes', state);

    this.setState(NoteStore.getState());
  }
  ...
}
```

The idea is that when the application is initialized, we'll read `localStorage` and initialize Store state using it. If the Store gets changed, we'll write the changes to `localStorage`. For this to work we'll need to tweak Actions and Store slightly.

As we'll be relying on `lodash` for certain utilities here, hit `npm lodash --save` to add it to the project.

**app/actions/NoteActions.js**

```javascript
import alt from '../libs/alt';

export default alt.generateActions('init', 'create', 'update', 'remove');
```

**app/stores/NoteStore.js**

```javascript
import _ from 'lodash';
...

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);
  }
  init(data) {
    var d = _.isArray(_.get(data, 'notes')) ? data : {notes: []};

    this.setState(d);
  }
  ...
}
```

Now we have an application that can restore its state based on `localStorage`. It would be fairly simple to replace the backend with something else. We would just need to implement the storage interface again.

In the current solution persistency logic is coupled with `App`. Given it would be nice to reuse it elsewhere, we can extract it to a higher order component. Let's do that next.

## Extracting Higher Order Components

There are a couple of places in `App` we would like to clean up. The code is simply getting confusing. We can separate some of that into higher order components (HOCs).

A higher order component is a React component which can be used to wrap another component and apply some behavior to it. It is easier to understand how they work through a couple of examples.

### Pushing Persistency to a HOC

Persistency can be pushed to a HOC like this:

**app/components/App.jsx**

```javascript
...
import persist from '../decorators/persist';
import storage from '../libs/storage';

const noteStorageName = 'notes';

class App extends React.Component {
  constructor(props) {
    super(props);

    NoteActions.init(storage.get(noteStorageName));

    this.state = NoteStore.getState();
  }
  ...
  storeChanged() {
    this.setState(NoteStore.getState());
  }
  ...
}

export default persist(App, storage, noteStorageName, () => NoteStore.getState());
```

**app/decorators/persist.js**

```javascript
import React from 'react';

export default (Component, storage, storageName, getData) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      window.addEventListener('beforeunload', function() {
        // escape hatch for debugging
        if(!storage.get('debug')) {
          storage.set(storageName, getData());
        }
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
```

As you can see it is a component that triggers the decorator and renders the component we pass to it. We have more code than earlier but we have factored it better. If you want to persist some other component, it is simple now.

Given it can be useful to be able to disable the behavior temporarily, I built an escape hatch. In case you hit `localStorage.setItem('debug', true)` at browser console, the behavior gets disabled. Set it back to `false` in order to enable it again. If you want to clear whole `localStorage` for some reason, you can just hit `localStorage.clear()`.

T> The implementation of `persist` could be pushed further using `alt.takeSnapshot` and `alt.bootstrap` functions. That would allow us to implement a generic version for the whole application should we want to.

W> Our `persist` implementation isn't without its flaws. It is easy to end up in a situation where `localStorage` contains invalid data due to changes made to the data model. This brings you to the world of database schemas and migrations. There are no easy solutions. Regardless this is something to keep in mind when developing something more sophisticated. The lesson here is that the more you inject state to your application, the more complicated it gets.

W> Another to keep in mind is that `beforeunload` doesn't get triggered in case something catastrophic happens (ie. browser crashes). Therefore it could be justified to trigger `storage.set` on each change.

### Pushing Connection to a HOC

We can implement a decorator for connecting a component to a Store as well. Here's a example:

**app/decorators/connect.js**

```javascript
import React from 'react';

export default (Component, store) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.storeChanged = this.storeChanged.bind(this);
      this.state = store.getState();
    }
    componentDidMount() {
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
```

You can connect it with `App` like this:

**app/components/App.jsx**

```javascript
import connect from '../decorators/connect';

...

class App extends React.Component {
  constructor(props: {
    notes: Array;
  }) {
    super(props);
  }
  render() {
    var notes = this.props.notes;

    ...
  }
  ...
}

export default persist(
  connect(App, NoteStore),
  storage,
  noteStorageName,
  () => NoteStore.getState()
);
```

Now the implementation of our `App` is quite clean. We have managed to separate various concerns into separate aspects. We can take the approach further by converting our HOCs into decorators.

## Converting HOCs to Decorators

If you have used languages such as Java or Python before you might be familiar with the concept of decorators. They are syntactical sugar that allow us to wrap classes and functions. They just provide a nicer syntax for HOCs essentially.

There is a [Stage 1 decorator proposal](https://github.com/wycats/javascript-decorators) for JavaScript. We'll be using that. There are a couple of tooling related gotchas we should patch before moving further.

By definition a decorator is simply a function that returns a function. For instance invocation of our `persist` decorator could look like `persist(NoteActions.init, NoteStore, storage, 'notes')(App)` without using the decorator syntax (`@persist(NoteActions.init, ...)`).

### Patching Tools to Work with Decorators

![Flowcheck](images/flowcheck.png)

As we'll be relying on decorators and still like to use Flowcheck, we'll need to tweak configuration a little bit:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel?stage=1',
          include: path.resolve(ROOT_PATH, 'app'),
        }
      ]
    },
    ...
  });
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    ...
    module: {
      ...
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel', 'flowcheck', 'babel?stage=1&blacklist=flow'],
          include: path.resolve(ROOT_PATH, 'app'),
        }
      ]
      ...
    }
    ...
  });
}
```

In effect we're letting Babel process everything except Flow parts before passing the output to Flowcheck. After the check has completed, we'll deal with the rest. This is bit of a hack that will hopefully go away sometime in the future as technology becomes more robust.

T> Another way to deal with Babel configuration would be to define a [.babelrc](https://babeljs.io/docs/usage/babelrc/) file in the project root. It would contain default settings used by Babel. It's the same idea as for ESLint and many other tools.

### Adding Decorator Wrappers

In order to port our HOCs to be able to use decorator syntax, we'll need to tweak our current implementation a little bit.

**app/decorators/connect.js**

```javascript
import React from 'react';

const connect = (Component, store) => {
  ...
}

export default (store) => {
  return (target) => connect(target, store);
};
```

**app/decorators/persist.js**

```javascript
import React from 'react';

const persist = (Component, storage, storageName, getData) => {
  ...
}

export default (storage, storageName, getData) => {
  return (target) => persist(target, storage, storageName, getData);
};
```

As you can see the HOCs have been wrapped within functions that return functions. That's how decorators work by definition.

**app/components/App.jsx**

```javascript
...

@persist(noteStorageName, () => NoteStore.getState())
@connect(NoteStore)
export default class App extends React.Component {
  ...
}
```

Note how much neater our `App` is now. You can clearly see that we want to persist this component and connect it to a certain store.

We can build new decorators for various functionalities, such as undo, in this manner. By slicing our logic into higher order components we get an application that is easier to develop. Best of all decorators such as the one we implemented can be easily reused in some other project.

## Using `AltContainer` Instead of a Decorator

Even though our `@connect` is kind of cool, we can use something special Alt provides just for this purpose. It provides `AltContainer` that does the same thing and a bit more. Consider the example below:

**app/components/App.jsx**

```javascript
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

const noteStorageName = 'notes';

@persist(storage, noteStorageName, () => NoteStore.getState())
export default class App extends React.Component {
  constructor(props) {
    super(props);

    NoteActions.init(storage.get(noteStorageName));
  }
  render() {
    return (
      <div>
        <button onClick={() => this.addItem()}>+</button>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            items: () => NoteStore.getState().notes || []
          }}
        >
          <Notes onEdit={(id, task) => this.itemEdited(id, task)} />
        </AltContainer>
      </div>
    );
  }
  ...
}
```

As you can see an `AltContainer` provides us even more control. It can connect multiple stores at once. We also have control over how their contents are mapped to the props of the components the wrapper contains.

## Conclusion

In this chapter you saw how to port our simple application to use Flux architecture. Initially it might seem like a lot of extra code. Flux isn't about minimizing the amount of code written. It is about making it understandable. Now that we have a clear separation between Actions, Stores and Views, it is much easier to navigate around and see what triggers what behavior.
