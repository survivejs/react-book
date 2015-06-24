import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

import ItemTypes from './ItemTypes';

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const targetData = props.data || {};
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(sourceData.id !== targetData.id) {
      props.onMove({
        source: sourceProps.data,
        target: props.data,
      });
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
    data: Object;
    onMove: Function;
  }) {
    super(props);
  }
  render() {
    const { isDragging, connectDragSource, connectDropTarget,
      onMove, data, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
