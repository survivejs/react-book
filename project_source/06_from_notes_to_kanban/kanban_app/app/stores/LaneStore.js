import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import findIndex from '../libs/find_index';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = this.lanes || [];
  }
  create(lane) {
    const lanes = this.lanes;

    lane.notes = lane.notes || [];

    this.setState({
      lanes: lanes.concat(lane)
    });
  }
  update(lane) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', lane.id);

    lanes[targetId].name = lane.name;

    this.setState({lanes});
  }
  delete(id) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', id);

    this.setState({
      lanes: lanes.slice(0, targetId).concat(lanes.slice(targetId + 1))
    });
  }
  attachToLane({laneId, noteId}) {
    const lanes = this.lanes;
    const targetId = findIndex(lanes, 'id', laneId);

    if(targetId < 0) {
      return console.warn('Failed to find target lane');
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
    const targetId = findIndex(lanes, 'id', laneId);

    if(targetId < 0) {
      return console.warn('Failed to find target lane');
    }

    const lane = lanes[targetId];
    const notes = lane.notes;
    const removeId = notes.indexOf(noteId);

    if(lane.notes.indexOf(removeId) === -1) {
      lane.notes = notes.slice(0, removeId).concat(notes.slice(removeId + 1));

      this.setState({lanes});
    }
    else {
      console.warn('Failed to remove note from a lane as it didn\'t exist', lanes);
    }
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
