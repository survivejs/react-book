'use strict';
import React from 'react';
import Notes from './Notes';

export default class Lane extends React.Component {
  constructor(props: {
    cursor: Object;
  }) {
    super(props);
  }
  render() {
    var cursor = this.props.cursor;

    return (
      <div className='lane'>
        <div className='name'>{cursor.get().name}</div>
        <Notes cursor={cursor.select('notes')} />
      </div>
    );
  }
}
