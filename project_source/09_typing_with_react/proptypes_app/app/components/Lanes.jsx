import React from 'react';
import Lane from './Lane.jsx';

class Lanes extends React.Component {
  render() {
    const lanes = this.props.items;

    return <div className='lanes'>{lanes.map(this.renderLane)}</div>;
  }
  renderLane(lane) {
    return <Lane className='lane' key={`lane${lane.id}`} {...lane} />;
  }
}
Lanes.propTypes = {
  items: React.PropTypes.array.isRequired
};
Lanes.defaultProps = {
  items: []
};

export default Lanes;
