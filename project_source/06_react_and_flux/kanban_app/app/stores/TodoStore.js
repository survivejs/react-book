'use strict';
import alt from '../alt';
import TodoActions from '../actions/TodoActions';

class TodoStore {
  constructor() {
    this.bindListeners({
      init: TodoActions.init,
      createTodo: TodoActions.createTodo,
      updateTodo: TodoActions.updateTodo,
      removeTodo: TodoActions.removeTodo
    });
  }
  init(data) {
    this.setState(data || {todos: []});
  }
  createTodo(task) {
    this.setState({
      todos: this.todos.concat([{
        task: task
      }])
    });
  }
  updateTodo({id, task}) {
    const todos = this.todos;

    todos[id].task = task;

    this.setState({todos});
  }
  removeTodo(id) {
    const todos = this.todos;

    this.setState({
      todos: todos.slice(0, id).concat(todos.slice(id + 1))
    });
  }
}

export default alt.createStore(TodoStore, 'TodoStore');
