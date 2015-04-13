# From Todo to Kanban

![Kanban board](images/kanban.png)

So far our Todo Application is very simplistic. We can manipulate the Todo items. There is also basic level of persistency. We are still missing some vital functionality that is needed to turn it this into a proper Kanban table (see image above).

Most importantly we'll need to model the concept of lane. The current `TodoApp` is pretty much equal of a list contained by a lane. Besides a list of items a lane contains a name. If we model these requirements as a data structure, we'll end up with something like this:

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

The question is how do we map this structure to our React app. We'll need `LaneStore` at least for coordinating an individual Lane. On App level we'll have something that will keep track of these lanes. We can call that `AppStore`.

We also need to fit in some new controls to the App. We need to be able to create, modify and remove lanes. In the mockup above I have included task creation within the first lane so that's something to take in count. Finally we'll need some way to move tasks between lanes so we can keep track of their completion.

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

**app/App.jsx**

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

**app/TodoList.jsx**

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

**app/App.jsx**

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

**app/Lane.jsx**

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

If you run the application now and try to use it, you'll notice some weird behavior. This happens because currently our Todolists share their Store. We'll need to clean this up next and rethink clarify our Actions and Stores.

## Rethinking Actions and Stores

TODO: define AppStore, LaneStore + make TodoStore unique per TodoList

## Conclusion

TODO: figure out a nice way to integrate Baobab(?) with Alt + expand to a Kanban
TODO: show how to use react-dnd
TODO: show how to use react-router? this might go to the next chapter. need to discuss also partial loading (chart view?)
