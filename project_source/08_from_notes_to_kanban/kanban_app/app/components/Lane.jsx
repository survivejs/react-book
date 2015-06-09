import React from 'react';

/*
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
*/

export default class Note extends React.Component {
  constructor(props: {
    name: string;
  }) {
    super(props);
  }
  render() {
    const name = this.props.name;

    return (
      <div>
        <div className='name'>{name}</div>
        notes
      </div>
    );
  }
}
