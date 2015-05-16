import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Notes from './Notes';
import noteActions from '../actions/NoteActions';
import laneActions from '../actions/LaneActions';

@branch({
  cursors: function(props) {
    return {
      lane: props.laneCursor,
      lanes: ['lanes']
    };
  }
})
export default class Lane extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    laneCursor: Array;
  }, context) {
    super(props);

    this.noteActions = noteActions(context.cursors.lane.select('notes'));
    this.laneActions = laneActions(context.cursors.lanes);
  }
  render() {
    var laneCursor = this.props.laneCursor;
    var lane = this.props.lane;

    return (
      <div className='lane'>
        <div className='lane-header'>
          <div className='lane-name'>{lane.name}</div>
          <div className='lane-controls'>
            <button className='lane-add-note'
              onClick={this.noteActions.create.bind(null, 'New task')}>+</button>
            <button className='lane-remove'
              onClick={this.laneActions.remove.bind(null, lane.id)}>X</button>
          </div>
        </div>
        <Notes notesCursor={laneCursor.concat(['notes'])} />
      </div>
    );
  }
}
