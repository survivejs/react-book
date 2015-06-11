import React from 'react';

import Lane from './Lane';
import persist from '../decorators/persist';
import alt from '../libs/alt';
import storage from '../libs/storage';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

const noteStorageName = 'notes';

console.log('alt', alt);

@persist(storage, noteStorageName, () => {
  // TODO: query NoteStores from alt now
  return {};
  /*
  const alts = altManager.all();
  var ret = {};

  Object.keys(alts).forEach(function(k) {
    // XXX: store name leaks to here
    ret[k] = alts[k].getStore('NoteStore').getState();
  });

  return ret;
  */
})
export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);

    this.notes = storage.get(noteStorageName);
  }
  render() {
    var lanes = this.props.items;

    return (
      <div className='lanes'>{lanes.map((lane, i) => {
        const id = 'lane-' + i;
        const actions = getOrCreateActions(NoteActions, 'NoteActions-' + i);
        const store = getOrCreateStore(NoteStore, 'NoteStore-' + i, actions);

        return (
          <Lane className='lane' key={id}
            {...lane}
            actions={actions}
            store={store}
            notes={this.notes[id]} />
        );
      })}</div>
    );
  }
}

function getOrCreateActions(actionsClass, name) {
  let actions = alt.getActions(name);

  if(actions) {
    return actions;
  }

  actions = alt.createActions(actionsClass);
  alt.addActions(name, actions);

  return actions;
}

function getOrCreateStore(storeClass, name, actions) {
  const store = alt.getStore(name);

  if(store) {
    return store;
  }

  return alt.createStore(storeClass, name, actions);
}
