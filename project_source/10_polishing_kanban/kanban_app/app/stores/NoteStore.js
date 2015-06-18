import uuid from 'node-uuid';

export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  init(data) {
    this.setState(data ? migrate(data) : {notes: []});
  }
  create(task) {
    const notes = this.notes;

    task.id = uuid.v4();

    this.setState({
      notes: notes.concat({task})
    });
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({
      notes: notes
    });
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1))
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
