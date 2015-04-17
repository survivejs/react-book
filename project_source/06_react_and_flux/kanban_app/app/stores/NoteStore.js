'use strict';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);
  }
  init(data) {
    this.setState(data || {notes: []});
  }
  create(task) {
    this.notes.push({task});
  }
  update({id, task}) {
    this.notes[id].task = task;
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1))
    });
  }
}

export default alt.createStore(NoteStore, 'NoteStore');
