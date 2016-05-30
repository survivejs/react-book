# Styling the Notes Application

Aesthetically, our current application is very barebones. As pretty applications are more fun to use, we can do a little something about that. In this case we'll be sticking to an old skool way of styling.

In other words, we'll sprinkle some CSS classes around and then apply CSS selectors based on those. The *Styling React* chapter discusses various other approaches in greater detail.

## Styling "Add Note" Button

To style the "Add Note" button we'll need to attach a class to it first:

**app/components/App.jsx**

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
leanpub-start-delete
        <button onClick={this.addNote}>+</button>
leanpub-end-delete
leanpub-start-insert
        <button className="add-note" onClick={this.addNote}>+</button>
leanpub-end-insert
        <Notes
          notes={notes}
          onNoteClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
      </div>
    );
  }
  ...
}
```

We also need to add corresponding styling:

**app/main.css**

```css
...

leanpub-start-insert
.add-note {
  background-color: #fdfdfd;

  border: 1px solid #ccc;
}
leanpub-end-insert
```

A more general way to handle this would be to set up a `Button` component and style it. That would give us nicely styled buttons across the application.

## Styling `Notes`

Currently the `Notes` list looks a little rough. We can improve that by hiding the list specific styling. We can also fix `Notes` width so if the user enter a long task, our user interface still remains fixed to some maximum width. A good first step is to attach some classes to `Notes` so it's easier to style:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';
import Editable from './Editable';

export default ({
  notes,
  onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => {
  return (
leanpub-start-delete
    <ul>{notes.map(({id, editing, task}) =>
leanpub-end-delete
leanpub-start-insert
    <ul className="notes">{notes.map(({id, editing, task}) =>
leanpub-end-insert
      <li key={id}>
leanpub-start-delete
        <Note onClick={onNoteClick.bind(null, id)}>
leanpub-end-delete
leanpub-start-insert
        <Note className="note" onClick={onNoteClick.bind(null, id)}>
leanpub-end-insert
          <Editable
            className="editable"
            editing={editing}
            value={task}
            onEdit={onEdit.bind(null, id)} />
leanpub-start-delete
          <button onClick={onDelete.bind(null, id)}>x</button>
leanpub-end-delete
leanpub-start-insert
          <button
            className="delete"
            onClick={onDelete.bind(null, id)}>x</button>
leanpub-end-insert
        </Note>
      </li>
    )}</ul>
  );
}
```

In order to eliminate the list specific styling, we can apply rules like these:

**app/main.css**

```css
...

leanpub-start-insert
.notes {
  margin: 0.5em;
  padding-left: 0;

  max-width: 10em;
  list-style: none;
}
leanpub-end-insert
```

## Styling Individual `Note`s

There is still `Note` related portions left to style. Before attaching any rules, we should make sure we have good styling hooks on `Editable`:

**app/components/Editable.jsx**

```javascript
import React from 'react';
leanpub-start-insert
import classnames from 'classnames';
leanpub-end-insert

leanpub-start-delete
export default ({editing, value, onEdit, ...props}) => {
leanpub-end-delete
leanpub-start-insert
export default ({editing, value, onEdit, className, ...props}) => {
leanpub-end-insert
  if(editing) {
leanpub-start-delete
    return <Edit value={value} onEdit={onEdit} {...props} />;
leanpub-end-delete
leanpub-start-insert
    return <Edit
      className={className}
      value={value}
      onEdit={onEdit}
      {...props} />;
leanpub-end-insert
  }

leanpub-start-delete
  return <span {...props}>{value}</span>;
leanpub-end-delete
leanpub-start-insert
  return <span className={classnames('value', className)} {...props}>
    {value}
  </span>;
leanpub-end-insert
}

class Edit extends React.Component {
  render() {
leanpub-start-delete
    const {value, ...props} = this.props;
leanpub-end-delete
leanpub-start-insert
    const {className, value, ...props} = this.props;
leanpub-end-insert

leanpub-start-delete
    return <input
      type="text"
leanpub-end-delete
leanpub-start-insert
    return <input
      type="text"
      className={classnames('edit', className)}
leanpub-end-insert
      autoFocus={true}
      defaultValue={value}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter}
      {...props} />;
  }
  ...
}
```

There are enough classes to style the remainder now. We can show a shadow below the hovered note. It's also a good touch to show the delete control on hover as well. Unfortunately this won't work on touch based interfaces, but it's good enough for this demo:

**app/main.css**

```css
...

leanpub-start-insert
.note {
  overflow: auto;

  margin-bottom: 0.5em;
  padding: 0.5em;

  background-color: #fdfdfd;
  box-shadow: 0 0 0.3em .03em rgba(0,0,0,.3);
}
.note:hover {
  box-shadow: 0 0 0.3em .03em rgba(0,0,0,.7);

  transition: .6s;
}

.note .value {
  /* force to use inline-block so that it gets minimum height */
  display: inline-block;
}

.note .editable {
  float: left;
}
.note .delete {
  float: right;

  padding: 0;

  background-color: #fdfdfd;
  border: none;

  cursor: pointer;

  visibility: hidden;
}
.note:hover .delete {
  visibility: visible;
}
leanpub-end-insert
```

Assuming everything went fine, your application should look roughly like this now:

![Styled Notes Application](images/style_01.png)

## Conclusion

This is only one way to style a React application. Relying on classes like this will become problematic as the scale of your application grows. That is why there are alternative ways to style that address this particular problem. The *Styling React* chapter touches a lot of those techniques.

It can be a good idea to try out a couple of alternative ways to find something you are comfortable with. Particularly CSS Modules are promising as they solve the fundamental problem of CSS - the problem of globals. The technique allows styling locally per component. That happens to fit React very well since we are dealing with components by default.

Now that we have a simple Notes application up and running, we can begin to generalize it into a full blown Kanban. It will take some patience as we'll need to improve the way we are dealing with the application state. We also need to add some missing structure and make sure it's possible to drag and drop things around. Those are good goals for the next part.
