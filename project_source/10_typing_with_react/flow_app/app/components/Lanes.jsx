/* @flow */
import React from 'react';
import Lane from './Lane.jsx';

export default (props: {
  lanes: Array<Object>
}): ReactElement => {
  const lanes = props.lanes;

  return (
    <div className="lanes">{lanes.map((lane) =>
      <Lane className="lane" key={lane.id} lane={lane} />
    )}</div>
  );
}
