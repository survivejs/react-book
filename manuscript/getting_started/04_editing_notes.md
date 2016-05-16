# Editing `Notes`

Editing notes is a similar problem as deleting them. The data flow is exactly the same. We'll need to define an `onEdit` callback and  `bind` an id of the note being edited at `Notes`.

What makes this scenario difficult is the user interface requirement. It's not enough just to have a button. We'll need some way to allow the user to input a new value which we can then commit to the data model.

One way to achieve this is to implement so called **inline editing**. The idea is that when a user click a note, we'll show an input. After the user has finished editing and signals that to use either by triggering the `blur` event or by hitting *enter*, we'll capture the value and update.

## Overview of `Editable`

To keep the application clean, I'll wrap this behavior into a component known as `Editable`. It will give us an API like this:

```javascript
<Editable editing={editing} value={task}
  onEdit={onEdit.bind(null, id)}
  onValueClick={onValueClick.bind(null, id)}>
  <Note
    onDelete={onDelete.bind(null, id))
    task={task}/>
</Editable>
```

This is an example of a **controlled** component. We'll control the editing state explicitly from outside of the component. This gives us more power, but it also makes `Editable` more involved to use.

An alternative way to handle this would have been to leave the control over the `editing` state to `Editable`. This **uncontrolled** way of designing can be valid if you don't want to do anything with the state outside of the component.

It is possible to use both of these designs together. You can even have a controlled component that has uncontrolled elements inside. In this case we'll end up using an uncontrolled design for the `input` that `Editable` will contain for example. Even that could be turned into something controlled should we want to.

T> React documentation discusses [controlled components](https://facebook.github.io/react/docs/forms.html) in greater detail.

## Implementing `Editable`

XXX

## Tracking `Note` `editing` State

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

XXX