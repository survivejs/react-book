import Alt from 'alt';
import AltManager from 'alt/utils/AltManager';
import React from 'react';
import Lane from './Lane';
import persist from '../decorators/persist';
import storage from '../libs/storage';

const altManager = new AltManager(Alt);
const noteStorageName = 'notes';

@persist(storage, noteStorageName, () => {
  const alts = altManager.all();
  var ret = {};

  Object.keys(alts).forEach(function(k) {
    // XXX: store name leaks to here
    ret[k] = alts[k].getStore('NoteStore').getState();
  });

  return ret;
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
      <ul className='lanes'>{lanes.map((lane, i) => {
        const id = 'lane-' + i;

        return (
          <li className='lane' key={id}>
            <Lane {...lane}
              id={id}
              manager={altManager}
              notes={this.notes[id]} />
          </li>
        );
      })}</ul>
    );
  }
}
