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
      <ul className='lanes'>{lanes.map((lane, i) =>
        <li className='lane' key={'lane' + i}>
          <Lane {...lane} />
        </li>
      )}</ul>
    );
  }
}
