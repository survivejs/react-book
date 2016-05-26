import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';

@connect(({notes}) => ({notes}), {
  noteActions: NoteActions
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
    this.props.noteActions.create({id: uuid.v4(), task: 'New task'});
  }
  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.props.noteActions.delete(id);
  }
  activateNoteEdit = (id) => {
    this.props.noteActions.update({id, editing: true});
  }
  editNote = (id, task) => {
    this.setState({
      notes: this.state.notes.map(note => {
        if(note.id === id) {
          note.editing = false;
          note.task = task;
        }

        return note;
      })
    });
  }
}