import AltContainer from 'alt/AltContainer';
import React from 'react';
import Notes from './Notes';

export default class Lane extends React.Component {
  constructor(props: {
    name: string;
    actions: Object;
    store: Object;
    notes: any; // XXX; why ?Object; doesn't work?
  }) {
    super(props);

    this.props.actions.init(this.props.notes);
  }
  render() {
    /* eslint-disable no-unused-vars */
    const {name, actions, store, notes, ...props} = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <div {...props}>
        <div className='header'>
          <div className='name'>{name}</div>
          <button onClick={this.addNote.bind(this)}>+</button>
        </div>
        <AltContainer
          stores={[this.props.store]}
          inject={{
            items: () => this.props.store.getState().notes || [],
          }}
        >
          <Notes onEdit={this.noteEdited.bind(this)} />
        </AltContainer>
      </div>
    );
  }
  addNote() {
    this.props.actions.create('New note');
  }
  noteEdited(id, note) {
    if(note) {
      this.props.actions.update(id, note);
    }
    else {
      this.props.actions.remove(id);
    }
  }
}
