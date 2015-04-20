'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import Note from './Note';
import noteActions from '../actions/NoteActions';

// XXXXX: figure this out - lanes -> i -> notes -> j
@branch({
  cursors: function() {
    return {
      notes: ['lanes', this.props.index],
    };
  }
})
export default class Notes extends React.Component {
  constructor(props: {
    index: number;
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
