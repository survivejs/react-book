import React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id
    };
  }
};

const noteTarget = {
  hover(targetProps, monitor) {
    const targetId = targetProps.id;
    const sourceProps = monitor.getItem();
    const sourceId = sourceProps.id;

    if(sourceId !== targetId) {
      targetProps.onMove({sourceId, targetId});
    }
  }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
class Note extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget, isDragging,
      onMove, id, editing, ...props} = this.props;
    // Pass through if we are editing
    const dragSource = editing ? a => a : connectDragSource;

    return dragSource(connectDropTarget(
      <li style={{
        opacity: isDragging ? 0 : 1
      }} {...props}>{props.children}</li>
    ));
  }
}
Note.propTypes = {
  id: React.PropTypes.string.isRequired,
  editing: React.PropTypes.bool,
  connectDragSource: React.PropTypes.func,
  connectDropTarget: React.PropTypes.func,
  isDragging: React.PropTypes.bool,
  onMove: React.PropTypes.func
};
Note.defaultProps = {
  onMove: () => {}
};

export default Note;
