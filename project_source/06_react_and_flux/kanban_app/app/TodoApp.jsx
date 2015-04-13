'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import TodoStore from './TodoStore';
import storage from './storage';

export default class TodoApp extends React.Component {
  constructor(props) {
    super(props);

    TodoActions.init(storage.get('todos'));
    this.state = TodoStore.getState();
  }
  componentDidMount() {
    TodoStore.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    TodoStore.unlisten(this.storeChanged.bind(this));
  }
  storeChanged(d) {
    storage.set('todos', d);

    this.setState(TodoStore.getState());
  }
  render() {
    var todos = this.state.todos;

    return (
      <div>
        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)} />
          </li>
        )}</ul>

        <button onClick={this.addItem.bind(this)}>+</button>
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
