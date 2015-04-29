'use strict';
import React from 'react';
import Notes from './Notes';
import noteActions from '../actions/NoteActions';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);
  }
  render() {
    const cursor = this.props.cursor;
    const noteCursor = cursor.select('notes');
    const actions = noteActions(noteCursor);

    return (
      <div className='lane'>
        <div className='lane-controls'>
          <div className='lane-name'>{cursor.get().name}</div>
          <button className='lane-add-note'
            onClick={actions.create.bind(null, 'New task')}>+</button>
        </div>
        <Notes cursor={noteCursor} />
      </div>
    );
  }
}
