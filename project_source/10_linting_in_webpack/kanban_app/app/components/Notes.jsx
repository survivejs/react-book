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
  }
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <Note onMove={NoteDndActions.move} className='note'
          key={'note-' + note.id} data={note}>
          <Editable
            value={note.task}
            onEdit={this.props.onEdit.bind(null, i)} />
        </Note>
      )}</ul>
    );
  }
}
