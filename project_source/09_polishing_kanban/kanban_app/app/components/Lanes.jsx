'use strict';
import React from 'react';
import { configureDragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import {branch} from 'baobab-react/decorators';
import Lane from './Lane';

@branch({
  cursors: {
    lanes: ['lanes']
  }
})
@configureDragDropContext(HTML5Backend)
export default class Lanes extends React.Component {
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
  moveNote(id, afterId) {
    return console.log('move note', id, afterId, this);

    // TODO: allow moving from lane to lane
    // TODO: allow moving within a lane (done below)

    /*
    var cursor = this.cursor;
    var notes = this.props.notes;

    const note = notes.filter(c => c.id === id)[0];
    const afterNote = notes.filter(c => c.id === afterId)[0];
    const noteIndex = notes.indexOf(note);
    const afterIndex = notes.indexOf(afterNote);

    cursor.splice([noteIndex, 1]);
    cursor.splice([afterIndex, 0, note]);
    cursor.tree.commit();
    */
  }
}
