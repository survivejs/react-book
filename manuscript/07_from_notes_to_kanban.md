# From Notes to Kanban

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

## Making Flowcheck work with Decorators

As we'll be relying on decorators and still like to use Flowcheck, we'll need to tweak configuration a little bit:

**webpack.config.js**

```javascript
exports.build = mergeConfig({
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel?stage=0',
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  },
  ...
});

exports.develop = mergeConfig({
  ...
  module: {
    ...
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel', 'flowcheck', 'babel?stage=0&blacklist=flow'],
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
    ...
  }
  ...
});
```

In effect we're letting Babel process everything except Flow parts before passing the output to Flowcheck. After the check has completed, we'll deal with the rest. This is bit of a hack that will hopefully go away sometime in the future as technology becomes more robust.

T> Another way to deal with Babel configuration would be to define a [.babelrc](https://babeljs.io/docs/usage/babelrc/) file in the project root. It would contain default settings used by Babel. It's the same idea as for ESlint.

## Introduction to Baobab

Wouldn't it be useful if we could operate on the data structure we just defined and give our components views to it based on their requirements? If some part of the structure changed, we would still have something consistent on the highest level on the hierarchy.

[baobab](https://github.com/Yomguithereal/baobab) is a JavaScript data tree library that allows us to do this. Consider the following demo:

```javascript
'use strict';
var Baobab = require('baobab');

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

var rootCursor = tree.root;
var laneCursor = tree.select('lanes', 0);
var todoCursor = laneCursor.select('todos');

rootCursor.on('update', function() {
  console.log(
    'updated root',
    JSON.stringify(rootCursor.get(), null, 2)
  );
});

laneCursor.on('update', function() {
  console.log('updated lane', laneCursor.get());
});

todoCursor.push({task: 'Demo task'});
```

If you run the code, you should see output like this:


```javascript
updated root {
  "lanes": [
    {
      "name": "demo",
      "todos": [
        {
          "task": "foo"
        },
        {
          "task": "Demo task"
        }
      ]
    }
  ]
}
updated lane { name: 'demo',
  todos: [ { task: 'foo' }, { task: 'Demo task' } ] }
```

Imagine the same in the context of React. We could model a small API for operations and a cursor per component. On the high level we would have the data we need without having to think about syncing. The data structure takes care of it for you.

A baobab tree can keep track of it changes. In naive cases, such as ours, this can give us an undo system pretty much for free. We will just need to active the functionality and hook up the underlying API with our application.

T> Note that we will need to operate through baobab's API. It will apply changes asynchronously by default. If you need something synchronous, you'll need to hit `tree.commit()` after an operation to force instant refresh.

## Gluing Baobab with React

Hit `npm i baobab baobab-react --save` to include baobab in the project. You can also remove `alt` dependency from the project by editing *package.json*. Here is what possible integration could look like:

**app/components/App.jsx**

```javascript
'use strict';
import React from 'react';
import Baobab from 'baobab';
import {root} from 'baobab-react/decorators';
import Lanes from './Lanes';
import appActions from '../actions/AppActions';

const tree = new Baobab({
  lanes: []
}, {
  validate: {
    lanes: [{
      id: 'number',
      name: 'string',
      notes: [
        {
          id: 'number',
          task: 'string',
        }
      ]
    }]
  }
});

@root(tree)
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.actions = appActions(tree);
  }
  render() {
    return (
      <div className='app'>
        <div className='controls'>
          <button onClick={this.actions.createLane.bind(null, 'New lane')}>
            Add lane
          </button>
        </div>
        <Lanes />
      </div>
    );
  }
}
```

We define a stub for our tree at the beginning and define a schema for it. The schema is based on [typology](https://github.com/jacomyal/typology) syntax which is simple yet powerful.

## Modeling `AppActions`

We get a reference to the tree root at this level. Now it's enough if we can create new lanes. Besides a name we'll attach an id to each lane based on their amount. Ids will come in handy later as we implement drag and drop.

**app/actions/AppActions.js**

```javascript
'use strict';

export default (cursor) => {
  return {
    createLane: (name) => {
      var lanes = cursor.select('lanes');

      lanes.push({
        id: lanes.get().length,
        name: name,
        notes: []
      });
    }
  };
};
```

Note how we are keeping things simple and skipping dispatching, Stores and all that. The tree deals with updates for us.

## Modeling Lanes

To follow the same ideas as before I've split up Lanes into two concepts. Into a container and an individual.

**app/components/Lanes.jsx**

```javascript
'use strict';
import React from 'react';
import Lane from './Lane';
import {branch} from 'baobab-react/decorators';

@branch({
  cursors: {
    lanes: ['lanes']
  }
})
export default class Lanes extends React.Component {
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='lanes'>
        {lanes.map((lane, i) =>
          <Lane key={'lane' + i} laneCursor={['lanes', i]} />
        )}
      </div>
    );
  }
}
```

The lanes operate within a specific part of the tree. I use `@branch` decorator for defining this binding. We use the same idea with `Lane`. In addition we pass a part of the cursor we need to a `Lane` as we want to restrict it to a specific index.

**app/components/Lane.jsx**

```javascript
'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Notes from './Notes';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function(props) {
    return {
      lane: props.laneCursor
    };
  }
})
export default class Lane extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    laneCursor: Array;
  }, context) {
    super(props);

    this.actions = noteActions(context.cursors.lane.select('notes'));
  }
  render() {
    var laneCursor = this.props.laneCursor;
    var lane = this.props.lane;

    return (
      <div className='lane'>
        <div className='lane-header'>
          <div className='lane-name'>{lane.name}</div>
          <div className='lane-controls'>
            <button className='lane-add-note'
              onClick={this.actions.create.bind(null, 'New task')}>+</button>
          </div>
        </div>
        <Notes notesCursor={laneCursor.concat(['notes'])} />
      </div>
    );
  }
}
```

Note that `Lane` deals with `add` now for clarity.

## Altering `Notes`

As there are plenty of changes in `Notes`, I'll show it in its entirety.

**app/components/Notes.jsx**

```javascript
'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Note from './Note';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function(props) {
    return {
      notes: props.notesCursor
    };
  }
})
export default class Notes extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    notesCursor: Array;
  }, context) {
    super(props);

    this.actions = noteActions(context.cursors.notes);
  }
  render(props, context) {
    var notes = this.props.notes;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <li key={'note' + i}>
          <Note
            task={note.task}
            onEdit={this.itemEdited.bind(this, i)} />
        </li>
      )}</ul>
    );
  }
  itemEdited(id, task) {
    if(task) {
      this.actions.update(id, task);
    }
    else {
      this.actions.remove(id);
    }
  }
}
```

The most important change has to do with the way we deal with Actions. Just like with `AppActions`, `NoteActions` is as light as possible. It operates using the cursor directly as below:

**app/actions/NoteActions.jsx**

```javascript
'use strict';

export default (cursor) => {
  return {
    create: (task) => {
      const id = cursor.get().length || 0;

      cursor.push({id, task});
    },
    update: (i, task) => {
      cursor.select(i).update({
        task: {
          $set: task
        }
      });
    },
    remove: (i) => {
      cursor.unset(i);
    }
  };
};
```

The implementation of a `Note` remains the same as earlier.

## Persisting to a Storage

As it is annoying to lose data between refreshes, we probably should restore that functionality. We can achieve that with a decorator like this:

**app/components/App.jsx**

```javascript
...
import persist from '../decorators/persist';
import storage from '../libs/storage';
...

@persist(tree, storage, 'app')
@root(tree)
export default class App extends React.Component {
...
}
```

**app/decorators/persist.js**

```javascript
'use strict';
import React from 'react';

const root = (Component, tree, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      var data = storage.get(storageName);

      if(data) {
        tree.set(data);
        tree.commit();
      }

      window.addEventListener('beforeunload', function(e){
        storage.set(storageName, tree.get());
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};

export default (tree, storage, storageName) => {
  // storage expects
  // * get(storageName)
  // * set(storageName, data)
  return (target) => root(target, tree, storage, storageName);
};
```

The nice thing about our implementation is that you can apply the decorator in any part of your tree, not just the root as we are doing here. So in case you wanted to persist just certain view within a more complex application, this could do it.

## Undoing and Redoing

XXX: show how to implement a simple undo to the app on top of baobab

## Conclusion

After these changes we should have something rough together that works. It might not be the prettiest Kanban application out there and it might be missing some functionality but at least we have lanes now and can define notes within them. In the next chapter we will start polishing the application so that it actually looks good.
