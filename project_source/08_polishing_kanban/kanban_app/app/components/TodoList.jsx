'use strict';
import React from 'react';
import { configureDragDropContext } from 'react-dnd';
// XXXXX
import HTML5Backend from 'react-dnd/dist-modules/backends/HTML5';
import TodoItem from './TodoItem';
import todoActions from '../actions/TodoActions';

class TodoList extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);

    this.actions = todoActions(props.cursor);
  }
  render() {
    var todos = this.props.cursor.get();

    return (
      <ul className='todo-list'>
        {todos.map((todo, i) =>
          <li key={'todo' + i}>
            <TodoItem
              id={todo.id}
              task={todo.task}
              onEdit={this.itemEdited.bind(this, i)}
              onMove={this.itemMoved.bind(this)}
            />
          </li>
        )}
      </ul>
    );
  }
  itemEdited(id, task) {
    if(task) {
      this.actions.updateTodo(id, task);
    }
    else {
      this.actions.removeTodo(id);
    }
  }
  itemMoved(id, afterId) {
    if(id > afterId) {
      var tmp = id;
      id = afterId;
      afterId = tmp;
    }

    // XXXXX: decouple this from array ids
    var cursor = this.props.cursor;
    var todos = cursor.get();
    var start = todos.slice(0, id);
    var middle = todos.slice(id + 1, afterId);
    var end = todos.slice(afterId + 1);
    var newTodos = start.concat([todos[afterId]]).concat(middle).concat([todos[id]]).concat(end);

    //cursor.edit(newTodos);

    console.log(id, afterId);//, newTodos, start, middle, end);

    /*
    var todo = this.props.cursor.get(id);
    var afterTodo = this.props.cursor.get(afterId);

    // XXX: just manipulating state. it would be nicer to splice
    console.log(todo, afterTodo, this.props.cursor.get());
    */

    /*
    const { cards } = this.state;

    const card = cards.filter(c => c.id === id)[0];
    const afterCard = cards.filter(c => c.id === afterId)[0];
    const cardIndex = cards.indexOf(card);
    const afterIndex = cards.indexOf(afterCard);

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [cardIndex, 1],
          [afterIndex, 0, card]
        ]
      }
    }));
    */
  }
}

export default configureDragDropContext(TodoList, HTML5Backend);
