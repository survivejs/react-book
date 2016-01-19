import React from 'react';
import Lane from './Lane.jsx';

const Lanes = ({lanes}) => {
  return (
    <div className="lanes">{lanes.map(lane =>
      <Lane className="lane" key={lane.id} lane={lane} />
    )}</div>
  );
};
Lanes.propTypes = {
  lanes: React.PropTypes.array
};
Lanes.defaultProps = {
  lanes: []
};

export default Lanes;
