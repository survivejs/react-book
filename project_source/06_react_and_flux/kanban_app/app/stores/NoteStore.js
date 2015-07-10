import _ from 'lodash';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);
  }
  init(data) {
    var d = _.isArray(_.get(data, 'notes')) ? data : {notes: []};

    this.setState(d);
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task}),
    });
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({notes});
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
}

export default alt.createStore(NoteStore);
