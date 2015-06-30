import React from 'react';

import Lane from './Lane';

export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);
  }
  render() {
    return (
      <div className='lanes'>{this.props.items.map((lane, i) =>
          <Lane className='lane' key={'lane-' + i} i={i} {...lane} />
      )}</div>
    );
  }
}
