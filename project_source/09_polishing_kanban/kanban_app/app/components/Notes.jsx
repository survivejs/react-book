'use strict';
import React from 'react';
import { configureDragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/dist-modules/backends/HTML5';
import Note from './Note';
import noteActions from '../actions/NoteActions';

@configureDragDropContext(HTML5Backend)
export default class Notes extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);

    this.actions = noteActions(props.cursor);
  }
  render() {
    var notes = this.props.cursor.get();

    return (
      <ul className='notes'>
        {notes.map((note, i) =>
          <li key={'note' + i}>
            <Note
              id={note.id}
              task={note.task}
              onEdit={this.itemEdited.bind(this, i)}
              onMove={this.itemMoved.bind(this)}
            />
          </li>
        )}
      </ul>
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
  itemMoved(id, afterId) {
    if(id > afterId) {
      var tmp = id;
      id = afterId;
      afterId = tmp;
    }

    // XXXXX: decouple this from array ids
    var cursor = this.props.cursor;
    var notes = cursor.get();
    var start = notes.slice(0, id);
    var middle = notes.slice(id + 1, afterId);
    var end = notes.slice(afterId + 1);
    var newNotes = start.concat([notes[afterId]]).concat(middle).concat([notes[id]]).concat(end);

    //cursor.edit(newNotes);

    console.log(id, afterId);

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
