'use strict';
import React from 'react';
import TodoList from './TodoList';
import TodoActions from '../actions/TodoActions';
import TodoStore from '../stores/TodoStore';
import persist from '../behaviors/persist';
import connect from '../behaviors/connect';
import storage from '../storage';

class App extends React.Component {
  constructor(props: {
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var todos = this.props.todos;

    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>
        <TodoList todos={todos} onEdit={this.itemEdited.bind(this)} />
      </div>
    );
  }
  addItem() {
    TodoActions.createTodo('New task');
  }
  itemEdited(id, task) {
    if(task) {
      TodoActions.updateTodo(id, task);
    }
    else {
      TodoActions.removeTodo(id);
    }
  }
}

export default persist(
  connect(App, TodoStore),
  TodoActions.init,
  TodoStore,
  storage,
  'todos'
);
