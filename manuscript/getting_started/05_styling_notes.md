# Styling a Note Application

Aesthetically, our current application is very barebones. As pretty applications are more fun to use, we can do a little something about that. In this case we'll be sticking to an old skool way of styling.

In other words, we'll sprinkle some CSS classes around and then apply CSS selectors based on those. The *Styling React* chapter discusses various other approaches in greater detail.

## Attaching Classes to Components

In order to make our application styleable, we will need to attach some classes to various parts of it:

**app/App.jsx**

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

**app/Notes.jsx**

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

**app/Note.jsx**

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

## Conclusion

Now that the application is starting to look good, we can improve the architecture of our application by introducing Flux to it. This is a good step towards improving the way we handle with state.
