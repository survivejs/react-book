import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];

    this.exportPublicMethods({
      getNotesByIds: this.getNotesByIds.bind(this)
    });
  }
  create(note) {
    const notes = this.notes;

    note.id = uuid.v4();

    this.setState({
      notes: notes.concat(note)
    });

    return note;
  }
  update(updatedNote) {
    const notes = this.notes.map(note => {
      if(note.id === updatedNote.id) {
        return Object.assign({}, note, updatedNote);
      }

      return note;
    });

    this.setState({notes});
  }
  delete(id) {
    this.setState({
      notes: this.notes.filter(note => note.id !== id)
    });
  }
  getNotesByIds(ids) {
    // `reduce` is a powerful method that allows us to
    // fold data. You can implement `filter` and `map`
    // through it. Here we are using it to concatenate
    // notes matching to the ids.
    return (ids || []).reduce((notes, id) =>
      // Concatenate possible matching ids to the result
      notes.concat(
        this.notes.filter(note => note.id === id)
      )
    , []);
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
