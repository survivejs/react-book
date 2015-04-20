'use strict';
import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Notes from './Notes';

@branch({
  cursors: function() {
    return {
      lane: ['lanes', this.props.index],
    };
  }
})
class Lane extends React.Component {
  // XXX: figure out why
  // cursors: PropTypes.cursor
  // yields a warning
  static contextTypes = {
    cursors: React.PropTypes.object
  }
  constructor(props: {
    index: number;
  }) {
    super(props);
  }
  render() {
    var cursor = this.context.cursors.lane;
    var lane = this.props.lane;

    return (
      <div className='lane'>
        <div className='name'>{lane.name}</div>
        <Notes cursor={cursor.select('notes')} />
      </div>
    );
  }
}

export default Lane;
