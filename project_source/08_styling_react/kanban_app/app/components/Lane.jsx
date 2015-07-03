import AltContainer from 'alt/AltContainer';
import React from 'react';

import alt from '../libs/alt';
import {getInitialData} from '../libs/storage';
import Editable from './Editable';
import Notes from './Notes';
import createNoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import LaneActions from '../actions/LaneActions';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    i: number;
  }) {
    super(props);

    this.actions = createNoteActions(alt);

    const storeName = 'NoteStore-' + this.props.i;
    this.store = alt.createStore(NoteStore, storeName, this.actions);
    this.actions.init(getInitialData(storeName));
  }
  render() {
    const {i, name, ...props} = this.props;

    return (
      <div {...props}>
        <div className='lane-header'>
          <Editable className='lane-name' value={name}
            onEdit={this.edited.bind(null, LaneActions, 'name', this.props.i)} />
          <div className='lane-add-note'>
            <button onClick={() => this.addNote()}>+</button>
          </div>
        </div>
        <AltContainer
          stores={[this.store]}
          inject={{
            items: () => this.store.getState().notes || [],
          }}
        >
          <Notes onEdit={this.edited.bind(null, this.actions, 'task')} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    this.actions.create('New note');
  }
  edited(actions, field, id, value) {
    if(value) {
      actions.update({id, [field]: value});
    }
    else {
      actions.remove(id);
    }
  }
}
