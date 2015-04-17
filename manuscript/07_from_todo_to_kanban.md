# From Todo to Kanban

![Kanban board](images/kanban.png)

So far our Todo Application is very simplistic. We can manipulate the Todo items. There is also basic level of persistency. We are still missing some vital functionality that is needed to turn it this into a proper Kanban table (see image above).

Most importantly we'll need to model the concept of lane. A lane is something that contains a name and some todo items. If we model these requirements as a data structure, we'll end up with something like this:

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

The question is how do we map this structure to our React app. We could try to define a `AppStore` to manage the highest level of hierarchy. Ideally this would be something we could just serialize for persistency. Lower in the hierarchy there would perhaps be `LaneStore` and `TodoStore` for managing these particular structures. In addition we would have Actions for each. We would have to keep `AppStore` synced up somehow for serialization to work.

As you can see this approach would get complex quite fast. Once you have some form of duplication in your application and need to think about syncing, you'll open a lot of possibilities for bugs. Clearly Flux, as discussed in the previous chapter, isn't the tool we want to apply here.

## Introduction to Baobab

Wouldn't it be useful if we could operate on the data structure we just defined and give our components views to it based on their requirements? If some part of the structure changed, we would still have something consistent on the highest level on the hierarchy.

[baobab](https://github.com/Yomguithereal/baobab) is a JavaScript data tree library that allows us to do this. Consider the following demo:

```javascript
'use strict';
var Baobab = require('baobab');

// some predefined data
var tree = new Baobab({
  lanes: [
    {
      name: 'demo',
      todos: [
        {
          task: 'foo',
        }
      ]
    }
  ],
});

// a couple of cursors
var rootCursor = tree.root();
var laneCursor = tree.select('lanes', 0); // first lane
var todoCursor = laneCursor.select('todos');

// watch for changes
rootCursor.on('update', function() {
  console.log('updated root', rootCursor.get());
});

laneCursor.on('update', function() {
  console.log('updated lane', laneCursor.get());
});

// operate on todo
todoCursor.push({task: 'Demo task'});
```

Even though simple, the demo shows the power of baobab. Imagine the same in the context of React. We could model a small API for operations and a cursor per component. On the high level we would have the data we need without having to think about syncing. The data structure takes care of it for you.

A baobab tree can keep track of it changes. In naive cases, such as ours, this can give us an undo system pretty much for free. We will just need to active the functionality and hook up the underlying API with our application.

T> Note that we will need to operate through baobab's API. It will apply changes asynchronously by default. If you need something synchronous, you'll need to hit `tree.commit()` after an operation to force instant refresh.

## Gluing Baobab with React

Hit `npm i baobab --save` to include baobab in the project. You can also remove `alt` dependency from the project by editing *package.json*. Here is what possible integration could look like:

**app/components/App.jsx**

```javascript
'use strict';
import React from 'react';
import Baobab from 'baobab';
import Lane from './Lane';
import connect from '../decorators/connect';
import storage from '../lib/storage';
import appActions from '../actions/AppActions';

const appStorage = 'app';
const tree = new Baobab(storage.get(appStorage) || {
  lanes: []
}, {
  validate: {
    lanes: [{
      name: 'string',
      todos: [
        {
          task: 'string',
        }
      ]
    }]
  }
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

We define a stub for our tree at the beginning and define a schema for it. The schema is based on [typology](https://github.com/jacomyal/typology) syntax which is simple yet powerful. After that we do some storage checks (XXX: this will likely go back to a decorator).

Finally we connect our baobab tree with `App` like this:

**app/decorators/connect.js**

```javascript
'use strict';
import React from 'react';

export default (Component, cursor) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.state = cursor.get();
    }
    componentDidMount() {
      const that = this;

      cursor.on('update', function() {
        that.setState(cursor.get());
      });
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
```

The solution isn't very optimized but will do for now. The basic idea is that we update the `App` state through a prop if the tree changes. After that the changes will propagate through the components.

W> As of time of writing there's no official way to use Baobab with ES6 style classes. Once there is, we should get more performance etc. XXX: Update this when an official solution is available.

## Modeling `AppActions`

We get a reference to the tree root at this level. We pass a more specific cursor to each lane. We also have `App` level actions:

**app/actions/AppActions.js**

```javascript
'use strict';

export default (cursor) => {
  return {
    createLane: (name) => {
      cursor.select('lanes').push({
        name: name,
        todos: []
      });
    }
  };
};
```

In the current implementation it's enough for us just to create new lanes. I decided to keep things simple and just operate directly through cursor. It would be possible to separate things further by introducing the concept of Stores to our system but this will do for now. That would be justified if our Actions needed to perform complicated dispatching (ie. hit multiple Stores).

## Modeling Lanes

I decided to model just the concept of `Lane` in this case. It might be tidier to set up a `Lanes` component but at least now it doesn't provide a lot of value apart from neater semantics. You can see the relevant bit below:

```javascript
<div className='lanes'>
  {lanes.map((lane, i) =>
    <Lane key={'lane' + i} cursor={cursor.select('lanes', i)} />
  )}
</div>
```

Actual `Lane` looks like this:

**app/components/Lane.jsx**

```javascript
'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);
  }
  render() {
    var cursor = this.props.cursor;

    return (
      <div className='lane'>
        <div className='name'>{cursor.get().name}</div>
        <TodoList cursor={cursor.select('todos')} />
      </div>
    );
  }
}
```

The idea is the same as above. We operate based on the cursor. We get some data from it to show and create another cursor for `TodoList`.

## Altering `TodoList`

As there are plenty of changes in `TodoList`, I'll show it in its entirety.

**app/components/TodoList.jsx**

```javascript
'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import todoActions from '../actions/TodoActions';

export default class TodoList extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);

    this.actions = todoActions(props.cursor);
  }
  render() {
    var todos = this.props.cursor.get();

    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>

        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)} />
          </li>
        )}</ul>
      </div>
    );
  }
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

The most important change has to do with the way we deal with Actions. Just like with `AppActions`, `TodoActions` is as light as possible. It operates using the cursor directly as below:

```javascript
'use strict';

export default (cursor) => {
  return {
    createTodo: (task) => {
      cursor.push({task});
    },
    updateTodo: (i, task) => {
      cursor.select(i).update({
        task: {
          $set: task
        }
      });
    },
    removeTodo: (i) => {
      cursor.unset(i);
    }
  };
};
```

## Conclusion

After these changes we should have something rough together that works. It might not be the prettiest Kanban application out there and it might be missing some functionality but at least we have lanes now and can define todo items within them. In the next chapter we will start polishing the application so that it actually looks good and works well.
