'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import Notes from './Notes';

@branch({
  cursors: function(props) {
    return {
      lane: props.laneCursor
    };
  }
})
export default class Lane extends React.Component {
  constructor(props: {
    laneCursor: Array;
  }) {
    super(props);
  }
  render() {
    var laneCursor = this.props.laneCursor;
    var lane = this.props.lane;

    return (
      <div className='lane'>
        <div className='name'>{lane.name}</div>
        <Notes notesCursor={laneCursor.concat(['notes'])} />
      </div>
    );
  }
}
