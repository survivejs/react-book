/* @flow */
import React from 'react';
import {compose} from 'redux';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = (props: {
  connectDragSource?: Function,
  connectDropTarget?: Function,
  isDragging?: boolean,
  isOver?: boolean,
  onMove?: Function,
  id: string,
  editing?: boolean,
  children?: any,
  className?: string,
  onClick?: Function
}) => {
  const {
    connectDragSource, connectDropTarget, isDragging, isOver,
    onMove, id, editing, children, className, onClick
  } = props;

  // Pass through if we are editing
  const dragSource = editing ? a => a : connectDragSource;

  return compose(dragSource, connectDropTarget)(
    <div style={{
      opacity: isDragging || isOver ? 0 : 1
    }} className={className} onClick={onClick}>{children}</div>
  );
};

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

export default compose(
  DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })),
  DropTarget(ItemTypes.NOTE, noteTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }))
)(Note)