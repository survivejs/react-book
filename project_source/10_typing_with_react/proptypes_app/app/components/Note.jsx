import React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../libs/itemTypes';

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

@DragSource(ItemTypes.NOTE, noteSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
class Note extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget,
      onMove, id, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
Note.propTypes = {
  id: React.PropTypes.string.isRequired,
  connectDragSource: React.PropTypes.func,
  connectDropSource: React.PropTypes.func,
  onMove: React.PropTypes.func
};
Note.defaultProps = {
  onMove: () => {}
};

export default Note;
