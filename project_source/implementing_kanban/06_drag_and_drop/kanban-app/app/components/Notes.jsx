import React from 'react';
import Note from './Note';
import Editable from './Editable';

export default ({
  notes,
  onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => {
  return (
    <ul className="notes">{notes.map(({id, editing, task}) =>
      <li key={id}>
        <Note className="note" id={id}
          onClick={onNoteClick.bind(null, id)}
          onMove={({sourceId, targetId}) =>
            console.log('moving from', sourceId, 'to', targetId)}>
          <Editable
            editing={editing}
            value={task}
            onEdit={onEdit.bind(null, id)} />
          <button
            className="delete"
            onClick={onDelete.bind(null, id)}>x</button>
        </Note>
      </li>
    )}</ul>
  );
}