import uuid from 'node-uuid';
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.addNote}>+</button>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => NoteStore.getState().notes
          } }
        >
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    NoteActions.create({id: uuid.v4(), task: 'New task'});
  }
  editNote(id, task) {
    NoteActions.update({id, task});
  }
  deleteNote(id) {
    NoteActions.delete(id);
  }
}
