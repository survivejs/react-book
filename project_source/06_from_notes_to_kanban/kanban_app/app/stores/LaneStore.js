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
    const lanes = this.lanes;
    const targetId = this.findLane(id);

    if(targetId < 0) {
      return;
    }

    lanes[targetId].name = name;

    this.setState({lanes});
  }
  delete(id) {
    const lanes = this.lanes;
    const targetId = this.findLane(id);

    if(targetId < 0) {
      return;
    }

    this.setState({
      lanes: lanes.slice(0, targetId).concat(lanes.slice(targetId + 1))
    });
  }
  attachToLane({laneId, noteId}) {
    if(!noteId) {
      this.waitFor(NoteStore);

      noteId = NoteStore.getState().notes.slice(-1)[0].id;
    }

    const lanes = this.lanes;
    const targetId = this.findLane(laneId);

    if(targetId < 0) {
      return;
    }

    const lane = lanes[targetId];

    if(lane.notes.indexOf(noteId) === -1) {
      lane.notes.push(noteId);

      this.setState({lanes});
    }
    else {
      console.warn('Already attached note to lane', lanes);
    }
  }
  detachFromLane({laneId, noteId}) {
    const lanes = this.lanes;
    const targetId = this.findLane(laneId);

    if(targetId < 0) {
      return;
    }

    const lane = lanes[targetId];
    const notes = lane.notes;
    const removeIndex = notes.indexOf(noteId);

    if(removeIndex !== -1) {
      lane.notes = notes.slice(0, removeIndex).
        concat(notes.slice(removeIndex + 1));

      this.setState({lanes});
    }
    else {
      console.warn('Failed to remove note from a lane as it didn\'t exist', lanes);
    }
  }
  findLane(id) {
    let lanes = this.lanes;
    const laneIndex = lanes.findIndex((lane) => lane.id === id);

    if(laneIndex < 0) {
      console.warn('Failed to find lane', lanes, id);
    }

    return laneIndex;
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
