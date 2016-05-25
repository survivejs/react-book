import React from 'react';
import Note from './Note';
import Editable from './Editable';

export default ({
  notes,
  onValueClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => {
  return (
    <ul className="notes">{notes.map(({id, editing, task}) =>
      <li key={id}>
        <Note className="note">
          <Editable
            editing={editing}
            value={task}
            onValueClick={onValueClick.bind(null, id)}
            onEdit={onEdit.bind(null, id)} />
          <button
            className="delete"
            onClick={onDelete.bind(null, id)}>x</button>
        </Note>
      </li>
    )}</ul>
  );
}