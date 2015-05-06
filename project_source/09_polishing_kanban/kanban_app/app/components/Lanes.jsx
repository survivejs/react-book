import React from 'react';
import { configureDragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import Lane from './Lane';

@branch({
  cursors: {
    lanes: ['lanes']
  }
})
@configureDragDropContext(HTML5Backend)
export default class Lanes extends React.Component {
  static contextTypes = {
    cursors: PropTypes.cursors
  }
  render() {
    var lanes = this.props.lanes;

    return (
      <div className='lanes'>
        {lanes.map((lane, i) =>
          <Lane key={'lane' + i} laneCursor={['lanes', i]}
            moveNote={this.moveNote.bind(this)} />
        )}
      </div>
    );
  }
  moveNote(source, target) {
    var lanesCursor = this.context.cursors.lanes;

    console.log('move note', source, target);

    if(source.lane === target.lane) {
      var laneCursor = lanesCursor.select(source.lane);
      var noteCursor = laneCursor.select('notes');
      var notes = noteCursor.get();

      const sourceNote = notes.filter(c => c.id === source.id)[0];
      const targetNote = notes.filter(c => c.id === target.id)[0];
      const sourceIndex = notes.indexOf(sourceNote);
      const targetIndex = notes.indexOf(targetNote);

      console.log(sourceIndex, targetIndex);

      noteCursor.splice([sourceIndex, 1]);
      noteCursor.splice([targetIndex, 0, sourceNote]);
      noteCursor.tree.commit();
    }
    // TODO: allow moving from lane to lane
  }
}
