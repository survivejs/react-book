import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import findIndex from '../libs/find_index';
import update from 'react/lib/update';

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

    this.removeNote(noteId);

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
  removeNote(noteId) {
    const lanes = this.lanes;
    const removeLane = lanes.filter((lane) => {
      return lane.notes.indexOf(noteId) >= 0;
    })[0];

    if(!removeLane) {
      return;
    }

    const removeNoteId = removeLane.notes.indexOf(noteId);

    removeLane.notes = removeLane.notes.slice(0, removeNoteId).
      concat(removeLane.notes.slice(removeNoteId + 1));
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
  move({sourceData, targetData}) {
    const lanes = this.lanes;
    const sourceId = sourceData.id;
    const targetId = targetData.id;
    const sourceLane = lanes.filter((lane) => {
      return lane.notes.indexOf(sourceId) >= 0;
    })[0];
    const targetLane = lanes.filter((lane) => {
      return lane.notes.indexOf(targetId) >= 0;
    })[0];
    const sourceNoteId = sourceLane.notes.indexOf(sourceId);
    const targetNoteId = targetLane.notes.indexOf(targetId);

    if(sourceLane === targetLane) {
      // move at once to avoid complications
      sourceLane.notes = update(sourceLane.notes, {
        $splice: [
          [sourceNoteId, 1],
          [targetNoteId, 0, sourceId]
        ]
      });
    }
    else {
      // get rid of the source
      sourceLane.notes.splice(sourceNoteId, 1);

      // and move it to target
      targetLane.notes.splice(targetNoteId, 0, sourceId);
    }

    this.setState({lanes});
  }
}

export default alt.createStore(LaneStore, 'LaneStore');