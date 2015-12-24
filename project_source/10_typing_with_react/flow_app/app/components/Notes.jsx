/* @flow */
import React from 'react';
import Editable from './Editable.jsx';
import Note from './Note.jsx';
import LaneActions from '../actions/LaneActions';

export default (props: {
  notes: Array<Object>,
  onValueClick: Function,
  onEdit: Function,
  onDelete: Function
}): ReactElement => {
  const {notes, onValueClick, onEdit, onDelete} = props;

  return (
    <ul className="notes">{notes.map((note) => {
      return (
        <Note className="note" id={note.id} key={note.id} onMove={LaneActions.move}>
          <Editable
            editing={note.editing}
            value={note.task}
            onValueClick={onValueClick.bind(null, note.id)}
            onEdit={onEdit.bind(null, note.id)}
            onDelete={onDelete.bind(null, note.id)} />
        </Note>
      );
    })}
    </ul>
  );
}
