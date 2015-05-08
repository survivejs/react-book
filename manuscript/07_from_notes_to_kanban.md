# From Notes to Kanban

![Kanban board](images/kanban.png)

So far our Notes Application is very simplistic. We can manipulate the Note items. There is also basic level of persistency. We are still missing some vital functionality that is needed to turn it this into a proper Kanban table (see image above).

Most importantly we'll need to model the concept of lane. A lane is something that contains a name and some note items. If we model these requirements as a data structure, we'll end up with something like this:

```javascript
{
  lanes: [
    {
      name: 'Todo',
      notes: [
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
      notes: [
        {
          task: 'Learn React'
        }
      ]
    },
    {
      name: 'Done',
      notes: []
    }
  ]
}
```

The question is how do we map this structure to our React app. We could try to define a `AppStore` to manage the highest level of hierarchy. Ideally this would be something we could just serialize for persistency. Lower in the hierarchy there would perhaps be `LaneStore` and `NoteStore` for managing these particular structures. In addition we would have Actions for each. We would have to keep `AppStore` synced up somehow for serialization to work.

As you can see this approach would get complex quite fast. Once you have some form of duplication in your application and need to think about syncing, you'll open a lot of possibilities for bugs. Clearly Flux, as discussed in the previous chapter, isn't the tool we want to apply here.

## Introduction to Baobab

Wouldn't it be useful if we could operate on the data structure we just defined and give our components views to it based on their requirements? If some part of the structure changed, we would still have something consistent on the highest level on the hierarchy.

[baobab](https://github.com/Yomguithereal/baobab) is a JavaScript data tree library that allows us to do this. Consider the following demo:

```javascript
var Baobab = require('baobab');

var tree = new Baobab({
  lanes: [
    {
      name: 'demo',
      notes: [
        {
          task: 'foo',
        }
      ]
    }
  ],
});

var rootCursor = tree.root;
var laneCursor = tree.select('lanes', 0);
var noteCursor = laneCursor.select('notes');

rootCursor.on('update', function() {
  console.log(
    'updated root',
    JSON.stringify(rootCursor.get(), null, 2)
  );
});

laneCursor.on('update', function() {
  console.log('updated lane', laneCursor.get());
});

noteCursor.push({task: 'Demo task'});
```

If you run the code, you should see output like this:

```javascript
updated root {
  "lanes": [
    {
      "name": "demo",
      "notes": [
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
  notes: [ { task: 'foo' }, { task: 'Demo task' } ] }
```

Imagine the same in the context of React. We could model a small API for operations and a cursor per component. On the high level we would have the data we need without having to think about syncing. The data structure takes care of it for you.

A baobab tree can keep track of it changes. In naive cases, such as ours, this can give us an undo system pretty much for free. We will just need to active the functionality and hook up the underlying API with our application.

T> Note that we will need to operate through baobab's API. It will apply changes asynchronously by default. If you need something synchronous, you'll need to hit `tree.commit()` after an operation to force instant refresh.

## Gluing Baobab with React

> XXXXX: Danger Will Robinson. This part is under progress!

Hit `npm i baobab baobab-react typology --save` to include baobab in the project. You can also remove `alt` dependency from the project by editing *package.json*. Here is what possible integration could look like:

**app/components/App.jsx**

```javascript
import React from 'react';
import {root} from 'baobab-react/decorators';
import Lanes from './Lanes';
import storage from '../libs/storage';
import appActions from '../actions/AppActions';
import tree from './tree';

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

**app/components/Tree.js**

```javascript
import Baobab from 'baobab';
import types from 'typology';

export default new Baobab({
    lanes: []
  }, {
    validate: (previousState, newState, affectedPaths) => {
      const schema = {
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
      };
      const valid = types.check(schema, newState);

      if(!valid) {
        const err = types.scan(schema, newState);

        console.error(err);

        return new Error(err.error);
      }
    }
  }
);
```

It takes a little extra effort to validate the contents of our tree but it's worth it. This way we can be sure that the tree contains always data we expect. The validation logic could be extracted and made reusable but this will just fine for our purposes.

## Modeling `AppActions`

We get a reference to the tree root at this level. Now it's enough if we can create new lanes. Besides a name we'll attach an id to each lane based on their amount. Ids will come in handy later as we implement drag and drop.

**app/actions/AppActions.js**

```javascript
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

      window.addEventListener('beforeunload', function() {
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
