'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import todoStore from './TodoStore';
import alt from './alt';

export default class TodoList extends React.Component {
  constructor(props: {
    storeKey: string;
    todos: Array;
  }) {
    super(props);

    this.actions = alt.createActions(TodoActions);
    this.store = alt.createStore(
      todoStore(this.actions),
      'TodoStore' + props.storeKey
    );
    this.actions.init({
      todos: props.todos
    });
    this.state = this.store.getState();
  }
  componentDidMount() {
    this.store.listen(this.storeChanged.bind(this));
  }
  componentWillUnmount() {
    this.store.unlisten(this.storeChanged.bind(this));
  }
  storeChanged() {
    this.setState(this.store.getState());
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
    this.actions.createTodo('New task');
  }
  itemEdited(id, task) {
    if(task) {
      this.actions.updateTodo(id, task);
    }
    else {
      this.actions.removeTodo(id);
    }
  }
}
