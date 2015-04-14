'use strict';

export default class AppActions {
  init(data) {
    this.dispatch(data);
  }
  createLane(data) {
    this.dispatch(data);
  }
  createTodo(lane, task) {
    this.dispatch({lane, task});
  }
  updateTodo(lane, id, task) {
    this.dispatch({lane, id, task});
  }
  removeTodo(lane, id) {
    this.dispatch({lane, id});
  }
}
