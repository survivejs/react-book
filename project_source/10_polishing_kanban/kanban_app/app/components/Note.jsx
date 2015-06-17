import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

import ItemTypes from './ItemTypes';

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

const noteTarget = {
  hover(props, monitor) {
    console.log('dragging note', props, monitor);
  }
};

@DropTarget(ItemTypes.NOTE, noteTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class Note extends React.Component {
  render() {
    const { isDragging, connectDragSource, connectDropTarget, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
