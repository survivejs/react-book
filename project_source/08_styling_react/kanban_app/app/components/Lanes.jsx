import React from 'react';

import Lane from './Lane';

export default class Lanes extends React.Component {
  constructor(props) {
    super(props);

    this.renderLane = this.renderLane.bind(this);
  }
  render() {
    const lanes = this.props.items;

    return <div className='lanes'>{lanes.map(this.renderLane)}</div>;
  }
  renderLane(lane, i) {
    return <Lane className='lane' key={`lane${i}`} i={i} {...lane} />;
  }
}
