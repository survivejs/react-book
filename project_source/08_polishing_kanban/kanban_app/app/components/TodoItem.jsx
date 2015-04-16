'use strict';
import React from 'react';
import { configureDragDrop } from 'react-dnd';

// XXX: move to ItemTypes.js
const ItemTypes = {
  TODO: 'todo'
};

class TodoItem extends React.Component {
  constructor(props: {
    task: string;
    onEdit: Function;
    onMove: Function;
    isDragging: boolean;
    dragSourceRef: Function;
    //dragTargetRef: Function; // why undefined?
  }) {
    super(props);

    this.state = {
      edited: false
    };
  }
  render() {
    const { task, isDragging, dragSourceRef, dropTargetRef } = this.props;
    var edited = this.state.edited;

    return (
      <div
        className='todo-item'
        ref={c => {
            dragSourceRef(c);
            dropTargetRef(c);
          }
        }>{
        edited
        ? <input type='text'
          defaultValue={task}
          onBlur={this.finishEdit.bind(this)}
          onKeyPress={this.checkEnter.bind(this)}/>
        : <div onClick={this.edit.bind(this)}>{task}</div>
      }</div>
    );
  }
  edit() {
    this.setState({
        edited: true
    });
  }
  checkEnter(e) {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  }
  finishEdit(e) {
    this.props.onEdit(e.target.value);

    this.setState({
      edited: false
    });
  }
}

const todoSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

const todoTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.id) {
      props.onMove(draggedId, props.id);
    }
  }
};

export default configureDragDrop(TodoItem, {
  configure: (register) => ({
    todoSourceId: register.dragSource(ItemTypes.TODO, todoSource),
    todoTargetId: register.dropTarget(ItemTypes.TODO, todoTarget)
  }),
  collect: (connect, monitor, { todoSourceId, todoTargetId }) => ({
    isDragging: monitor.isDragging(todoSourceId),
    dragSourceRef: connect.dragSource(todoSourceId),
    dropTargetRef: connect.dropTarget(todoTargetId)
  })
});
