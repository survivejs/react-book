import Alt from 'alt';
import AltContainer from 'alt/AltContainer';
import AltManager from 'alt/utils/AltManager';
import React from 'react';
import Notes from './Notes';

import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

var altManager = new AltManager(Alt);

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    i: number;
  }) {
    super(props);

    const i = this.props.i;
    const alt = altManager.getOrCreate('lane-' + i);

    this.noteActions = alt.createActions(NoteActions);
    this.noteStore = alt.createStore(NoteStore, 'notes-' + i, this.noteActions);

    // TODO: trigger persist
    // @persist(LaneActions.init, LaneStore, storage, 'lanes')

    this.noteActions.init();
  }
  render() {
    const name = this.props.name;

    return (
      <div>
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
