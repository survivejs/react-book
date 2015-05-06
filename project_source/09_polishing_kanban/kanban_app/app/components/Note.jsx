import React from 'react';
import { configureDragDrop } from 'react-dnd';
import ItemTypes from './ItemTypes';

const NoteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

const NoteTarget = {
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;

    if(draggedId !== props.id) {
      props.moveNote(draggedId, props.id);
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
