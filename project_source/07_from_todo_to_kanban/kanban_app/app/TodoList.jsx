'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoList extends React.Component {
  constructor(props: {
    lane: number;
    actions: Object;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var todos = this.props.todos;

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
    this.props.actions.createTodo(this.props.lane, 'New task');
  }
  itemEdited(id, task) {
    if(task) {
      this.props.actions.updateTodo(this.props.lane, id, task);
    }
    else {
      this.props.actions.removeTodo(this.props.lane, id);
    }
  }
}
