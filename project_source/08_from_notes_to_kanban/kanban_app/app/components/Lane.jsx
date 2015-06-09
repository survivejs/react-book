import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';

import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
  }) {
    super(props);
  }
  render() {
    const name = this.props.name;

    // TODO: deal with multiple contexts
    return (
      <div>
        <div className='header'>
          <div className='name'>{name}</div>
          <button onClick={this.addNote}>+</button>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            items: () => NoteStore.getState().notes || [],
          }}
        >
          <Notes onEdit={this.noteEdited} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      NoteActions.update(id, note);
    }
    else {
      NoteActions.remove(id);
    }
  }
}
