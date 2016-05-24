# Editing `Notes`

Editing notes is a similar problem as deleting them. The data flow is exactly the same. We'll need to define an `onEdit` callback and  `bind` an id of the note being edited at `Notes`.

What makes this scenario difficult is the user interface requirement. It's not enough just to have a button. We'll need some way to allow the user to input a new value which we can then commit to the data model.

One way to achieve this is to implement so called **inline editing**. The idea is that when a user click a note, we'll show an input. After the user has finished editing and signals that to use either by triggering the `blur` event or by hitting *enter*, we'll capture the value and update.

## Implementing `Editable`

To keep the application clean, I'll wrap this behavior into a component known as `Editable`. It will give us an API like this:

```javascript
<Editable editing={editing} value={task}
  onEdit={onEdit.bind(null, id)}
  onValueClick={onValueClick.bind(null, id)}>
```

This is an example of a **controlled** component. We'll control the editing state explicitly from outside of the component. This gives us more power, but it also makes `Editable` more involved to use.

T> It can be a good idea to name your callbacks using `on` prefix. This will allow you to distinguish them from other props and keep your code a little tidier.

### Controlled vs. Uncontrolled Design

An alternative way to handle this would have been to leave the control over the `editing` state to `Editable`. This **uncontrolled** way of designing can be valid if you don't want to do anything with the state outside of the component.

It is possible to use both of these designs together. You can even have a controlled component that has uncontrolled elements inside. In this case we'll end up using an uncontrolled design for the `input` that `Editable` will contain for example. Even that could be turned into something controlled should we want to.

Logically `Editable` consists of two separate portions. We'll need to display the `Value` while we are not `editing`. In case we are `editing`, we'll want to show an `Edit` control instead. In this case we'll settle for a simple input as that will do the trick.

Before digging into the details, we can implement a little stub and connect that to the application. This will give us the basic structure we need to grow the rest.

T> The official documentation of React discusses [controlled components](https://facebook.github.io/react/docs/forms.html) in greater detail.

## Extracting Rendering from `Note`

Currently `Note` controls what is rendered inside it. It renders the passed task and connects a deletion button. We could push `Editable` inside it and handle the wiring through `Note` interface. Even though that might be one valid way to do it, we can push the rendering concern on a higher level.

Having the concept of `Note` is useful especially when we'll expand the application further so there's no need to remove it. Instead, we can give the control over its rendering behavior to `Notes` and wire it there.

React provides a prop known as `children` for this purpose. Adjust `Note` and `Notes` as follows to push the control over `Note` rendering to `Notes`:

**app/Note.jsx**

```javascript
import React from 'react';

leanpub-start-remove
export default ({task, onDelete}) => (
  <div>
    <span>{task}</span>
    <button onClick={onDelete}>x</button>
  </div>
);
leanpub-end-remove
leanpub-start-insert
export default ({children, ...props}) => (
  <div {...props}>
    {children}
  </div>
);
leanpub-end-insert
```

**app/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';

export default ({notes, onDelete=() => {}}) => {
  return (
    <ul>{notes.map(({id, task}) =>
      <li key={id}>
leanpub-start-remove
        <Note
          onDelete={onDelete.bind(null, id)}
          task={task} />
leanpub-end-remove
leanpub-start-insert
        <Note>
          <span>{task}</span>
          <button onClick={onDelete.bind(null, id)}>x</button>
        </Note>
leanpub-end-insert
      </li>
    )}</ul>
  );
}
```

## Adding `Editable` Stub

We can model a rough starting point based on our specification as below. The idea is that we'll branch based on the `editing` prop and attach the props needed for implementing our logic:

**app/Editable.jsx**

```javascript
import React from 'react';

export default ({editing, value, onEdit, onValueClick, ...props}) => (
  <div {...props}>
    {editing ?
      <Edit value={value} onEdit={onEdit} /> :
      <Value value={value} onValueClick={onValueClick} />
    }
  </div>
)

const Value = ({onValueClick = () => {}, value}) => {
  return (
    <div onClick={onValueClick}>
      <span>{value}</span>
    </div>
  );
};

const Edit = ({onEdit = () => {}, value}) => {
  return (
    <div onClick={onEdit}>
      <span>edit: {value}</span>
    </div>
  );
};
```

To see our stub in action we still need to connect it with our application.

## Connecting `Editable` with `Notes`

We still need to replace the relevant portions of the code to point at `Editable`. There are more props to track and to connect:

**app/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';
leanpub-start-insert
import Editable from './Editable';
leanpub-end-insert

leanpub-start-remove
export default ({notes, onDelete=() => {}}) => {
leanpub-end-remove
leanpub-start-insert
export default ({
  notes,
  onValueClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => {
leanpub-end-insert
  return (
leanpub-start-remove
    <ul>{notes.map(({id, task}) =>
leanpub-end-remove
leanpub-start-insert
    <ul>{notes.map(({id, editing, task}) =>
leanpub-end-insert
      <li key={id}>
        <Note>
leanpub-start-remove
          <span>{task}</span>
leanpub-end-remove
leanpub-start-insert
          <Editable
            editing={editing}
            value={task}
            onValueClick={onValueClick.bind(null, id)}
            onEdit={onEdit.bind(null, id)} />
leanpub-end-insert
          <button onClick={onDelete.bind(null, id)}>x</button>
        </Note>
      </li>
    )}</ul>
  );
}
```

If everything went right, you should see something like this:

![Connected `Editable`](images/react_06.png)

## Tracking `Note` `editing` State

We are still missing logic needed to control the `Editable`. Given the state of our application is maintained at `App`, we'll need to deal with it there. It should set the `editable` flag of the edited note to `true` when we begin to edit and set it back to `false` when we complete the editing process. We should also adjust its `task` using the new value. For now we are interested in just getting the `editable` flag to work, though. Modify as follows:

**app/App.jsx**

```javascript
...

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
        <Notes notes={notes} onDelete={this.deleteNote} />
leanpub-end-remove
leanpub-start-insert
        <Notes
          notes={notes}
          onValueClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
leanpub-end-insert
      </div>
    );
  }
  deleteNote = (id, e) => {
    ...
  }
leanpub-start-insert
  activateNoteEdit = (id) => {console.log('act', id);
    this.setState({
      notes: this.state.notes.map(note => {
        if(note.id === id) {
          note.editing = true;
        }

        return note;
      })
    });
  }
  editNote = (id, task) => {
    this.setState({
      notes: this.state.notes.map(note => {
        if(note.id === id) {
          note.editing = false;
          note.task = task;
        }

        return note;
      })
    });
  }
leanpub-end-insert
}
```

If you try to edit a `Note` now, you should see something like this:

![Tracking `editing` state](images/react_07.png)

T> If we used a normalized data structure (i.e., `{<id>: {id: <id>, task: <str>}}`), it would be possible to write the operations using `Object.assign` and avoid mutation.

T> In order to clean up the code, you could extract a method to contain the logic shared by `activateNoteEdit` and `editNote`.

## Implementing `Edit`

We are missing one more part to make this work. Even though we can manage the `editing` state per `Note` now, we still can't actually edit them. For this purpose we need to expand `Edit` and make it render a text input for us.

In this case we'll be using **uncontrolled** design and extract the value of the input from the DOM only when we need it. We don't need more control than that here.

As a small user experience (UX) tweak we can also put the input cursor to the end of the field automatically when editing. Otherwise the user will have to move there. This can be achieved by using a ref.

Refs allow us to access the underlying DOM structure. The simplest way to use them is simply to set `ref="value"` and then use `this.refs.value`. Given refs rely on a backing instance (i.e., `this`), you will need to use either a `React.createClass` or `React.Component` based component to use them.

Another way to initialize a ref would be to pass a function to it. This will give us a chance to give something when the element gets mounted by React. That's ideal for us and we can patch the behavior of our input through this hook.

Consider the code below for the full implementation. Note how we are handling finishing the editing. There are a couple of cases to worry about, namely `onBlur` and `onKeyPress`:

**app/Editable.jsx**

```javascript
...

leanpub-start-remove
const Edit = ({onEdit = () => {}, value}) => {
  return (
    <div onClick={onEdit}>
      <span>edit: {value}</span>
    </div>
  );
};
leanpub-end-remove
leanpub-start-insert
class Edit extends React.Component {
  render() {
    const {value} = this.props;

    return <input type="text"
      ref={
        element => element ?
        element.selectionStart = value.length :
        null
      }
      autoFocus={true}
      defaultValue={value}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter} />;
  }
  checkEnter = (e) => {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  }
  finishEdit = (e) => {
    const value = e.target.value;

    if(this.props.onEdit) {
      this.props.onEdit(value);
    }
  }
}
leanpub-end-insert
```

If you refresh and edit a note, the commits should go through:

![Editing a `Note`](images/react_08.png)

## Conclusion

It took quite a few steps, but we can edit our notes now. Best of all, `Editable` should be useful whenever we need to edit some property. We could have extracted the logic later on as we see duplication, but this is one way to do it.

Even though the application kind of works, it is still quite ugly. We'll do something about that in the next chapter as we add basic styling to it.
