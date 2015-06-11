import React from 'react';

import Lane from './Lane';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class Lanes extends React.Component {
  constructor(props: {
    items: Array;
  }) {
    super(props);
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
            store={store} />
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
