# Implementing a Note Application

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude note-taking application. It will have basic manipulation operations. We will grow our application from scratch and get into some trouble. This way you will understand why architectures, such as Flux, are needed.

## Initial Data Model

Often a good way to begin designing an application is to start with the data. We could model a list of notes as follows:

```javascript
[
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

We could have skipped ids in our definition. This would become problematic as we grow the application and add the concept of references to it. Each Kanban lane needs to be able to refer to some notes after all. By adopting proper indexing early on, we save effort later.

T> Another interesting way to approach data would be to normalize it. In this case we would end up with a `[<id> -> { id: '...', task: '...' }]` kind of structure. Even though there's some redundancy, it is convenient to operate using the structure as it gives us easy access by index. The structure becomes even more useful once we start getting references between data entities.

## Rendering Initial Data

Now that we have a rough data model together, we can try rendering it through React. We are going to need a component to hold the data. Let's call it `Notes` for now. We can grow from that as we want more functionality. Set up a file with a small dummy component as follows:

**app/Notes.jsx**

```javascript
import React from 'react';

const notes = [
  {
    id: '4e81fc6e-bfb6-419b-93e5-0242fb6f3f6a',
    task: 'Learn React'
  },
  {
    id: '11bbffc8-5891-4b45-b9ea-5c99aadf870f',
    task: 'Do laundry'
  }
];

export default () => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}>{note.task}</li>
    )}</ul>
  );
}
```

We are using various important features of JSX in the snippet above. I have annotated the difficult parts below:

* `<ul>{notes.map(note => ...}</ul>` - `{}`'s allow us to mix JavaScript syntax within JSX. `map` returns a list of `li` elements for React to render.
* `<li key={note.id}>{note.task}</li>` - In order to tell React in which order to render the elements, we use the `key` property. It is important that this is unique or else React won't be able to figure out the correct order in which to render. If not set, React will give a warning. See [Multiple Components](https://facebook.github.io/react/docs/multiple-components.html) for more information.

We also need to refer to the component from the entry point of our application:

**app/index.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
leanpub-start-insert
import Notes from './Notes';
leanpub-end-insert

if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}

ReactDOM.render(
leanpub-start-delete
  <div>Hello world</div>,
leanpub-end-delete
leanpub-start-insert
  <Notes />,
leanpub-end-insert
  document.getElementById('app')
);
```

If you run the application now, you should see a list of notes. It's not particularly pretty or useful yet, but it's a start:

![A list of notes](images/react_03.png)

T> We need to `import` React to *Notes.jsx* given there's that JSX to JavaScript transformation going on. Without it the resulting code would fail.

## Generating the Ids

Normally the problem of generating the ids is solved by a back-end. As we don't have one yet, we'll use a standard known as [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) instead. It allows us to generate unique ids. We'll be using a Node.js implementation known as *uuid* and its `uuid.v4` variant. It will give us ids, such as `1c8e7a12-0b4c-4f23-938c-00d7161f94fc` and they are guaranteed to be unique with a very high probability.

To connect the generator with our application, modify it as follows:

**app/Notes.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import uuid from 'uuid';
leanpub-end-insert

const notes = [
  {
leanpub-start-delete
    id: '4e81fc6e-bfb6-419b-93e5-0242fb6f3f6a',
leanpub-end-delete
leanpub-start-insert
    id: uuid.v4(),
leanpub-end-insert
    task: 'Learn React'
  },
  {
leanpub-start-delete
    id: '11bbffc8-5891-4b45-b9ea-5c99aadf870f',
leanpub-end-delete
leanpub-start-insert
    id: uuid.v4(),
leanpub-end-insert
    task: 'Do laundry'
  }
];

...
```

The application should look the same as before after this change. If you try debugging it, you can see the ids should change if you refresh. You can verify this easily either by inserting a `console.log(notes);` line or a [debugger;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement within the component function.

The `debugger;` statement is particularly useful as it tells the browser to break execution. This way you can examine the current call stack and examine the available variables. If you are unsure of something, this is a great way to debug and figure out what's going on.

`console.log` is a lighter alternative. You can design a logging system around it. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Console) and [Chrome documentation](https://developers.google.com/web/tools/chrome-devtools/debug/console/console-reference) for the full API.

T> If you are interested in the math behind id generation, check out [the calculations at Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Random_UUID_probability_of_duplicates) for details. You'll see that the possibility for collisions is somewhat miniscule and something we don't have to worry about.

## Adding New Notes to the List

Even though we can display individual notes now, we are still missing a lot of logic to make our application useful. A logical way to start would be to implement adding new notes to the list. To achieve this, we need to expand the application a little.

### Defining a Stub for `App`

To enable adding new notes, we should have a button for that somewhere. Currently our `Notes` component does only one thing, displaying notes. That's perfectly fine. To make room for more functionality, we could add a concept known as `App` on top of that. This component will orchestrate the execution of our application. We can add the button we want there and manage state as well as we add notes.

At a basic level `App` could look like this:

**app/components/App.jsx**

```javascript
import React from 'react';
import Notes from './Notes';

export default () => <Notes />;
```

All it does now is to render `Notes` and it's going to take more work to make it useful. To glue `App` to our application, we still need to tweak the entry point as follows:

**app/index.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
leanpub-start-delete
import Notes from './Notes';
leanpub-end-delete
leanpub-start-insert
import App from './App';
leanpub-end-insert

if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}

ReactDOM.render(
leanpub-start-delete
  <Notes />,
leanpub-end-delete
leanpub-start-insert
  <App />,
leanpub-end-insert
  document.getElementById('app')
);
```

If you run the application now, it should exactly the same as before. We have room to grow now, though.

### Adding a Stub for *Add* Button

A good step towards something more functional is to add a stub for an *add* button. To achieve this, `App` needs to evolve:

**app/App.jsx**

```
import React from 'react';
import Notes from './Notes';

leanpub-start-delete
export default () => <Notes />;
leanpub-end-delete
leanpub-start-insert
export default () => (
  <div>
    <button onClick={() => console.log('add note')}>+</button>
    <Notes />
  </div>
);
leanpub-end-insert
```

If you press the button we added, you should see an "add note" message at the browser console. We still have to connect the button with our data somehow. Currently the data is trapped within the `Notes` component so before we can do that, we need to extract it to the `App` level.

T> Given React components have to return a single element, we had to wrap our application within a `div`.

### Pushing Data to `App`

To push the data to `App` we need to do two modifications. First we need to literally move it there and pass the data through a prop to `Notes`. After that we need to tweak `Notes` to operate based on the new logic. Once we have achieved this, we can start thinking about adding new notes.

The `App` side is simple:

**app/App.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import uuid from 'uuid';
leanpub-end-insert
import Notes from './Notes';

leanpub-start-insert
const notes = [
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

export default () => (
  <div>
    <button onClick={() => console.log('add note')}>+</button>
    <Notes notes={notes} />
  </div>
);
```

This won't do much until we tweak `Notes` as well:

**app/Notes.jsx**

```javascript
import React from 'react';
leanpub-start-remove
import uuid from 'uuid';

const notes = [
  {
    id: uuid.v4(),
    task: 'Learn React'
  },
  {
    id: uuid.v4(),
    task: 'Do laundry'
  }
];

export default () => {
leanpub-end-remove
export default ({notes}) => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}>{note.task}</li>
    )}</ul>
  );
}
```

Our application should look exactly the same as before after these changes. Now we are ready to add some logic to it, though.

T> The way we extract `notes` from `props` (the first parameter) is a standard trick you see with React. If you want to access the remaining `props`, you can use `{notes, ...props}` kind of syntax. We'll use this later so you can see the point of doing this better.

### Pushing State to `App`

Now that we have all things in the right place, we can start to worry about modifying the data. If you have used JavaScript before, the intuitive way to handle it would be to set up an event handler like `() => notes.push({id: uuid.v4(), task: 'New task'})`. If you try this, you'll see nothing happens.

The reason why is simple. React cannot notice you have changed the structure and react accordingly (that is, trigger `render()`). To overcome this issue, we can implement our modification through React's own API. This makes it notice that the structure has changed. As a result it is able to `render()` as we might expect.

As of the time of writing the function based component definition doesn't support the concept of state. The problem is that these components don't have a backing instance. It is something in which you would attach state. We might see a way to solve this through functions only in the future but for now we have to use a heavier duty alternative.

In addition to functions, you can create React components through `React.createClass` or a class based component definition. We'll opt for the latter in this book. Function based components are a great default, though. The added benefit is that they allow a series of optimizations.

In order to convert our `App` to a class based component, adjust it as follows to push the state within:

**app/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';

leanpub-start-remove
const notes = [
  {
    id: uuid.v4(),
    task: 'Learn React'
  },
  {
    id: uuid.v4(),
    task: 'Do laundry'
  }
];

export default () => (
  <div>
    <button onClick={() => notes.push({id: uuid.v4(), task: 'New task'})}>+</button>
    <Notes notes={notes} />
  </div>
);
leanpub-end-remove

leanpub-start-insert
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    }
  }
  render() {
    const {notes} = this.state;

    return (
      <div>
        <button
          onClick={() => notes.push({id: uuid.v4(), task: 'New task'})}>+</button>
        <Notes notes={notes} />
      </div>
    );
  }
}
leanpub-end-insert
```

After this change `App` owns the state even though the application still should look the same as before. Now, however, we can start to use React's API to modify the state.

T> Data management solutions, such as [MobX](https://mobxjs.github.io/mobx/), solve this problem in their own way. Using them you annotate your data structures and React components and leave the updating problem to them. We'll get back to the topic of data management later in this book in detail.

T> In the earlier versions of React, you could achieve the same result with `getInitialState`.

T> We're passing `props` to `super` by convention. If you don't pass it, `this.props` won't get set! Calling `super` invokes the same method of the parent class and you see this kind of usage in object oriented programming often.

### Implementing Note Adding Logic

All the effort will pay off soon. We have just one step left. We will need to use React's API to manipulate the state and to finish our feature. React provides a method known as `setState` for this purpose. In this case we will need to call it like this: `this.setState({... new state goes here ...}, () => ...)`.

The callback is optional. React will call it when the state has been set and often you don't need to care about it at all. Once `setState` has gone through, React will call `render()`. The asynchronous API might feel a little strange at first but it will allow React to optimize its performance by using techniques such as batching updates. This all ties back to the concept of Virtual DOM.

One way to trigger `setState` would be to push the associated logic to a method of its own and then call it when a new note is added. The class based component definition doesn't bind custom methods like this by default so we will need to handle the binding somehow. It would be to do that at the `constructor`, `render()`, or by using a specific syntax. I'm opting for the syntax option in this book. Read the *Language Features* appendix to learn more.

To tie the logic with the button, adjust `App` as follows:

**app/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const {notes} = this.state;

    return (
      <div>
leanpub-start-remove
        <button onClick={() => console.log('add note')}>+</button>
leanpub-end-remove
leanpub-start-insert
        <button onClick={this.addNote}>+</button>
leanpub-end-insert
        <Notes notes={notes} />
      </div>
    );
  }
leanpub-start-insert
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
  }
leanpub-end-insert
}
```

Given we are binding to an instance here, the hot loading setup cannot pick up the change. To try out the new feature, refresh the browser and try clicking the `+` button. You should seem something:

![Notes with a plus](images/react_05.png)

We are still missing two crucial features: editing and deleting notes. It's a good time to focus on those next. Let's do deleting first and handle editing after that.

T> If we were operating with a back-end, we would trigger a query here and capture the id from the response. For now it's enough to just generate an entry and a custom id.

T> You could use `this.setState({notes: [...this.state.notes, {id: uuid.v4(), task: 'New task'}]})` to achieve the same result. This [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) can be used with function parameters as well. See the *Language Features* appendix for more information.

T> Using [autobind-decorator](https://www.npmjs.com/package/autobind-decorator) would be a valid alternative for property initializers. In this case we would use `@autobind` annotation either on class or method level. To learn more about decorators, read the *Understanding Decorators* appendix.

## Deleting Notes

One easy way to handle deleting notes is to render a "x" button for each `Note`. When it's clicked we will simply delete the note in question from our data structure. As before, we can start by adding stubs in place. This might be a good place to separate the concept of a `Note` from the current `Notes` component.

Often you work this way with React. You set up components only to realize they are composed of smaller components that can be extracted. This process of separation is cheap. Sometimes it can even improve the performance of your application as you can optimize the rendering of smaller parts.

### Separating `Note`

To keep the list formatting aspect separate from a `Note` we can model it using a `div` like this:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default ({task}) => <div>{task}</div>;
```

Remember that this declaration is equivalent to:

```javascript
import React from 'react';

export default (props) => <div>{props.task}</div>;
```

As you can see, destructuring removes some noise from the code and keeps our implementation simple.

To make our application use the new component, we need to patch `Notes` as well:

**app/components/Notes.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import Note from './Note';
leanpub-end-insert

export default ({notes}) => {
  return (
    <ul>{notes.map(note =>
leanpub-start-remove
      <li key={note.id}>{note.task}</li>
leanpub-end-remove
leanpub-start-insert
      <li key={note.id}><Note task={note.task} /></li>
leanpub-end-insert
    )}</ul>
  );
}
```

The application should look exactly the same after these changes. Now we have room to expand it further.

### Adding a Stub for `onDelete` Callback

To capture the intent to delete a `Note`, we'll need to extend it to include a button that triggers a `onDelete` callback. We can connect our logic with that after this step is complete. Consider the code below:

**app/components/Note.jsx**

```javascript
import React from 'react';

leanpub-start-remove
export default ({task}) => <div>{task}</div>;
leanpub-end-remove
leanpub-start-insert
export default ({task, onDelete}) => (
  <div>
    <span>{task}</span>
    <button onClick={onDelete}>x</button>
  </div>
);
leanpub-end-insert
```

You should see small "x"s next to each Note:

![Notes with delete controls](images/react_06.png)

They won't do anything yet. That's the next step.

### Communicating Deletion to `App`

Now that we have the controls we need, we can start thinking about how to connect them with the data at `App`. In order to delete a note, we'll need to know its id. After that we can implement the logic based on that at `App`. To illustrate the idea, we'll want to end up with a situation like this:

![`onDelete` flow](images/bind.png)

T> That `e` represents a DOM event you might be used to. We can do things like stop event propagation through it. This will come in handy as we want more control over the application behavior.

To achieve the scheme, we are going to need a new prop at `Notes`. We will also need to bind the id of each note to the `onDelete` callback to match the logic. Here's the full implementation of `Notes`:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';

leanpub-start-remove
export default ({notes}) => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}><Note task={note.task} /></li>
    )}</ul>
  );
}
leanpub-end-remove
leanpub-start-insert
export default ({notes, onDelete=() => {}}) => {
  return (
    <ul>{notes.map(({id, task}) =>
      <li key={id}>
        <Note
          onDelete={onDelete.bind(null, id)}
          task={task} />
      </li>
    )}</ul>
  );
}
leanpub-end-insert
```

To keep our code from crashing if `onDelete` is not provided, I defined a dummy callback for it. Another good way to handle this would have been to go through `propTypes` as discussed in the "Typing with React" chapter.

Now that have the hooks in place, we can use them at `App`:

**app/components/App.jsx**

```javascript
import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';

export default class App extends React.Component {
  constructor(props) {
    ...
  }
  render() {
    const {notes} = this.state;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
leanpub-start-remove
        <Notes notes={notes} />
leanpub-end-remove
leanpub-start-insert
        <Notes notes={notes} onDelete={this.deleteNote} />
leanpub-end-insert
      </div>
    );
  },
  addNote = () => {
    ...
  }
leanpub-start-insert
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
  }
leanpub-end-insert
}
```

After these changes you should be able to delete notes. To prepare for the future I added an extra line in form of `e.stopPropagation()`. The idea of this is to tell the DOM to stop bubbling events. In short, we'll avoid triggering possible other events elsewhere in the structure if we delete a note.

We are missing one more feature to call this done. Editing is hardest of them all. To do it right, we can do it inline.

T> You may need to trigger a refresh at the browser to make deletion to work. Hit *CTRL/CMD-R*.

## Editing `Notes`

XXX

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

## Conclusion

You can get quite far just with vanilla React. The problem is that we are starting to mix data related concerns and logic with our view components. And our application is somewhat ugly right now. Before sorting out the data concerns, we could make the application look a little nicer.
