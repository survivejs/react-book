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
  moveNote(sourceNote, targetNote) {
    var lanesCursor = this.context.cursors.lanes;

    console.log('move note', sourceNote, targetNote);

    if(sourceNote.lane === targetNote.lane) {
      var laneCursor = lanesCursor.select(sourceNote.lane);
      var noteCursor = laneCursor.select('notes');
      var notes = noteCursor.get();

      const note = notes.filter(c => c.id === sourceNote.id)[0];
      const afterNote = notes.filter(c => c.id === targetNote.id)[0];
      const noteIndex = notes.indexOf(note);
      const afterIndex = notes.indexOf(afterNote);

      noteCursor.splice([noteIndex, 1]);
      noteCursor.splice([afterIndex, 0, note]);
      noteCursor.tree.commit();
    }
    // TODO: allow moving from lane to lane
  }
}
