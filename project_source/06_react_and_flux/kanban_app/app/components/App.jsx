import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

@persist(NoteActions.init, NoteStore, storage, 'notes')
export default class App extends React.Component {
  render() {
    return (
      <div>
        <button onClick={this.addItem.bind(this)}>+</button>
        <AltContainer
          stores={[NoteStore]}
          inject={{
            items: () => NoteStore.getState().notes || []
          }}
        >
          <Notes onEdit={this.itemEdited.bind(this)} />
        </AltContainer>
      </div>
    );
  }
  addItem() {
    NoteActions.create('New task');
  }
  itemEdited(id, task) {
    if(task) {
      NoteActions.update(id, task);
    }
    else {
      NoteActions.remove(id);
    }
  }
}
