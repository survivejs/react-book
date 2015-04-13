'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import TodoStore from './TodoStore';
import persist from './persist';
import storage from './storage';

class TodoApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = TodoStore.getState();
  }
  componentDidMount() {
    TodoStore.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    TodoStore.unlisten(this.storeChanged.bind(this));
  }
  storeChanged(d) {
    this.setState(TodoStore.getState());
  }
  render() {
    var todos = this.state.todos;

    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>

        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)} />
          </li>
        )}</ul>
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

export default persist(TodoApp, TodoActions.init, TodoStore, storage, 'todos');
