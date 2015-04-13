'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoApp extends React.Component {
  displayName: 'TodoApp'

  render() {
    return <TodoItem />;
  }
}
