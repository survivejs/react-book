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
    const lanesCursor = this.context.cursors.lanes;
    const sourceLaneCursor = lanesCursor.select(source.lane);
    const sourceNoteCursor = sourceLaneCursor.select('notes');
    const sourceNotes = sourceNoteCursor.get();

    const targetLaneCursor = lanesCursor.select(target.lane);
    const targetNoteCursor = targetLaneCursor.select('notes');
    const targetNotes = targetNoteCursor.get();

    const sourceNote = sourceNotes.filter(c => c.id === source.id)[0];
    const targetNote = targetNotes.filter(c => c.id === target.id)[0];
    const sourceIndex = sourceNotes.indexOf(sourceNote);
    const targetIndex = targetNotes.indexOf(targetNote);

    console.log('moving note');

    if(source.lane === target.lane) {
      sourceNoteCursor.splice([sourceIndex, 1]);
      targetNoteCursor.splice([targetIndex, 0, sourceNote]);

      // source and target are same so single commit is enough
      targetNoteCursor.tree.commit();
    }
    else {
      // XXX: moving note gets triggered a lot in this case!!!
      // -> commit?
      sourceNoteCursor.set(sourceIndex, targetNote);
      sourceNoteCursor.tree.commit();

      targetNoteCursor.set(targetIndex, sourceNote);
      targetNoteCursor.tree.commit();
    }
  }
}
