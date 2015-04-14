'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoList extends React.Component {
  constructor(props: {
    todos: Array;
    onEdit: Function;
  }) {
    super(props);
  }
  render() {
    var todos = this.props.todos;

    return (
      <ul>{todos.map((todo, i) =>
        <li key={'todo' + i}>
          <TodoItem
            task={todo.task}
            onEdit={this.props.onEdit.bind(this, i)} />
        </li>
      )}</ul>
    );
  }
}
