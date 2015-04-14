'use strict';
import React from 'react';
import TodoList from './TodoList';
import TodoActions from './actions/TodoActions';
import TodoStore from './stores/TodoStore';
import persist from './behaviors/persist';
import storage from './storage';

class App extends React.Component {
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
  storeChanged() {
    this.setState(TodoStore.getState());
  }
  render() {
    var todos = this.state.todos;

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

export default persist(App, TodoActions.init, TodoStore, storage, 'todos');
