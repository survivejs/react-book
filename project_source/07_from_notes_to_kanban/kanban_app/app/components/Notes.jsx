'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Note from './Note';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function() {
    return {
      // XXX: not ideal since there's too much info about context
      // ideally this should be just ['notes']
      notes: ['lanes', this.props.index, 'notes'],
    };
  }
})
export default class Notes extends React.Component {
  static contextTypes = {
    tree: PropTypes.baobab,
    cursors: PropTypes.cursor
  }
  constructor(props: {
    index: number;
  }) {
    super(props);

    // XXX: no context here?
    console.log('context', this.context);

    // XXX: need to get reference to cursor here
    //noteActions(this.context.cursors.notes);
    this.actions = {
      update: () => {},
      remove: () => {},
    };
  }
  render() {
    var notes = this.props.notes;

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
