import update from 'react/lib/update';
import uuid from 'node-uuid';
import findIndex from 'lodash/array/findIndex';
import isObject from 'lodash/lang/isObject';

export default class NoteStore {
  constructor(actions: Object) {
    this.bindActions(actions);
  }
  init(data) {
    this.setState(data ? migrate(data) : {notes: []});
  }
  create(task) {
    const notes = this.notes;

    this.setState({
      notes: notes.concat({task, id: uuid.v4()}),
    });
  }
  move({source, target}) {
    const notes = this.notes;
    const sourceIndex = findIndex(notes, {
      id: source.id,
    });
    const targetIndex = findIndex(notes, {
      id: target.id,
    });
    var splices = [[targetIndex, 0, source]];

    if(sourceIndex >= 0) {
      splices.unshift([sourceIndex, 1]);
    }

    this.setState({
      notes: update(this.notes, {
        $splice: splices,
      }),
    });
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

    if(isObject(id)) {
      id = findIndex(notes, id);
    }

    if(id < 0) {
      return;
    }

    this.setState({
      notes: notes.slice(0, id).concat(notes.slice(id + 1)),
    });
  }
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
