'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var name = this.props.name;
    var todos = this.props.todos;

    return (
      <div className='lane'>
        <div className='name'>{name}</div>
        <TodoList todos={todos} />
      </div>
    );
  }
}
