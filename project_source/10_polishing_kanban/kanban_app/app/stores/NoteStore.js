import uuid from 'node-uuid';
import findIndex from 'lodash/array/findIndex';
import isObject from 'lodash/lang/isObject';

export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  init(data) {
    this.setState(data ? migrate(data) : {notes: []});
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task, id: uuid.v4()}),
    });
  }
  createAfter({id, data}) {
    const notes = this.notes;
    const i = findIndex(notes, {id});

    if(i < 0) {
      return console.warn('Failed to create after id', id, notes);
    }

    notes.splice(i + 1, 0, data);

    this.setState({
      notes: notes,
    });
  }
  createBefore({id, data}) {
    const notes = this.notes;
    const i = findIndex(notes, {id});

    if(i < 0) {
      return console.warn('Failed to create before id', id, notes);
    }

    notes.splice(i, 0, data);

    this.setState({
      notes: notes,
    });
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({
      notes: notes,
    });
  }
  remove(id) {
    const notes = this.notes;

    if(isObject(id)) {
      id = findIndex(notes, id);
    }

    if(id < 0) {
      return console.warn('Failed to remove by id', id, notes);
    }

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
}

function migrate(data) {
  // patch data with ids in case they are missing
  if(data) {
    data.notes = data.notes.map((note) => {
      if(!note.id) {
        note.id = uuid.v4();
      }

      return note;
    });
  }

  return data;
}
