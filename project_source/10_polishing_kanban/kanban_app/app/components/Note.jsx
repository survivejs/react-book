import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

import ItemTypes from './ItemTypes';

const noteSource = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const targetId = props.id;
    const sourceId = monitor.getItem().id;

    if(sourceId !== targetId) {
      props.onMove(sourceId, targetId);
    }
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
  constructor(props: {
    id: number;
    onMove: Function;
  }) {
    super(props);
  }
  render() {
    const { isDragging, connectDragSource, connectDropTarget, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
