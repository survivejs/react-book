'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import Notes from './Notes';

@branch({
  cursors: function() {
    return {
      lane: ['lanes', this.props.index],
    };
  }
})
export default class Lane extends React.Component {
  constructor(props: {
    index: number;
  }) {
    super(props);
  }
  render() {
    var lane = this.props.lane;

    console.log('rendering lane', lane);

    return (
      <div className='lane'>
        <div className='name'>{lane.name}</div>
        {/*<Notes cursor={cursor.select('notes')} />*/}
      </div>
    );
  }
}
