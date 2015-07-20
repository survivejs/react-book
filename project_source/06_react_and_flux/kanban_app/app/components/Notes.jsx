import React from 'react';
import Note from './Note';

export default class Notes extends React.Component {
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <li className='note' key={'note' + i}>
          <Note
            value={note.task}
            onEdit={this.props.onEdit.bind(null, i)} />
        </li>
      )}</ul>
    );
  }
}
