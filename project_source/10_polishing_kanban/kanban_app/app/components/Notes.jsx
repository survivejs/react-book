import React from 'react';

import Editable from './Editable';
import Note from './Note';

export default class Notes extends React.Component {
  constructor(props: {
    store: Object;
    items: Array;
    onEdit: Function;
  }) {
    super(props);
  }
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <Note onMove={this.onMoveNote.bind(this)} className='note'
          key={'note-' + note.id} store={this.props.store} data={note}>
          <Editable
            value={note.task}
            onEdit={this.props.onEdit.bind(this, i)} />
        </Note>
      )}</ul>
    );
  }
  onMoveNote(source, target) {
    console.log('source', source, 'target', target);

    source.store.remove({id: source.data});

    if(source.store === target.store) {
      target.store.createAfter(target.data.id, source.data);
    }
    else {
      target.store.createBefore(target.data.id, source.data);
    }
  }
}
