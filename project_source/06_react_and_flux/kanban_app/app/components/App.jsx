import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import persist from '../decorators/persist';
import storage from '../libs/storage';

const noteStorageName = 'notes';

@persist(storage, noteStorageName, () => NoteStore.getState())
export default class App extends React.Component {
  constructor(props) {
    super(props);

    NoteActions.init(storage.get(noteStorageName));
  }
  render() {
    return (
      <div>
        <button onClick={() => this.addItem()}>+</button>
        <AltContainer
          stores={[NoteStore]}
          inject={ {
            items: () => NoteStore.getState().notes || []
          } }
        >
          <Notes onEdit={(id, task) => this.itemEdited(id, task)} />
        </AltContainer>
      </div>
    );
  }
  addItem() {
    NoteActions.create('New task');
  }
  itemEdited(id, task) {
    if(task) {
      NoteActions.update({id, task});
    }
    else {
      NoteActions.remove(id);
    }
  }
}
