'use strict';
import React from 'react';
import TodoList from './TodoList';
import todoActions from '../actions/TodoActions';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);
  }
  render() {
    const cursor = this.props.cursor;
    const todoCursor = cursor.select('todos');
    const actions = todoActions(todoCursor);

    return (
      <div className='lane'>
        <div className='lane-controls'>
          <div className='lane-name'>{cursor.get().name}</div>
          <button className='lane-add-todo'
            onClick={actions.createTodo.bind(null, 'New task')}>+</button>
        </div>
        <TodoList cursor={todoCursor} />
      </div>
    );
  }
}
