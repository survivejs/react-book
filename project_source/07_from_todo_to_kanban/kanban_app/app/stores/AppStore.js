'use strict';

export default (actions) => {
  return class AppStore {
    constructor() {
      this.bindActions(actions);
    }
    init(data) {
      this.setState(data || {lanes: []});
    }
    createLane(data) {
      this.setState({
        lanes: this.lanes.concat({
          name: 'New lane',
          todos: []
        })
      });
    }
    createTodo({lane, task}) {
      this.lanes[lane].todos.push({
        task: task
      });
    }
    updateTodo({lane, id, task}) {
      this.lanes[lane].todos[id].task = task;
    }
    removeTodo({lane, id}) {
      const todos = this.lanes[lane].todos;

      this.lanes[lane].todos = todos.slice(0, id).concat(todos.slice(id + 1));
    }
  };
};
