'use strict';
import React from 'react';
import Lane from './Lane';
import {branch} from 'baobab-react/decorators';

@branch({
  cursors: {
    lanes: ['lanes']
  }
})
export default class Lanes extends React.Component {
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='lanes'>
        {lanes.map((lane, i) =>
          <Lane key={'lane' + i} index={i} />
        )}
      </div>
    );
  }
}
