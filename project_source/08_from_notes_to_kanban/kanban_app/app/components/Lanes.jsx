import React from 'react';

import Lane from './Lane';

export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);
  }
  render() {
    var lanes = this.props.items;

    return (
      <div className='lanes'>{lanes.map((lane, i) =>
          <Lane className='lane' key={'lane-' + i}
            {...lane}
            i={i} />
      )}</div>
    );
  }
}
