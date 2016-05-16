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

We are still missing two crucial features: editing and deletion. It's a good time to focus on those next.

T> If we were operating with a back-end, we would trigger a query here and capture the id from the response. For now it's enough to just generate an entry and a custom id.

T> You could use `this.setState({notes: [...this.state.notes, {id: uuid.v4(), task: 'New task'}]})` to achieve the same result. This [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) can be used with function parameters as well. See the *Language Features* appendix for more information.

T> Using [autobind-decorator](https://www.npmjs.com/package/autobind-decorator) would be a valid alternative for property initializers. In this case we would use `@autobind` annotation either on class or method level. To learn more about decorators, read the *Understanding Decorators* appendix.

## Implementing Deletion

XXX

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

## Conclusion

You can get quite far just with vanilla React. The problem is that we are starting to mix data related concerns and logic with our view components. And our application is somewhat ugly right now. Before sorting out the data concerns, we could make the application look a little nicer.
