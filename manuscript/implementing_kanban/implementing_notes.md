# Implementing a Basic Note Application

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude note-taking application. It will have basic manipulation operations. We will grow our application from scratch and get into some trouble. This way you will understand why architectures, such as Flux, are needed.

W> Hot loading isn't foolproof always. Given it operates by swapping methods dynamically, it won't catch every change. This is problematic with property initializers and `bind`. This means you may need to force a manual refresh at the browser for some changes to show up!

## Initial Data Model

Often a good way to begin designing an application is to start with the data. We could model a list of notes as follows:

```javascript
[
  {
    id: '4a068c42-75b2-4ae2-bd0d-284b4abbb8f0',
    task: 'Learn Webpack'
  },
  {
    id: '4e81fc6e-bfb6-419b-93e5-0242fb6f3f6a',
    task: 'Learn React'
  },
  {
    id: '11bbffc8-5891-4b45-b9ea-5c99aadf870f',
    task: 'Do laundry'
  }
];
```

Each note is an object which will contain the data we need, including an `id` and a `task` we want to perform. Later on it is possible to extend this data definition to include things like the note color or the owner.

## Connecting Data with `App`

We could have skipped ids in our definition. This would become problematic as we grow our application, though. If you are referring to data based on array indices and the data changes, each reference has to change too. We can avoid that easily by generating the ids ourselves.

### Generating the Ids

Normally the problem is solved by a back-end. As we don't have one yet, we'll use a standard known as [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) instead. It allows us to generate unique ids. We'll be using a Node.js implementation known as *node-uuid* and its `uuid.v4` variant. It will give us ids, such as `1c8e7a12-0b4c-4f23-938c-00d7161f94fc` and they are guaranteed to be unique with a very high probability.

T> If you are interested in the math behind this, check out [the calculations at Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Random_UUID_probability_of_duplicates) for details. You'll see that the possibility for collisions is somewhat miniscule and something we don't have to worry about.

### Setting Up `App`

Now that we know how to deal with ids and understand what kind of data model we want, we need to connect our data model with `App`. The simplest way to achieve that is to push the data directly to `render()` for now. This won't be efficient, but it will allow us to get started. The implementation below shows how this works out in React terms:

**app/components/App.jsx**

```javascript
leanpub-start-insert
import uuid from 'node-uuid';
leanpub-end-insert
import React from 'react';
leanpub-start-delete
import Note from './Note.jsx';
leanpub-end-delete

export default class App extends React.Component {
  render() {
leanpub-start-insert
    const notes = [
      {
        id: uuid.v4(),
        task: 'Learn Webpack'
      },
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];
leanpub-end-insert

leanpub-start-delete
    return <Note />;
leanpub-end-delete
leanpub-start-insert
    return (
      <div>
        <ul>{notes.map(note =>
          <li key={note.id}>{note.task}</li>
        )}</ul>
      </div>
    );
leanpub-end-insert
  }
}
```

We are using various important features of React in the snippet above. Understanding them is invaluable. I have annotated important parts below:

* `<ul>{notes.map(note => ...}</ul>` - `{}`'s allow us to mix JavaScript syntax within JSX. `map` returns a list of `li` elements for React to render.
* `<li key={note.id}>{note.task}</li>` - In order to tell React in which order to render the elements, we use the `key` property. It is important that this is unique or else React won't be able to figure out the correct order in which to render. If not set, React will give a warning. See [Multiple Components](https://facebook.github.io/react/docs/multiple-components.html) for more information.

If you run the application now, you can see a list of notes. It's not particularly pretty, but it's a start:

![A list of notes](images/react_03.png)

T> If you want to examine your application further, it can be useful to attach a [debugger;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement to the place you want to study. It has to be placed on a line that will get executed for the browser to pick it up! The statement will cause the browser debugging tools to trigger and allow you to study the current call stack and scope. You can attach breakpoints like this through the browser, but this is a good alternative.

## Adding New Items to the List

Adding more items to the list would be a good starting point for further development. Each React component may maintain internal `state`. In this case `state` would refer to the data model we just defined. As we modify the state through React's `setState` method, React will eventually call the `render()` method and update the user interface. This idea allows us to implement interactivity, such as adding new items to the list.

React forces you to think about state carefully. As the complexity of your application grows, this becomes a fundamental issue. This is the reason why various state management solutions have been developed. They allow you to push application state management related concerns out of your React components.

Components may still retain some state of their own. A good example is state related to the user interface. A fancy dropdown component might want to maintain its visibility state by itself for example. We will discuss state management in greater detail as we develop the application.

Assuming we are using a class based component definition, we can define the initial state of our component in its `constructor`. It is a special method that gets called when the component is instantiated initially. In this case we can push our initial data definition there and set it as our component `state`:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
leanpub-start-insert
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn Webpack'
        },
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    };
  }
leanpub-end-insert
  render() {
leanpub-start-delete
    const notes = [
      {
        id: uuid.v4(),
        task: 'Learn Webpack'
      },
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];
leanpub-end-delete
leanpub-start-insert
    const notes = this.state.notes;
leanpub-end-insert

    ...
  }
}
```

After this change and refreshing the browser, our application works the same way as before. We have gained something in return, though. We can now begin to alter the state through `setState`.

T> In the earlier versions of React, you could achieve the same result with `getInitialState`. We're passing `props` to `super` by convention. If you don't pass it, `this.props` won't get set! Calling `super` invokes the same method of the parent class and you see this kind of usage in object oriented programming often.

### Defining `addNote` Handler

Now that we have state, we can begin to modify it through custom methods. UI-wise we could add a simple button to `App`. That in turn would trigger a method that would add a new item to the component state. As discussed earlier, React will pick up the change and refresh the user interface as a result for us:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
leanpub-start-insert
        <button onClick={this.addNote}>+</button>
leanpub-end-insert
        <ul>{notes.map(note =>
          <li key={note.id}>{note.task}</li>
        )}</ul>
      </div>
    );
  }
leanpub-start-insert
  // We are using an experimental feature known as property
  // initializer here. It allows us to bind the method `this`
  // to point at our *App* instance.
  //
  // Alternatively we could `bind` at `constructor` using
  // a line, such as this.addNote = this.addNote.bind(this);
  addNote = () => {
    // It would be possible to write this in an imperative style.
    // I.e., through `this.state.notes.push` and then
    // `this.setState({notes: this.state.notes})` to commit.
    //
    // I tend to favor functional style whenever that makes sense.
    // Even though it might take more code sometimes, I feel
    // the benefits (easy to reason about, no side effects)
    // more than make up for it.
    //
    // Libraries, such as Immutable.js, go a notch further.
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'New task'
      }])
    });
  };
leanpub-end-insert
}
```

If we were operating with a back-end, we would trigger a query here and capture the id from the response. For now it's enough to just generate an entry and a custom id.

In case you refresh the browser and click the plus button now, you should see a new item at the list:

![Notes with a plus](images/react_05.png)

We are still missing two crucial features: editing and deletion. Before moving onto these, it's a good idea to make room for them by expanding our component hierarchy. It will become easier to deal with the features after that. Working with React is like this. You develop a component for a while until you realize it could be split up further.

T> `this.setState` accepts a second parameter like this: `this.setState({...}, () => console.log('set state!'))`. This is handy to know if you want to trigger some behavior right after `setState` has completed.

T> You could use `this.setState({notes: [...this.state.notes, {id: uuid.v4(), task: 'New task'}]})` to achieve the same result. This [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) can be used with function parameters as well. See the *Language Features* appendix for more information.

T> Using [autobind-decorator](https://www.npmjs.com/package/autobind-decorator) would be a valid alternative for property initializers. In this case we would use `@autobind` annotation either on class or method level. To learn more about decorators, read the *Understanding Decorators* appendix.

## Improving Component Hierarchy

Our current, one component based setup isn't going to take us far. It would be complicated to add more separate collections of notes to it. In the current setup this would mean we would have to duplicate code.

Fortunately we can solve this problem by modeling more components to our system. Besides solving the problem, they also promote reuse. In the ideal case we can use good components across multiple different systems.

As a collection of notes feels like a component, we can model it as `Notes`. Furthermore we can split the concept of `Note` from it. This separation gives us another degree of abstraction that will come in handy. This setup gives us a three tier component hierarchy that looks like this:

By looking at our application, we can design a component hierarchy like this:

* `App` - `App` retains application state and deals with the high level logic.
* `Notes` - `Notes` acts as an intermediate wrapper in between and renders individual `Note` components.
* `Note` - `Note` is the workhorse of our application. Editing and deletion will be triggered here. That logic will cascade to `App` through wiring in between.

Later on we can expand the hierarchy to a full Kanban by introducing the concepts of `Lane` and `Lanes` to it. These two concepts fit between `App` and `Notes`. We don't need to care about this just yet, though.

T> One natural way to model component hierarchies is to draw out your application on paper. You will begin to see entities that will map to components. This allows you to identify especially *presentational* components that focus on displaying data. You have *container* components that connect with data on a higher level. Dan Abramov discusses this in his Medium post known as [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.q8c68v3ff).

T> You can certainly develop components organically. Once they begin to feel too big, refactor and extract the components you identify. Sometimes finding the right composition may take some time and patience. Component design is a skill to learn and master.

### Extracting `Note`

A good first step towards the hierarchy we want is to extract `Note`. `Note` is a component which will need to receive `task` as a *prop* and render it. In terms of JSX this would look like `<Note task="task goes here" />`.

In addition to `state`, `props` are another concept you will be using a lot. They describe the external interface of a component. You can annotate them as discussed in the *Typing with React* chapter. To keep things simple, we are skipping `propType` annotations here.

A function based component will receive `props` as its first parameter. We can extract specific props from it through [ES6 destructuring syntax](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring). A function based component is `render()` by itself. They are far more limited than class based ones, but they are perfect for simple *presentational* purposes, such as this. To tie these ideas together, we can end up with a component definition such as this:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default ({task}) => <div>{task}</div>;
```

This declaration is equivalent to:

```javascript
import React from 'react';

export default (props) => <div>{props.task}</div>;
```

As you can see, destructuring removes some noise from the code. If you wanted to pass the remaining `props` to the `div`, you could declare the component like this:

```javascript
import React from 'react';

export default ({task, ...props}) => <div {...props}>{task}</div>;
```

Now `props` contains the fields that weren't explicitly selected through the syntax. This pattern is particularly useful when you want to develop flexible components. We'll be using the pattern a lot in the following chapters.

T> To understand the destructuring syntax in greater detail, check out the *Language Features* appendix.

### Connecting `Note` with `App`

Now that we have a simple component that accepts a `task` prop, we can connect it with `App` to get closer to the component hierarchy we have in mind:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
leanpub-start-insert
import Note from './Note.jsx';
leanpub-end-insert

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
        <ul>{notes.map(note =>
leanpub-start-delete
          <li key={note.id}>{note.task}</li>
leanpub-end-delete
leanpub-start-insert
          <li key={note.id}>
            <Note task={note.task} />
          </li>
leanpub-end-insert
        )}</ul>
      </div>
    );
  }
  ...
}
```

The application should still look the same. To achieve the structure we are after, we should perform one more tweak and extract `Notes`.

### Extracting `Notes`

Extracting `Notes` is a similar operation. We need to understand what portion of `App` belongs to the component and then write a definition for it. It is the same idea as for `Note` earlier:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

export default ({notes}) => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}>
        <Note task={note.task} />
      </li>
    )}</ul>
  );
}
```

In addition, we need to connect `App` with the new definition:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
leanpub-start-delete
import Note from './Note.jsx';
leanpub-end-delete
leanpub-start-insert
import Notes from './Notes.jsx';
leanpub-end-insert

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
leanpub-start-delete
        <ul>{notes.map(note =>
          <li key={note.id}>
            <Note task={note.task} />
          </li>
        )}</ul>
leanpub-end-delete
leanpub-start-insert
        <Notes notes={notes} />
leanpub-end-insert
      </div>
    );
  }
  addNote = () => {
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'New task'
      }])
    });
  };
}
```

The application should still behave the same way. Structurally we are far better off than earlier, though. Now we can begin to worry about adding new functionality to the system.

## Editing `Notes`

In order to edit individual `Note`s, we should set up some hooks for that. Logically the following could happen:

1. The user clicks a `Note`.
2. `Note` renders itself as an input showing its current value.
3. The user confirms the modification (`blur` event is triggered or *enter* key is pressed).
4. `Note` renders the new value.

This means `Note` will need to track its `editing` state somehow. In addition, we need to communicate that the value (`task`) has changed so that `App` knows to update its state. Resolving these two problems gives us something functional.

### Tracking `Note` `editing` State

Just as earlier with `App`, we need to deal with state again. This means a function based component won't be enough anymore. Instead, we need to convert it to a heavier format. For the sake of consistency, I'll be using the same component definition style as with `App`. In addition, we need to alter the `editing` state based on the user behavior, and finally render the right element based on it. Here's what this means in terms of React:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  constructor(props) {
    super(props);

    // Track `editing` state.
    this.state = {
      editing: false
    };
  }
  render() {
    // Render the component differently based on state.
    if(this.state.editing) {
      return this.renderEdit();
    }

    return this.renderNote();
  }
  renderEdit = () => {
    // We deal with blur and input handlers here. These map to DOM events.
    // We also set selection to input end using a callback at a ref.
    // It gets triggered after the component is mounted.
    //
    // We could also use a string reference (i.e., `ref="input") and
    // then refer to the element in question later in the code through
    // `this.refs.input`. We could get the value of the input using
    // `this.refs.input.value` through DOM in this case.
    //
    // Refs allow us to access the underlying DOM structure. They
    // can be using when you need to move beyond pure React. They
    // also tie your implementation to the browser, though.
    return <input type="text"
      ref={
        element => element ?
        element.selectionStart = this.props.task.length :
        null
      }
      autoFocus={true}
      defaultValue={this.props.task}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter} />;
  };
  renderNote = () => {
    // If the user clicks a normal note, trigger editing logic.
    return <div onClick={this.edit}>{this.props.task}</div>;
  };
  edit = () => {
    // Enter edit mode.
    this.setState({
      editing: true
    });
  };
  checkEnter = (e) => {
    // The user hit *enter*, let's finish up.
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  };
  finishEdit = (e) => {
    // `Note` will trigger an optional `onEdit` callback once it
    // has a new value. We will use this to communicate the change to
    // `App`.
    //
    // A smarter way to deal with the default value would be to set
    // it through `defaultProps`.
    //
    // See the *Typing with React* chapter for more information.
    const value = e.target.value;

    if(this.props.onEdit) {
      this.props.onEdit(value);

      // Exit edit mode.
      this.setState({
        editing: false
      });
    }
  };
}
```

If you try to edit a `Note` now, you should see an input and be able to edit the data. Given we haven't set up `onEdit` handler, it doesn't do anything useful yet, though. We'll need to capture the edited data next and update `App` state so that the code works.

T> It can be a good idea to name your callbacks using `on` prefix. This will allow you to distinguish them from other props and keep your code a little tidier.

### Communicating `Note` State Changes

Given we are currently dealing with the logic at `App`, we can deal with `onEdit` there as well. An alternative design might be to push the logic to `Notes` level. This would get problematic with `addNote` as it is functionality that doesn't belong within `Notes` domain. Therefore we'll keep the application state at `App` level.

In order to make `onEdit` work, we will need to capture its output and delegate the result to `App`. Furthermore we will need to know which `Note` was modified so we can update the data accordingly. This can be achieved through data binding as illustrated by the diagram below:

![`onEdit` flow](images/bind.png)

As `onEdit` is defined on `App` level, we'll need to pass `onEdit` handler through `Notes`. So for the stub to work, changes in two files are needed. Here's what it should look like for `App`:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
import Notes from './Notes.jsx';

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
leanpub-start-delete
        <Notes notes={notes} />
leanpub-end-delete
leanpub-start-insert
        <Notes notes={notes} onEdit={this.editNote} />
leanpub-end-insert
      </div>
    );
  }
  addNote = () => {
    ...
  };
leanpub-start-insert
  editNote = (id, task) => {
    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      return;
    }

    const notes = this.state.notes.map(note => {
      if(note.id === id && task) {
        note.task = task;
      }

      return note;
    });

    this.setState({notes});
  };
leanpub-end-insert
}
```

T> `this.setState({notes})` is using [Object initializer syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer). It is the same as writing `this.setState({notes: notes})`. See the *Language Features* appendix for more information.

To make the scheme work as designed, we need to modify `Notes` to work according to the idea. It will `bind` the id of the note in question. When the callback is triggered, the remaining parameter receives a value and the callback gets called:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

export default ({notes, onEdit}) => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}>
        <Note
          task={note.task}
          onEdit={onEdit.bind(null, note.id)} />
      </li>
    )}</ul>
  );
}
```

If you refresh and try to edit a `Note` now, the modification should stick. The same idea can be used to implement a lot of functionality and this is a pattern you will see a lot.

The current design isn't flawless. What if we wanted to allow newly created notes to be editable straight from the start? Given `Note` encapsulated this state, we don't have simple means to access it from the outside. The current solution is enough for now. We'll address this issue properly in *From Notes to Kanban* chapter and extract the state there.

![Edited a note](images/react_06.png)

## Removing `Notes`

We are still missing one vital functionality. It would be nice to be able to delete notes. We could implement a button per `Note` and trigger the logic using that. It will look a little rough initially, but we will style it later.

As before, we'll need to define some logic on `App` level. Deleting a note can be achieved by first looking for a `Note` to remove based on id. After we know which `Note` to remove, we can construct a new state without it.

Just like earlier, it will take three changes. We need to define logic at `App` level, bind the `id` at `Notes`, and then finally trigger the logic at `Note` through its user interface. To get started, `App` logic can be defined in terms of `filter`:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
import Notes from './Notes.jsx';

export default class App extends React.Component {
  ...
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
leanpub-start-delete
        <Notes notes={notes} onEdit={this.editNote} />
leanpub-end-delete
leanpub-start-insert
        <Notes notes={notes}
          onEdit={this.editNote}
          onDelete={this.deleteNote} />
leanpub-end-insert
      </div>
    );
  }
leanpub-start-insert
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
  };
leanpub-end-insert
  ...
}
```

`Notes` will work similarly as earlier:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

leanpub-start-delete
export default ({notes, onEdit}) => {
leanpub-end-delete
leanpub-start-insert
export default ({notes, onEdit, onDelete}) => {
leanpub-end-insert
  return (
    <ul>{notes.map(note =>
      <li key={note.id}>
leanpub-start-delete
        <Note
          task={note.task}
          onEdit={onEdit.bind(null, note.id)} />
leanpub-end-delete
leanpub-start-insert
        <Note
          task={note.task}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
leanpub-end-insert
      </li>
    )}</ul>
  );
}
```

Finally, we need to attach a delete button to each `Note` and then trigger `onDelete` when those are clicked:

**app/components/Note.jsx**

```javascript
...

export default class Note extends React.Component {
  ...
  renderNote = () => {
    // If the user clicks a normal note, trigger editing logic.
leanpub-start-delete
    return <div onClick={this.edit}>{this.props.task}</div>;
leanpub-end-delete
leanpub-start-insert
    const onDelete = this.props.onDelete;

    return (
      <div onClick={this.edit}>
        <span>{this.props.task}</span>
        {onDelete ? this.renderDelete() : null }
      </div>
    );
leanpub-end-insert
  };
leanpub-start-insert
  renderDelete = () => {
    return <button onClick={this.props.onDelete}>x</button>;
  };
leanpub-end-insert
  ...
}
```

After these changes and refreshing you should be able to delete notes as you like.

![Deleted a note](images/react_07.png)

T> You may need to trigger a refresh at the browser to make these changes show up. Hit *CTRL/CMD-R*.

## Styling Application

Aesthetically, our current application is very barebones. As pretty applications are more fun to use, we can do a little something about that. In this case we'll be sticking to an old skool way of styling. In other words, we'll sprinkle some CSS classes around and then apply CSS selectors based on those. The *Styling React* chapter discusses various other approaches in greater detail.

### Attaching Classes to Components

In order to make our application styleable, we will need to attach some classes to various parts of it:

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
import Notes from './Notes.jsx';

export default class App extends React.Component {
  ...
  render() {
    const notes = this.state.notes;

    return (
      <div>
leanpub-start-delete
        <button onClick={this.addNote}>+</button>
leanpub-end-delete
leanpub-start-insert
        <button className="add-note" onClick={this.addNote}>+</button>
leanpub-end-insert
        <Notes notes={notes}
          onEdit={this.editNote}
          onDelete={this.deleteNote} />
      </div>
    );
  }
  ...
}
```

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

export default ({notes, onEdit, onDelete}) => {
  return (
leanpub-start-delete
    <ul>{notes.map(note =>
leanpub-end-delete
leanpub-start-insert
    <ul className="notes">{notes.map(note =>
leanpub-end-insert
leanpub-start-delete
      <li key={note.id}>
leanpub-end-delete
leanpub-start-insert
      <li className="note" key={note.id}>
leanpub-end-insert
        <Note
          task={note.task}
          onEdit={onEdit.bind(null, note.id)}
          onDelete={onDelete.bind(null, note.id)} />
      </li>
    )}</ul>
  );
}
```

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  ...
  renderNote = () => {
    const onDelete = this.props.onDelete;

    return (
      <div onClick={this.edit}>
leanpub-start-delete
        <span>{this.props.task}</span>
leanpub-end-delete
leanpub-start-insert
        <span className="task">{this.props.task}</span>
leanpub-end-insert
        {onDelete ? this.renderDelete() : null }
      </div>
    );
  };
  renderDelete = () => {
leanpub-start-delete
    return <button onClick={this.props.onDelete}>x</button>;
leanpub-end-delete
leanpub-start-insert
    return <button
      className="delete-note"
      onClick={this.props.onDelete}>x</button>;
leanpub-end-insert
  };
  ...
}
```

### Styling Components

The first step is to get rid of that horrible *serif* font.

**app/main.css**

```css
body {
  background: cornsilk;
  font-family: sans-serif;
}
```

Looking a little nicer now:

![Sans serif](images/react_08.png)

A good next step would be to constrain the `Notes` container a little and get rid of those list bullets.

**app/main.css**

```css
...

.add-note {
  background-color: #fdfdfd;
  border: 1px solid #ccc;
}

.notes {
  margin: 0.5em;
  padding-left: 0;

  max-width: 10em;
  list-style: none;
}
```

Removing bullets helps:

![No bullets](images/react_09.png)

To make individual `Notes` stand out we can apply a couple of rules.

**app/main.css**

```css
...

.note {
  margin-bottom: 0.5em;
  padding: 0.5em;

  background-color: #fdfdfd;
  box-shadow: 0 0 0.3em 0.03em rgba(0, 0, 0, 0.3);
}
.note:hover {
  box-shadow: 0 0 0.3em 0.03em rgba(0, 0, 0, 0.7);

  transition: 0.6s;
}

.note .task {
  /* force to use inline-block so that it gets minimum height */
  display: inline-block;
}
```

Now the notes stand out a bit:

![Styling notes](images/react_10.png)

I animated `Note` shadow in the process. This way the user gets a better indication of what `Note` is being hovered upon. This won't work on touch based interfaces, but it's a nice touch for the desktop.

Finally, we should make those delete buttons stand out less. One way to achieve this is to hide them by default and show them on hover. The gotcha is that delete won't work on touch, but we can live with that.

**app/main.css**

```css
...

.note .delete-note {
  float: right;

  padding: 0;

  background-color: #fdfdfd;
  border: none;

  cursor: pointer;

  visibility: hidden;
}
.note:hover .delete-note {
  visibility: visible;
}
```

No more of those pesky delete buttons:

![Delete on hover](images/react_11.png)

After these few steps, we have an application that looks passable. We'll be improving its appearance as we add functionality, but at least it's somewhat visually appealing.

## Understanding React Components

Understanding how `props` and `state` work is important. Component lifecycle is another key concept. We already touched on it earlier, but it's a good idea to understand it in more detail. You can achieve most tasks in React by applying these concepts throughout your application. React provides the following lifecycle hooks:

* `componentWillMount()` gets triggered once before any rendering. One way to use it would be to load data asynchronously there and force rendering through `setState`.
* `componentDidMount()` gets triggered after initial rendering. You have access to the DOM here. You could use this hook to wrap a jQuery plugin within a component, for instance.
* `componentWillReceiveProps(object nextProps)` triggers when the component receives new props. You could, for instance, modify your component state based on the received props.
* `shouldComponentUpdate(object nextProps, object nextState)` allows you to optimize the rendering. If you check the props and state and see that there's no need to update, return `false`.
* `componentWillUpdate(object nextProps, object nextState)` gets triggered after `shouldComponentUpdate` and before `render()`. It is not possible to use `setState` here, but you can set class properties, for instance. [The official documentation](https://facebook.github.io/react/docs/advanced-performance.html#shouldcomponentupdate-in-action) goes into greater details. In short, this is where immutable data structures, such as [Immutable.js](https://facebook.github.io/immutable-js/), come handy thanks to their easy equality checks.
* `componentDidUpdate()` is triggered after rendering. You can modify the DOM here. This can be useful for adapting other code to work with React.
* `componentWillUnmount()` is triggered just before a component is unmounted from the DOM. This is the ideal place to perform cleanup (e.g., remove running timers, custom DOM elements, and so on).

Beyond the lifecycle hooks, there are a variety of [properties and methods](https://facebook.github.io/react/docs/component-specs.html) you should be aware of if you are going to use `React.createClass`:

* `displayName` - It is preferable to set `displayName` as that will improve debug information. For ES6 classes this is derived automatically based on the class name.
* `getInitialState()` - In class based approach the same can be achieved through `constructor`.
* `getDefaultProps()` - In classes you can set these in `constructor`.
* `mixins` - `mixins` contains an array of mixins to apply to components.
* `statics` - `statics` contains static properties and method for a component. In ES6 you can assign them to the class as below:

```javascript
class Note {
  render() {
    ...
  }
}
Note.willTransitionTo = () => {...};

export default Note;
```

Some libraries, such as React DnD, rely on static methods to provide transition hooks. They allow you to control what happens when a component is shown or hidden. By definition statics are available through the class itself.

Both class and `React.createClass` based components allow you to document the interface of your component using `propTypes`. To dig deeper, read the *Typing with React* chapter.

Both support `render()`, the workhorse of React. In function based definition `render()` is the function itself. `render()` simply describes what the component should look like. In case you don't want to render anything, return either `null` or `false`.

> React provides a feature known as [refs](https://facebook.github.io/react/docs/more-about-refs.html) so you can perform operations on React elements through DOM. This is an escape hatch designed for those cases where React itself doesn't cut it. Performing measurements is a good example. Refs need to be attached to stateful components in order to work.

## React Component Conventions

I prefer to have the `constructor` first, followed by lifecycle hooks, `render()`, and finally, methods used by `render()`. I like this top-down approach as it makes it straightforward to follow code. Some prefer to put the methods used by `render()` before it. There are also various naming conventions. It is possible to use `_` prefix for event handlers, too.

In the end, you will have to find conventions that you like and which work the best for you. I go into more detail about this topic in the *Linting in Webpack* chapter, where I introduce various code quality related tools. Through the use of these tools, it is possible to enforce coding style to some extent.

This can be useful in a team environment. It decreases the amount of friction when working on code written by others. Even on personal projects, using tools to verify syntax and standards for you can be useful. It lessens the amount and severity of mistakes.

## Conclusion

You can get quite far just with vanilla React. The problem is that we are starting to mix data related concerns and logic with our view components. We'll improve the architecture of our application by introducing Flux to it.
