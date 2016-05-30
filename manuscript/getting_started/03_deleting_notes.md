## Deleting `Notes`

One easy way to handle deleting notes is to render a "x" button for each `Note`. When it's clicked we will simply delete the note in question from our data structure. As before, we can start by adding stubs in place. This might be a good place to separate the concept of a `Note` from the current `Notes` component.

Often you work this way with React. You set up components only to realize they are composed of smaller components that can be extracted. This process of separation is cheap. Sometimes it can even improve the performance of your application as you can optimize the rendering of smaller parts.

## Separating `Note`

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
leanpub-start-delete
      <li key={note.id}>{note.task}</li>
leanpub-end-delete
leanpub-start-insert
      <li key={note.id}><Note task={note.task} /></li>
leanpub-end-insert
    )}</ul>
  );
}
```

The application should look exactly the same after these changes. Now we have room to expand it further.

## Adding a Stub for `onDelete` Callback

To capture the intent to delete a `Note`, we'll need to extend it to include a button that triggers a `onDelete` callback. We can connect our logic with that after this step is complete. Consider the code below:

**app/components/Note.jsx**

```javascript
import React from 'react';

leanpub-start-delete
export default ({task}) => <div>{task}</div>;
leanpub-end-delete
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

## Communicating Deletion to `App`

Now that we have the controls we need, we can start thinking about how to connect them with the data at `App`. In order to delete a note, we'll need to know its id. After that we can implement the logic based on that at `App`. To illustrate the idea, we'll want to end up with a situation like this:

![`onDelete` flow](images/bind.png)

T> That `e` represents a DOM event you might be used to. We can do things like stop event propagation through it. This will come in handy as we want more control over the application behavior.

To achieve the scheme, we are going to need a new prop at `Notes`. We will also need to `bind` the id of each note to the `onDelete` callback to match the logic. Here's the full implementation of `Notes`:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';

leanpub-start-delete
export default ({notes}) => {
  return (
    <ul>{notes.map(note =>
      <li key={note.id}><Note task={note.task} /></li>
    )}</ul>
  );
}
leanpub-end-delete
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
leanpub-start-delete
        <Notes notes={notes} />
leanpub-end-delete
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

T> You may need to trigger a refresh at the browser to make deletion to work. Hit *CTRL/CMD-R*.

## Understanding React Components

![Lifecycle methods](images/lifecycle.png)

Understanding how `props` and `state` work is important. Component lifecycle is another key concept. We already touched on it earlier, but it's a good idea to understand it in more detail. You can achieve most tasks in React by applying these concepts throughout your application. React provides the following lifecycle methods:

* `componentWillMount()` gets triggered once before any rendering. One way to use it would be to load data asynchronously there and force rendering through `setState`.
* `componentDidMount()` gets triggered after initial rendering. You have access to the DOM here. You could use this hook to wrap a jQuery plugin within a component, for instance.
* `componentWillReceiveProps(object nextProps)` triggers when the component receives new props. You could, for instance, modify your component state based on the received props.
* `shouldComponentUpdate(object nextProps, object nextState)` allows you to optimize the rendering. If you check the props and state and see that there's no need to update, return `false`.
* `componentWillUpdate(object nextProps, object nextState)` gets triggered after `shouldComponentUpdate` and before `render()`. It is not possible to use `setState` here, but you can set class properties, for instance. [The official documentation](https://facebook.github.io/react/docs/advanced-performance.html#shouldcomponentupdate-in-action) goes into greater details. In short, this is where immutable data structures, such as [Immutable.js](https://facebook.github.io/immutable-js/), come handy thanks to their easy equality checks.
* `componentDidUpdate()` is triggered after rendering. You can modify the DOM here. This can be useful for adapting other code to work with React.
* `componentWillUnmount()` is triggered just before a component is unmounted from the DOM. This is the ideal place to perform cleanup (e.g., remove running timers, custom DOM elements, and so on).

Beyond the lifecycle methods, there are a variety of [properties and methods](https://facebook.github.io/react/docs/component-specs.html) you should be aware of if you are going to use `React.createClass`:

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

This could also be written as:

```javascript
class Note {
  static willTransitionTo() {...}
  render() {
    ...
  }
}

export default Note;
```

Some libraries, such as React DnD, rely on static methods to provide transition hooks. They allow you to control what happens when a component is shown or hidden. By definition statics are available through the class itself.

Both class and `React.createClass` based components allow you to document the interface of your component using `propTypes`. To dig deeper, read the *Typing with React* chapter.

Both support `render()`, the workhorse of React. In function based definition `render()` is the function itself. `render()` simply describes what the component should look like. In case you don't want to render anything, return either `null` or `false`.

> React provides a feature known as [refs](https://facebook.github.io/react/docs/more-about-refs.html) so you can perform operations on React elements through DOM. This is an escape hatch designed for those cases where React itself doesn't cut it. Performing measurements is a good example. Refs need to be attached to stateful components in order to work.

## React Component Conventions

I prefer to have the `constructor` first, followed by lifecycle methods, `render()`, and finally, methods used by `render()`. I like this top-down approach as it makes it straightforward to follow code. Some prefer to put the methods used by `render()` before it. There are also various naming conventions. It is possible to use `_` prefix for event handlers, too.

In the end, you will have to find conventions that you like and which work the best for you. You can enforce a convention by using a linter such as [ESLint](http://eslint.org/). Using a linter decreases the amount of friction when working on code written by others.

Even on personal projects, using tools to verify syntax and standards for you can be useful. It lessens the amount and severity of mistakes and allows you to spot them early. In addition, by setting up a continuous integration system you can test against multiple platforms and catch possible regressions early. This is particularly important if you are using lenient version ranges. Sometimes dependencies might have problems and it's good to catch those.

## Conclusion

Working with React is often like this. You will identify components and flows based on your needs. Here we needed model a `Note` and then design a data flow so that we have enough control at the right place.

We are missing one more feature to call the first part of Kanban done. Editing is hardest of them all. To do it right, we can do it *inline*. By implementing a proper component now, we'll save time later as we have to edit something else.
