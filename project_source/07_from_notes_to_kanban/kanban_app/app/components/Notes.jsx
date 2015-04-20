'use strict';
import React from 'react';
import Note from './Note';
import noteActions from '../actions/NoteActions';

export default class Notes extends React.Component {
  constructor(props: {
    cursor: object; // XXX: replace with a decorator based solution
  }) {
    super(props);

    this.actions = noteActions(props.cursor);
  }
  render() {
    var notes = this.props.cursor.get();

    return (
      <div className='notes'>
        <button onClick={this.addItem.bind(this)}>+</button>

        <ul>{notes.map((note, i) =>
          <li key={'note' + i}>
            <Note
              task={note.task}
              onEdit={this.itemEdited.bind(this, i)} />
          </li>
        )}</ul>
      </div>
    );
  }
  addItem() {
    this.actions.create('New task');
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
