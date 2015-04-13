'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoApp extends React.Component {
  render() {
    var todos = [{
      task: 'Learn Webpack'
    }, {
      task: 'Learn React'
    }, {
      task: 'Do laundry'
    }];

    return (
      <div>
        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem task={todo.task} />
          </li>
        )}</ul>
      </div>
    );
  }
}
