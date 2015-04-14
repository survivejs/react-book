'use strict';
import React from 'react';
import TodoList from './TodoList';

export default class App extends React.Component {
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
        <TodoList todos={todos} onEdit={this.itemEdited.bind(this)} />
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
