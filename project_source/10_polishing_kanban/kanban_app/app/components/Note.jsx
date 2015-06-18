import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

import ItemTypes from './ItemTypes';

const noteSource = {
  beginDrag(props) {
    return {
      data: props.data,
      store: props.store,
    };
  }
};

const noteTarget = {
  hover(props, monitor) {
    const targetData = props.data || {};
    const sourceProps = monitor.getItem();
    const sourceData = sourceProps.data || {};

    if(sourceData.id !== targetData.id) {
      props.onMove(sourceProps, props);
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
    store: Object;
    data: Object;
    onMove: Function;
  }) {
    super(props);
  }
  render() {
    const { isDragging, connectDragSource, connectDropTarget,
      store, data, ...props } = this.props;

    return connectDragSource(connectDropTarget(
      <li {...props}>{props.children}</li>
    ));
  }
}
