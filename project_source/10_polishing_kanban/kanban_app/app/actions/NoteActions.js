export default class NoteActions {
  init(notes) {
    this.dispatch(notes);
  }
  create(task) {
    this.dispatch(task);
  }
  createAfter(id, data) {
    this.dispatch({id, data});
  }
  createBefore(id, data) {
    this.dispatch({id, data});
  }
  update(id, task) {
    this.dispatch({id, task});
  }
  remove(id) {
    this.dispatch(id);
  }
}
