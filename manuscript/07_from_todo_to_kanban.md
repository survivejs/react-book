# From Todo to Kanban

![Kanban board](images/kanban.png)

So far our Todo Application is very simplistic. We can manipulate the Todo items. There is also basic level of persistency. We are still missing some vital functionality that is needed to turn it this into a proper Kanban table (see image above).

Most importantly we'll need to model the concept of lane. The current `App` is pretty much equal of a list contained by a lane. Besides a list of items a lane contains a name. If we model these requirements as a data structure, we'll end up with something like this:

```javascript
{
  lanes: [
    {
      name: 'Todo',
      todos: [
        {
          task: 'Learn Webpack'
        },
        {
          task: 'Do laundry'
        }
      ]
    },
    {
      name: 'Doing',
      todos: [
        {
          task: 'Learn React'
        }
      ]
    },
    {
      name: 'Done',
      todos: []
    }
  ]
}
```

The question is how do we map this structure to our React app. [baobab](https://github.com/Yomguithereal/baobab) is a JavaScript data tree library that supports cursors. We can use it to provide our components views to the data they need. All components will operate on the same structure but on a degree we define.

## Building a Baobab Tree

Before getting started, hit `npm i baobab --save`. You can also remove `alt` dependency from the project by editing *package.json*. Next we'll need to plant our tree to the project:

**app/components/App.jsx**

```javascript
...
'use strict';
import React from 'react';
import Baobab from 'baobab';
import Lane from './Lane';
import connect from '../decorators/connect';
import storage from '../storage';
import appActions from '../actions/AppActions';

const appStorage = 'app';
const tree = new Baobab(storage.get(appStorage) || {
  // {name: <str>, todos: [{task: <str>}]}
  lanes: []
});
const cursor = tree.root();

window.addEventListener('beforeunload', function() {
  storage.set(appStorage, cursor.get());
}, false);

class App extends React.Component {
  constructor(props: {
    lanes: Array;
  }) {
    super(props);

    this.actions = appActions(cursor);
  }
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.actions.createLane.bind(null, 'New lane')}>
            Add lane
          </button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) =>
            <Lane key={'lane' + i} cursor={cursor.select('lanes', i)} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(App, cursor);
```

TODO

## Reorganizing Project

We should make room for the new functionality. Let's start by defining `App.jsx`. It will go between `main.jsx` and `TodoList.jsx`. The latter is simply `TodoApp.jsx` renamed. Here's what the files look like after these changes:

**app/main.jsx**

```javascript
'use strict';
import './main.css';

import React from 'react';
import App from './App';

main();

function main() {
    React.render(<App />, document.getElementById('app'));
}
```

**app/components/App.jsx**

```javascript
'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <TodoList />
      </div>
    );
  }
}
```

**app/components/TodoList.jsx**

```javascript
...
class TodoList extends React.Component {
...
}

export default persist(TodoList, TodoActions.init, TodoStore, storage, 'todos');
```

Next we can start growing lanes and the stores we need to make this work.

## Growing Lanes

On App level you might want to end up with something like this:

**app/components/App.jsx**

```javascript
'use strict';
import React from 'react';
import Lane from './Lane';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      lanes: [...]
    };
  }
  render() {
    var lanes = this.state.lanes;

    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.addLane.bind(this)}>Add lane</button>
        </div>
        <div className='lanes'>
          {lanes.map((lane, i) =>
            <Lane key={'lane' + i} {...lane} />
          )}
        </div>
      </div>
    );
  }
  addLane() {
    this.setState({
      lanes: this.state.lanes.concat({
        name: 'New lane',
        todos: []
      })
    });
  }
}
```

We'll separate general controls and lanes into divs of their own. To make them easier to style we'll give them classes. Note that in React you'll want to operate using DOM attribute names used in JavaScript. Just using `class` here won't work. Alternatively we could pass style to the elements directly via React.

A rough implementation for Lane could look like this:

**app/components/Lane.jsx**

```javascript
'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var name = this.props.name;
    var todos = this.props.todos;

    return (
      <div className='lane'>
        <div className='name'>{name}</div>
        <TodoList todos={todos} />
      </div>
    );
  }
}
```

If you run the application now and try to use it, you'll notice some weird behavior. It's as if some data is linked. Logically that isn't correct. We need to fix our design.

## Separating TodoList Stores

The `TodoLists` share data because they use the same Store. In order to fix this problem we'll need to make sure each `TodoList` uses a Store of its own. Even though this sounds simple, we'll need to do quite a few changes.

**app/components/App.jsx**

```javascript
...
<div className='lanes'>
  {lanes.map((lane, i) => {
    var key = 'lane' + i;

    return <Lane key={key} storeKey={key} {...lane} />;
  }
  )}
</div>
...
```

First we'll need to pass `storeKey` to `Lane`. We need to tell each Store apart so we'll need information lower in the hierarchy. We cannot use `key` property here as React doesn't expose it to children.

**app/components/Lane.jsx**

```javascript
...
export default class Lane extends React.Component {
  constructor(props: {
    storeKey: string;
    name: string;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var name = this.props.name;
    var todos = this.props.todos;
    var storeKey = this.props.storeKey;

    return (
      <div className='lane'>
        <div className='name'>{name}</div>
        <TodoList storeKey={storeKey} todos={todos} />
      </div>
    );
  }
}
```

Here we just pass `storeKey` to `TodoList`. Nothing special apart from that.

**app/components/TodoList.jsx**

```javascript
'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from '../actions/TodoActions';
import todoStore from '../stores/TodoStore';
import alt from '../alt';

export default class TodoList extends React.Component {
  constructor(props: {
    storeKey: string;
    todos: Array;
  }) {
    super(props);

    this.actions = alt.createActions(TodoActions);
    this.store = alt.createStore(
      todoStore(this.actions),
      'TodoStore' + props.storeKey
    );
    this.actions.init({
      todos: props.todos
    });
    this.state = this.store.getState();
  }
  componentDidMount() {
    this.store.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    this.store.unlisten(this.storeChanged.bind(this));
  }
  storeChanged() {
    this.setState(this.store.getState());
  }
  ...
  addItem() {
    this.actions.createTodo('New task');
  }
  itemEdited(id, task) {
    if(task) {
      this.actions.updateTodo(id, task);
    }
    else {
      this.actions.removeTodo(id);
    }
  }
}
```

`TodoList` received a lot of changes because we needed to make it operate on its own Actions and Store. We also need to tweak those.

**app/actions/TodoActions.js**

```javascript
export default class TodoActions {
...
}
```

**app/stores/TodoStore.js**

```javascript
'use strict';

export default (actions) => {
  return class TodoStore {
    constructor() {
      this.bindActions(actions);
    }
  ...
  }
}
```

After these changes each `TodoList` operates on its own instance of `TodoActions` and `TodoStore`. Unfortunately we lost persistency in the process. Let's add that back next.

## Restoring Persistency

The signature of our `persist` decorator looks like this:

```javascript
(Component, initAction, store, storage, storageName)
```

In order to make it work on `App` level we'll need to define `AppStore` and `AppActions`. `AppActions` should contain `init` method. The rest look straightforward. You might be able to implement this on your own now so try giving it a go. I've included a possible solution for reference below:

**app/actions/AppActions.js**

```javascript
'use strict';

export default class AppActions {
  init(data) {
    this.dispatch(data);
  }
}
```

**app/stores/AppStore.js**

```javascript
'use strict';

export default (actions) => {
  return class TodoStore {
    constructor() {
      this.bindActions(actions);
    }
    init(data) {
      this.setState(data || {lanes: []});
    }
  };
};
```

**app/components/App.jsx**

```javascript

```

TODO: define AppStore, LaneStore + make TodoStore unique per TodoList

## Conclusion

TODO: figure out a nice way to integrate Baobab(?) with Alt + expand to a Kanban
TODO: show how to use react-dnd
TODO: show how to use react-router? this might go to the next chapter. need to discuss also partial loading (chart view?)
