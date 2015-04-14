'use strict';
import alt from '../alt';
import TodoActions from '../actions/TodoActions';

class TodoStore {
  constructor() {
    this.bindActions(TodoActions);
  }
  init(data) {
    this.setState(data || {todos: []});
  }
  createTodo(task) {
    this.todos.push({task});
  }
  updateTodo({id, task}) {
    this.todos[id].task = task;
  }
  removeTodo(id) {
    const todos = this.todos;

    this.setState({
      todos: todos.slice(0, id).concat(todos.slice(id + 1))
    });
  }
}

export default alt.createStore(TodoStore, 'TodoStore');
