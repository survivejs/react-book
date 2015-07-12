export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  init(data) {
    this.setState(Array.isArray(data && data.notes) ? data : {
      notes: []
    });
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task})
    });
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({notes});
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1))
    });
  }
}
