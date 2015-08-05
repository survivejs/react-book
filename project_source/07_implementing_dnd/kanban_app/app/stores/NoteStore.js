import findIndex from 'find-index';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = this.notes || [];
  }
  create(note) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat(note)
    });
  }
  update({id, task}) {
    const notes = this.notes;
    const targetId = findIndex(notes, (note) => note.id === id);

    notes[targetId].task = task;

    this.setState({notes});
  }
  delete(id) {
    const notes = this.notes;
    const targetId = findIndex(notes, (note) => note.id === id);

    this.setState({
      notes: notes.slice(0, targetId).concat(notes.slice(targetId + 1))
    });
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
