import React from 'react';
import Note from './Note';
import Editable from './Editable';

export default ({
  notes,
  onValueClick=() => {}, onEdit=() => {}, onDelete=() => {}
}) => {
  return (
    <ul>{notes.map(({id, editing, task}) =>
      <li key={id}>
        <Note>
          <Editable
            className="editable"
            editing={editing}
            value={task}
            onValueClick={onValueClick.bind(null, id)}
            onEdit={onEdit.bind(null, id)} />
          <button onClick={onDelete.bind(null, id)}>x</button>
        </Note>
      </li>
    )}</ul>
  );
}