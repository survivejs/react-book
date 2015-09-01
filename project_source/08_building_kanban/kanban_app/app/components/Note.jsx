import React from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../libs/item_types';

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data
    };
  }
};

const noteTarget = {
  hover(targetProps, monitor) {
    const targetNote = targetProps.data || {};
    const sourceProps = monitor.getItem();
    const sourceNote = sourceProps.data || {};

    if(sourceNote.id !== targetNote.id) {
      targetProps.onMove({sourceNote, targetNote});
    }
  }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect) => ({
  connectDragSource: connect.dragSource()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))
export default class Note extends React.Component {
  render() {
    const {connectDragSource, connectDropTarget,
      onMove, data, ...props} = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
