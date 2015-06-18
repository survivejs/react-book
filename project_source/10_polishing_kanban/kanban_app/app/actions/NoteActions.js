export default class NoteActions {
  init(notes) {
    this.dispatch(notes);
  }
  create(task) {
    this.dispatch(task);
  }
  move(source, target) {
    this.dispatch({source, target});
  }
  update(id, task) {
    this.dispatch({id, task});
  }
  remove(id) {
    this.dispatch(id);
  }
}
