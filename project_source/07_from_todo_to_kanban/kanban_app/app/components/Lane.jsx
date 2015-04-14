'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);
  }
  render() {
    var cursor = this.props.cursor;

    return (
      <div className='lane'>
        <div className='name'>{cursor.get().name}</div>
        <TodoList cursor={cursor.select('todos')} />
      </div>
    );
  }
}
