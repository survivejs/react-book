'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import todoActions from '../actions/TodoActions';

export default class TodoList extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);

    this.actions = todoActions(props.cursor);
  }
  render() {
    var todos = this.props.cursor.get();

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
