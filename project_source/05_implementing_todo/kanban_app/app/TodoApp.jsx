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
            <TodoItem
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)} />
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
  itemEdited(i, task) {
    var todos = this.state.todos;

    if(task) {
      todos[i].task = task;
    }
    else {
      todos = todos.slice(0, i).concat(todos.slice(i + 1));
    }

    this.setState({
      todos: todos
    });
  }
}
