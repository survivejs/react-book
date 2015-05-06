import React from 'react';
import { configureDragDrop } from 'react-dnd';
import ItemTypes from './ItemTypes';

const NoteSource = {
  beginDrag(props) {
    return {
      id: props.id,
      lane: props.lane,
    };
  }
};

const NoteTarget = {
  hover(props, monitor) {
    const draggedNote = monitor.getItem();
    const draggedLane = draggedNote.lane.id;
    const draggedId = draggedNote.id;
    const targetLane = props.lane.id;
    const targetId = props.id;

    if(draggedId !== targetId || draggedLane !== targetLane) {
      props.moveNote({
        id: draggedId,
        lane: draggedLane,
      }, {
        id: props.id,
        lane: targetLane,
      });
    }
  }
};

@configureDragDrop(
  register => ({
    noteSource: register.dragSource(ItemTypes.NOTE, NoteSource),
    noteTarget: register.dropTarget(ItemTypes.NOTE, NoteTarget)
  }),

  ({ noteSource, noteTarget }) => ({
    connectDragSource: noteSource.connect(),
    connectDropTarget: noteTarget.connect(),
    isDragging: noteSource.isDragging()
  })
)
export default class Note extends React.Component {
  constructor(props: {
    connectDragSource: Function;
    connectDropTarget: Function;
    isDragging: bool;
    lane: Object;
    task: string;
    id: number;
    onEdit: Function;
    moveNote: Function;
  }) {
    super(props);

    this.state = {
      edited: false
    };
  }
  render() {
    const { text, isDragging, connectDragSource, connectDropTarget } = this.props;
    var edited = this.state.edited;
    var task = this.props.task;

    return (
      <div className='note'
        ref={c => { connectDragSource(c); connectDropTarget(c); }}
      >{
        edited?
        <input type='text'
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
