import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';

@connect(({NoteStore}) => ({notes: NoteStore.notes}), {
  NoteActions
})
export default class App extends React.Component {
  render() {
    const {notes} = this.props;

    return (
      <div>
        <button className="add-note" onClick={this.addNote}>+</button>
        <Notes
          notes={notes}
          onValueClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
      </div>
    );
  }
  addNote = () => {
    this.props.NoteActions.create({id: uuid.v4(), task: 'New task'});
  }
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.props.NoteActions.delete(id);
  }
  activateNoteEdit = (id) => {
    this.props.NoteActions.update({id, editing: true});
  }
  editNote = (id, task) => {
    const {NoteActions} = this.props;

    // Don't modify if trying to set an empty value
    if(!task.trim()) {
      NoteActions.update({id, editing: false});

      return;
    }

    NoteActions.update({id, task, editing: false});
  }
}
