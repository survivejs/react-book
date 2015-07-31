import uuid from 'node-uuid';
import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import LaneActions from '../actions/LaneActions';
import Editable from './Editable';

export default class Lane extends React.Component {
  render() {
    const {id, name, notes, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <Editable className='lane-name' value={name}
            onEdit={this.nameEdited.bind(null, id)} />
          <div className='lane-add-note'>
            <button onClick={this.addNote.bind(null, id)}>+</button>
          </div>
        </div>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => {
              const allNotes = NoteStore.getState().notes || [];
              const allNotesIds = allNotes.map((note) => note.id);

              if(notes) {
                return notes.map((note) => {
                  return allNotes[allNotesIds.indexOf(note)];
                });
              }

              return [];
            }
          } }
        >
          <Notes onEdit={this.noteEdited.bind(null, id)} />
        </AltContainer>
      </div>
    );
  }
  addNote(laneId) {
    const noteId = uuid.v4();

    NoteActions.create({id: noteId, task: 'New task'});
    LaneActions.attachToLane({laneId, noteId});
  }
  noteEdited(laneId, noteId, task) {
    if(task) {
      NoteActions.update({id: noteId, task});
    }
    else {
      NoteActions.delete(noteId);
      LaneActions.detachFromLane({laneId, noteId});
    }
  }
  nameEdited(id, name) {
    if(name) {
      LaneActions.update({id, name});
    }
    else {
      LaneActions.delete(id);
    }
  }
}