import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';
import LaneActions from '../actions/LaneActions';
import Notes from './Notes';
import Editable from './Editable';

const Lane = ({
  lane, notes, LaneActions, NoteActions, ...props
}) => {
  const editNote = (id, task) => {
    NoteActions.update({id, task, editing: false});
  }
  const addNote = e => {
    e.stopPropagation();

    const noteId = uuid.v4();

    NoteActions.create({
      id: noteId,
      task: 'New task'
    });
    LaneActions.attachToLane({
      laneId: lane.id,
      noteId
    });
  }
  const deleteNote = (noteId, e) => {
    e.stopPropagation();

    LaneActions.detachFromLane({
      laneId: lane.id,
      noteId
    });
    NoteActions.delete(noteId);
  }
  const activateNoteEdit = id => {
    NoteActions.update({id, editing: true});
  }
  const activateLaneEdit = () => {
    LaneActions.update({
      id: lane.id,
      editing: true
    });
  }
  const editName = name => {
    LaneActions.update({
      id: lane.id,
      name,
      editing: false
    });
  }
  const deleteLane = e => {
    // Avoid bubbling to edit
    e.stopPropagation();

    LaneActions.delete(lane.id);
  }

  return (
    <div {...props}>
      <div className="lane-header" onClick={activateLaneEdit}>
        <div className="lane-add-note">
          <button onClick={addNote}>+</button>
        </div>
        <Editable className="lane-name" editing={lane.editing}
          value={lane.name} onEdit={editName} />
        <div className="lane-delete">
          <button onClick={deleteLane}>x</button>
        </div>
      </div>
      <Notes
        notes={selectNotesByIds(notes, lane.notes)}
        onNoteClick={activateNoteEdit}
        onEdit={editNote}
        onDelete={deleteNote} />
    </div>
  );
}

function selectNotesByIds(allNotes, noteIds = []) {
  // `reduce` is a powerful method that allows us to
  // fold data. You can implement `filter` and `map`
  // through it. Here we are using it to concatenate
  // notes matching to the ids.
  return noteIds.reduce((notes, id) =>
    // Concatenate possible matching ids to the result
    notes.concat(
      allNotes.filter(note => note.id === id)
    )
  , []);
}

export default connect(
  ({NoteStore}) => ({
    notes: NoteStore.notes
  }), {
    NoteActions,
    LaneActions
  }
)(Lane)
