import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Note from './Note';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function(props) {
    return {
      lanes: ['lanes'],
      notes: props.notesCursor
    };
  }
})
export default class Notes extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    notesCursor: Array;
    moveNote: Function;
    lane: Object;
  }, context) {
    super(props);

    this.actions = noteActions(
      context.cursors.lanes,
      context.cursors.notes
    );
  }
  render(props, context) {
    var notes = this.props.notes;
    var lane = this.props.lane;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <li key={'note' + i}>
          <Note
            id={note.id}
            lane={lane}
            task={note.task}
            onEdit={this.itemEdited.bind(this, i)}
            moveNote={this.props.moveNote}
          />
        </li>
      )}</ul>
    );
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
