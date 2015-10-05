/* @flow */
import React from 'react';
import Lane from './Lane.jsx';

export default class Lanes extends React.Component {
  props: {
    items: Array<Object>
  };
  static defaultProps: {};
  render(): any {
    const lanes = this.props.items;

    return <div className="lanes">{lanes.map(this.renderLane)}</div>;
  }
  renderLane(lane: Object) {
    return <Lane className="lane" key={lane.id} lane={lane} />;
  }
}
