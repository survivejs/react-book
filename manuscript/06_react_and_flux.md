# React and Flux

[Flux application architecture](https://facebook.github.io/flux/docs/overview.html) helps to bring clarity to our React applications. You can get quite far by keeping everything in components but eventually that will become painful. Flux provides one way out of this.

In this chapter we will be using [Alt](http://alt.js.org/), a light Flux implementation. It gets rid of a lot of baggage provided with Flux and allows you to focus on the essential.

## Introduction to Flux

Flux allows us to push the state our components depend upon outside of them into **Stores**. After that we don't need to care *how* the state is derived. It could be fetched from a backend or it could come from *localStorage*. On component **View** level we don't need to care.

Stores may be modified through **Actions**. In our Notes application we could define a set of basic operations such as `create`, `update` and `remove`. We would then trigger these Actions at our View. This in turn would cause Store to change which in turn would cause our components to update.

As you can see it's a cyclic system. This makes Flux easy to reason about and to visualize. The original architecture contains one extra component, **Dispatcher**, but we will skip it in this case as in practice you can get far by keeping it implicit. It is a part that would sit between Actions and Stores. Dispatchers would allow more fine-grained control over which Stores an Action would trigger.

## Relay - an Alternative?

Flux isn't without its problems. Facebook's [Relay architecture](https://gist.github.com/wincent/598fa75e22bdfa44cf47) aims to solve some of those. Most importantly Relay allows you to push component data requirements to component level. It then composes queries based on this information.

This means you would require a **GraphQL** compatible server. GraphGL is a custom query language developed for this purpose. It is possible this will hinder its adoption. We might see some implementations that try to bridge Flux with this particular idea. Time will tell.

At least in the time of writing no open source Relay/GraphQL implementation exists. For now it's a good idea to learn Flux as it will greatly simplify React development.

## Porting Notes Application to Alt

Before delving into the implementation itself, `npm i alt --save` to get the dependency we need. As discussed earlier, we'll need a set of actions to operate on our data. In terms of Alt it would look like this:

**app/actions/NoteActions.js**

```javascript
'use strict';
import alt from '../libs/alt';

class NoteActions {
  create(task) {
    this.dispatch(task);
  }
  update(id, task) {
    this.dispatch({id, task});
  }
  remove(id) {
    this.dispatch(id);
  }
}

export default alt.createActions(NoteActions);
```

Next we will need to define a Store that maintains the data based on these actions:

**app/stores/NoteStore.js**

```javascript
'use strict';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);
  }
  create(task) {
    this.notes.push({task});
  }
  update({id, task}) {
    this.notes[id].task = task;
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1))
    });
  }
}

export default alt.createStore(NoteStore, 'NoteStore');

```

`bindActions` is a shortcut that allows us to map Action handlers automatically based on name. We need to use a factory in order to pass Actions to Store.

The Store listens to our actions and then updates its state accordingly. The functions have been adapted based on our earlier implementation of `App`.

We will also need a module to maintain an instance of Alt. It will deal with coordination of our Actions and Stores.

**app/libs/alt.js**

```javascript
'use strict';
import Alt from 'alt';
export default new Alt();
```

Finally we'll need to tweak our `App` to operate based on `NoteStore` and `NoteActions`:

**app/components/App.jsx**

```javascript
'use strict';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = NoteStore.getState();
  }
  componentDidMount() {
    NoteStore.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    NoteStore.unlisten(this.storeChanged.bind(this));
  }
  storeChanged() {
    this.setState(NoteStore.getState());
  }
  render() {
    var notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>
        <Notes items={notes} onEdit={this.itemEdited.bind(this)} />
      </div>
    );
  }
  addItem() {
    NoteActions.create('New task');
  }
  itemEdited(id, task) {
    if(task) {
      NoteActions.update(id, task);
    }
    else {
      NoteActions.remove(id);
    }
  }
}
```

As you can see, we pushed the logic out of our application. We actually have more code now than before. On the plus side we managed to tidy up our `App` considerably.

## On Component Design

Note that given we are using Flux now and have concepts of Actions and Stores, we can push logic lower in the hierarchy if we want to. Ie. in case of `Notes` we could trigger the actions we want there. This depends on what sort of coupling we want to create between components.

One alternative would be to factor `Notes` like this:

```javascript
<Notes
  items={notes}
  item={(note, i) => <span onClick={...}>{item.task}</span>}
/>
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
'use strict';

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

    NoteActions.init(storage.get('notes'));
    this.state = NoteStore.getState();
  }
  ...
  storeChanged(d) {
    storage.set('notes', d);

    this.setState(NoteStore.getState());
  }
  ...
}
```

The idea is that when the application is initialized, we'll read `localStorage` and initialize Store state using it. If the Store gets changed, we'll write the changes to `localStorage`. For this to work we'll need to tweak Actions and Store slightly.

**app/actions/NoteActions.js**

```javascript
class NoteActions {
  init(notes) {
    this.dispatch(notes);
  }
  ...
}
```

**app/stores/NoteStore.js**

```javascript
class NoteStore {
  constructor() {
    this.bindActions(NoteActions);
  }
  init(data) {
    this.setState(data || {notes: []});
  }
  ...
}
```

Now we have an application that can restore its state based on `localStorage`. It would be fairly simple to replace the backend with something else. We would just need to implement the storage interface again.

In the current solution persistency logic is coupled with `App`. Given it would be nice to reuse it elsewhere, we can extract it to a higher order component. Let's do that next.

## Extracting Higher Order Components

There are a couple of places in `App` we would like to clean up. I've adjusted the code as follows:

**app/components/App.jsx**

```javascript
...
import persist from '../decorators/persist';
import storage from '../libs/storage';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = NoteStore.getState();
  }
  ...
  storeChanged() {
    this.setState(NoteStore.getState());
  }
  ...
}

export default persist(App, NoteActions.init, NoteStore, storage, 'notes');
```

Now we are close to what we had there earlier. Only new bit is that `persist` thinger. Let's look at its implementation next:

**app/decorators/persist.js**

```javascript
'use strict';
import React from 'react';

export default (Component, initAction, store, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      initAction(storage.get(storageName));

      window.addEventListener('beforeunload', function(e){
        storage.set(storageName, store.getState());
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
```

As you can see it is a component that triggers the decorator and renders the component we pass to it. We have more code than earlier but we have factored it better. If you want to persist some other component, it is simple now.

We can implement a decorator for connecting a component with a Store as well. Here's an example:

**app/decorators/connect.js**

```javascript
'use strict';
import React from 'react';

export default (Component, store) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.state = store.getState();
    }
    componentDidMount() {
      store.listen(this.storeChanged.bind(this));
    }
    componentWillUnmount() {
      store.unlisten(this.storeChanged.bind(this));
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
  NoteActions.init,
  NoteStore,
  storage,
  'notes'
);
```

Now the implementation of our `App` is quite clean. We have managed to separate various concerns into separate aspects.

We can build new decorators for various functionalities, such as undo, in this manner. By slicing our logic into higher order components we get an application that is easier to develop. Best of all decorators such as the one we implemented can be easily reused in some other project.

## Conclusion

In this chapter you saw how to port our simple application to use Flux architecture. Initially it might seem like a lot of extra code. Flux isn't about minimizing the amount of code written. It is about making it understandable. Now that we have a clear separation between Actions, Stores and Views, it is much easier to navigate around and see what triggers what behavior.

Next we will expand our application into a Kanban board. In the process you will learn something about functional lenses and a library known as baobab.
