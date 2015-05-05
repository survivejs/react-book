'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import { configureDragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import Note from './Note';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function(props) {
    return {
      notes: props.notesCursor
    };
  }
})
@configureDragDropContext(HTML5Backend)
export default class Notes extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    notesCursor: Array;
  }, context) {
    super(props);

    this.actions = noteActions(context.cursors.notes);
  }
  render(props, context) {
    var notes = this.props.notes;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <li key={'note' + i}>
          <Note
            id={note.id}
            task={note.task}
            onEdit={this.itemEdited.bind(this, i)}
            moveNote={this.moveNote.bind(this)}
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
  moveNote(id, afterId) {
    console.log('move note', id, afterId);

    // TODO: baobab logic for splicing

    /*
    const { cards } = this.state;

    const card = cards.filter(c => c.id === id)[0];
    const afterCard = cards.filter(c => c.id === afterId)[0];
    const cardIndex = cards.indexOf(card);
    const afterIndex = cards.indexOf(afterCard);

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [cardIndex, 1],
          [afterIndex, 0, card]
        ]
      }
    }));
    */
  }
}
