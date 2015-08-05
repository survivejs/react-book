import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = this.notes || [];

    this.exportPublicMethods({
      get: this.get.bind(this)
    });
  }
  create(note) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat(note)
    });
  }
  update({id, task}) {
    const notes = this.notes;
    const targetId = notes.findIndex((note) => note.id === id);

    notes[targetId].task = task;

    this.setState({notes});
  }
  delete(id) {
    const notes = this.notes;
    const targetId = notes.findIndex((note) => note.id === id);

    this.setState({
      notes: notes.slice(0, targetId).concat(notes.slice(targetId + 1))
    });
  }
  get(ids) {
    const notes = this.notes || [];
    const notesIds = notes.map((note) => note.id);

    if(ids) {
      return ids.map((id) => notes[notesIds.indexOf(id)]);
    }

    return [];
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
