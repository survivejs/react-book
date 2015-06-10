import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';

import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    notes: any; // XXX; why ?Object; doesn't work?
    id: string;
  }) {
    super(props);

    const manager = this.props.manager;
    const laneId = this.props.id;
    const alt = manager.getOrCreate(laneId);

    this.noteActions = alt.createActions(NoteActions);
    this.noteStore = alt.createStore(NoteStore, null, this.noteActions);

    this.noteActions.init(this.props.notes);
  }
  render() {
    /* eslint-disable no-unused-vars */
    const {name, notes, id, ...props} = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <div {...props}>
        <div className='header'>
          <div className='name'>{name}</div>
          <button onClick={this.addNote.bind(this)}>+</button>
        </div>
        <AltContainer
          stores={[this.noteStore]}
          inject={{
            items: () => this.noteStore.getState().notes || [],
          }}
        >
          <Notes onEdit={this.noteEdited.bind(this)} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    this.noteActions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      this.noteActions.update(id, note);
    }
    else {
      this.noteActions.remove(id);
    }
  }
}
