'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    index: number;
    actions: Object;
    name: string;
    todos: Array;
  }) {
    super(props);
  }
  render() {
    var index = this.props.index;
    var name = this.props.name;
    var todos = this.props.todos;
    var actions = this.props.actions;

    return (
      <div className='lane'>
        <div className='name'>{name}</div>
        <TodoList lane={index} actions={actions} todos={todos} />
      </div>
    );
  }
}
