'use strict';
import React from 'react';
import { configureDragDrop } from 'react-dnd';

// XXX: move to ItemTypes.js
const ItemTypes = {
  NOTE: 'note'
};

const NoteTarget = {
  drop() {
    return { name: 'Note' };
  }
};

/*
export default configureDragDrop(Note, {
  configure: (register) => ({
    noteSourceId: register.dragSource(ItemTypes.NOTE, noteSource),
    noteTargetId: register.dropTarget(ItemTypes.NOTE, noteTarget)
  }),
  collect: (connect, monitor, { noteSourceId, noteTargetId }) => ({
    isDragging: monitor.isDragging(noteSourceId),
    dragSourceRef: connect.dragSource(noteSourceId),
    dropTargetRef: connect.dropTarget(noteTargetId)
  })
});
 */

@configureDragDrop(
  register =>
    register.dropTarget(ItemTypes.NOTE, NoteTarget),

  noteTarget => ({
    connectDropTarget: noteTarget.connect(),
    isOver: noteTarget.isOver(),
    canDrop: noteTarget.canDrop()
  })
)
export default class Note extends React.Component {
  constructor(props: {
    task: string;
    onEdit: Function;
    onMove: Function;
    connectDropTarget: Function;
    isOver: boolean;
    canDrop: boolean;
    //isDragging: boolean;
    //dragSourceRef: Function;
    //dragTargetRef: Function; // why undefined?
  }) {
    super(props);

    this.state = {
      edited: false
    };
  }
  render() {
    //const { task, isDragging, dragSourceRef, dropTargetRef } = this.props;
    const { task, connectDropTarget, isOver, canDrop } = this.props;
    var edited = this.state.edited;

    return (
      <div
        className='note'
        /*ref={c => {
            dragSourceRef(c);
            dropTargetRef(c);
          }
        }*/
      >{
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

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if (draggedId !== props.id) {
      props.onMove(draggedId, props.id);
    }
  }
};
