# From Todo to Kanban

![Kanban board](images/kanban.png)

So far our Todo Application is very simplistic. We can manipulate the Todo items. There is also basic level of persistency. We are still missing some vital functionality that is needed to turn it this into a proper Kanban table (see image above).

Most importantly we'll need to model the concept of lane. The current `TodoApp` is pretty much equal of a list contained by a lane. Besides a list of items a lane contains a name. If we model these requirements as a data structure, we'll end up with something like this:

```json
{
  "lanes": [
    {
      "name": "Todo",
      "todos": [
        {
          "task": "Learn Webpack"
        },
        {
          "task": "Do laundry"
        }
      ]
    },
    {
      "name": "Doing",
      "todos": [
        {
          "task": "Learn React"
        }
      ]
    },
    {
      "name": "Done",
      "todos": []
    }
  ]
}
```

The question is how do we map this structure to our React app. We'll need `LaneStore` at least for coordinating an individual Lane. On Application level we'll have something that will keep track of these lanes. We can call that `ApplicationStore`.

We also need to fit in some new controls to the Application. We need to be able to create, modify and remove lanes. In the mockup above I have included task creation within the first lane so that's something to take in count. Finally we'll need some way to move tasks between lanes so we can keep track of their completion.

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


export default class TodoApp extends React.Component {
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

TODO

## Conclusion

TODO: figure out a nice way to integrate Baobab(?) with Alt + expand to a Kanban
TODO: show how to use react-dnd
TODO: show how to use react-router? this might go to the next chapter. need to discuss also partial loading (chart view?)
