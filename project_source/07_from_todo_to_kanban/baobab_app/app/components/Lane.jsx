'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
    name: string;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var cursor = this.props.cursor;
    var name = this.props.name;
    var todos = this.props.todos;

    return (
      <div className='lane'>
        <div className='name'>{name}</div>
        <TodoList cursor={cursor} todos={todos} />
      </div>
    );
  }
}
