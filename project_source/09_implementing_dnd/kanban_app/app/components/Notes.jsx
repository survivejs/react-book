import React from 'react';

import Editable from './Editable';
import Note from './Note';
import NoteDndActions from '../actions/NoteDndActions';

export default class Notes extends React.Component {
  constructor(props: {
    items: Array;
    onEdit: Function;
  }) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    var notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note, i) {
    return (
      <Note onMove={NoteDndActions.move} className='note'
        key={`note${note.id}`} data={note}>
        <Editable
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </Note>
    );
  }
}
