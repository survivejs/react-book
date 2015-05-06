import React from 'react';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Notes from './Notes';
import noteActions from '../actions/NoteActions';

@branch({
  cursors: function(props) {
    return {
      lane: props.laneCursor
    };
  }
})
export default class Lane extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  constructor(props: {
    laneCursor: Array;
    moveNote: Function;
  }, context) {
    super(props);

    this.actions = noteActions(context.cursors.lane.select('notes'));
  }
  render() {
    var laneCursor = this.props.laneCursor;
    var lane = this.props.lane;

    console.log('lane', lane);

    return (
      <div className='lane'>
        <div className='lane-header'>
          <div className='lane-name'>{lane.name}</div>
          <div className='lane-controls'>
            <button className='lane-add-note'
              onClick={this.actions.create.bind(null, 'New task')}>+</button>
          </div>
        </div>
        <Notes
          notesCursor={laneCursor.concat(['notes'])}
          moveNote={this.props.moveNote}
          lane={lane} />
      </div>
    );
  }
}
