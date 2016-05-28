import React from 'react';
import {DragSource} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const Note = ({
  connectDragSource, children, ...props
}) => {
  return connectDragSource(
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

export default DragSource(ItemTypes.NOTE, noteSource, connect => ({
  connectDragSource: connect.dragSource()
}))(Note)