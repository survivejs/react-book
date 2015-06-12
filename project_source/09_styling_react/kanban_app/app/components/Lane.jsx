import AltContainer from 'alt/AltContainer';
import React from 'react';

import alt from '../libs/alt';
import {getInitialData} from '../libs/storage';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    i: number;
  }) {
    super(props);

    this.actions = alt.createActions(NoteActions);

    const storeName = 'NoteStore-' + this.props.i;
    this.store = alt.createStore(NoteStore, storeName, this.actions);
    this.actions.init(getInitialData(storeName));
  }
  render() {
    /* eslint-disable no-unused-vars */
    const {i, name, ...props} = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <div {...props}>
        <div className='lane-header'>
          <div className='lane-name'>{name}</div>
          <div className='lane-add-note'>
            <button onClick={this.addNote.bind(this)}>+</button>
          </div>
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
