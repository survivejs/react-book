import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import NoteStore from './NoteStore';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = [];
  }
  create(lane) {
    const lanes = this.lanes;

    lane.id = uuid.v4();
    lane.notes = lane.notes || [];

    this.setState({
      lanes: lanes.concat(lane)
    });
  }
  update({id, name}) {
    const lanes = this.lanes.map((lane) => {
      if(lane.id === id) {
        lane.name = name;
      }

      return lane;
    });

    this.setState({lanes});
  }
  delete(id) {
    this.setState({
      lanes: this.lanes.filter((lane) => lane.id !== id)
    });
  }
  attachToLane({laneId, noteId}) {
    if(!noteId) {
      this.waitFor(NoteStore);

      noteId = NoteStore.getState().notes.slice(-1)[0].id;
    }

    const lanes = this.lanes.map((lane) => {
      if(lane.id === laneId) {
        if(lane.notes.indexOf(noteId) === -1) {
          lane.notes.push(noteId);
        }
        else {
          console.warn('Already attached note to lane', lanes);
        }
      }

      return lane;
    });

    this.setState({lanes});
  }
  detachFromLane({laneId, noteId}) {
    const lanes = this.lanes.map((lane) => {
      if(lane.id === laneId) {
        const notes = lane.notes;
        const removeIndex = notes.indexOf(noteId);

        if(removeIndex !== -1) {
          lane.notes = notes.filter((note) => note.id !== removeIndex);
        }
        else {
          console.warn('Failed to remove note from a lane as it didn\'t exist', lanes);
        }
      }

      return lane;
    });

    this.setState({lanes});
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
