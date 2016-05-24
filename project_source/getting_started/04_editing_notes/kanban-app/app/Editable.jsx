import React from 'react';

export default ({editing, value, onEdit, onValueClick, ...props}) => (
  <div {...props}>
    {editing ?
      <Edit value={value} onEdit={onEdit} /> :
      <Value value={value} onValueClick={onValueClick} />
    }
  </div>
)

const Value = ({value}) => <span>value: {value}</span>;

const Edit = ({value}) => <span>edit: {value}</span>;
