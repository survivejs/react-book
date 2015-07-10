import _ from 'lodash';
import update from 'react/lib/update';
import uuid from 'node-uuid';

import NoteDndActions from '../actions/NoteDndActions';

export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
    this.bindActions(NoteDndActions);
  }
  init(data) {
    var d = _.isArray(_.get(data, 'notes')) ? migrate(data) : {notes: []};

    this.setState(d);
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task, id: uuid.v4()}),
    });
  }
  move({source, target}) {
    const notes = this.notes;
    const sourceIndex = findIndex(notes, 'id', source.id);
    const targetIndex = findIndex(notes, 'id', target.id);

    if(sourceIndex >= 0 && targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [sourceIndex, 1],
            [targetIndex, 0, source],
          ],
        }),
      });
    }
    else if(targetIndex >= 0) {
      this.setState({
        notes: update(notes, {
          $splice: [
            [targetIndex, 0, source],
          ],
        }),
      });
    }
    else if(sourceIndex >= 0) {
      this.remove(sourceIndex);
    }
  }
  update({id, task}) {
    const notes = this.notes;

    notes[id].task = task;

    this.setState({
      notes: notes,
    });
  }
  remove(id) {
    const notes = this.notes;

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
}

function findIndex(arr, prop, value) {
  var o = arr.filter(c => c[prop] === value)[0];

  return o && arr.indexOf(o);
}

function migrate(data) {
  // patch data with ids in case they are missing
  if(data) {
    data.notes = data.notes.map((note) => {
      if(!note.id) {
        note.id = uuid.v4();
      }

      return note;
    });
  }

  return data;
}
