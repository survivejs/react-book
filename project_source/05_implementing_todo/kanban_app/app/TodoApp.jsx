'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      todos: [{
        task: 'Learn Webpack'
      }, {
        task: 'Learn React'
      }, {
        task: 'Do laundry'
      }]
    };
  }
  render() {
    var todos = this.state.todos;

    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>
        <ul>{todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem task={todo.task} />
          </li>
        )}</ul>
      </div>
    );
  }

  addItem() {
    this.setState({
      todos: this.state.todos.concat([{
        task: 'New task'
      }])
    });
  }
}
