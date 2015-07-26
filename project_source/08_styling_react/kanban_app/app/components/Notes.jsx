import React from 'react';
import Editable from './Editable';

export default class Notes extends React.Component {
  constructor(props: {
    items: Array;
    onEdit: Function;
  }) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    const notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note, i) {
    return (
      <li className='note' key={`note${i}`}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </li>
    );
  }
}
