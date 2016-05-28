import React from 'react';
import {compose} from 'redux';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = ({
  connectDragSource, connectDropTarget,
  children, ...props
}) => {
  return compose(connectDragSource, connectDropTarget)(
    <div {...props}>
      {children}
    </div>
  );
};

const noteSource = {
  beginDrag(props) {
    console.log('begin dragging note', props);

    return {};
  }
};

const noteTarget = {
  hover(targetProps, monitor) {
    const sourceProps = monitor.getItem();

    console.log('dragging note', sourceProps, targetProps);
  }
};

export default compose(
  DragSource(ItemTypes.NOTE, noteSource, connect => ({
    connectDragSource: connect.dragSource()
  })),
  DropTarget(ItemTypes.NOTE, noteTarget, (connect) => ({
    connectDropTarget: connect.dropTarget()
  }))
)(Note)