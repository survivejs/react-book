import AltContainer from 'alt/AltContainer';
import React from 'react';

import Notes from './Notes';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import {getInitialData} from '../libs/storage';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    i: number;
  }) {
    super(props);

    const i = this.props.i;

    this.actions = alt.createActions(NoteActions);
    alt.addActions('NoteActions-' + i, this.actions);

    const storeName = 'NoteStore-' + i;
    this.store = alt.createStore(NoteStore, storeName, this.actions);
    this.actions.init(getInitialData(storeName));
  }
  render() {
    /* eslint-disable no-unused-vars */
    const {i, name, ...props} = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <div {...props}>
        <div className='header'>
          <div className='name'>{name}</div>
          <button onClick={this.addNote.bind(this)}>+</button>
        </div>
        <AltContainer
          stores={[this.store]}
          inject={{
            items: () => this.store.getState().notes || [],
          }}
        >
          <Notes onEdit={this.noteEdited.bind(this)} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    this.actions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      this.actions.update(id, note);
    }
    else {
      this.actions.remove(id);
    }
  }
}
