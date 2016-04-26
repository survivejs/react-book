# Styling a Note Application

Aesthetically, our current application is very barebones. As pretty applications are more fun to use, we can do a little something about that. In this case we'll be sticking to an old skool way of styling. In other words, we'll sprinkle some CSS classes around and then apply CSS selectors based on those. The *Styling React* chapter discusses various other approaches in greater detail.

## Attaching Classes to Components

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

## Styling Components

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

In the end, you will have to find conventions that you like and which work the best for you. You can enforce a convention by using a linter such as [ESLint](http://eslint.org/). Using a linter decreases the amount of friction when working on code written by others. Even on personal projects, using tools to verify syntax and standards for you can be useful. It lessens the amount and severity of mistakes.

## Conclusion

Now that the application is starting to look good, we can improve the architecture of our application by introducing Flux to it. This is a good step towards improving the way we handle with state.
