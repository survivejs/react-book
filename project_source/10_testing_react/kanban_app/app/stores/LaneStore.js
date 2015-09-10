import uuid from 'node-uuid';
import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';
import update from 'react/lib/update';
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

    this.removeNote(noteId);

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

    const removeNoteIndex = removeLane.notes.indexOf(noteId);

    removeLane.notes = removeLane.notes.slice(0, removeNoteIndex).
      concat(removeLane.notes.slice(removeNoteIndex + 1));
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
    const lanes = this.lanes;
    const laneIndex = lanes.findIndex((lane) => lane.id === id);

    if(laneIndex < 0) {
      console.warn('Failed to find lane', lanes, id);
    }

    return laneIndex;
  }
  move({sourceId, targetId}) {
    const lanes = this.lanes;
    const sourceLane = lanes.filter((lane) => {
      return lane.notes.indexOf(sourceId) >= 0;
    })[0];
    const targetLane = lanes.filter((lane) => {
      return lane.notes.indexOf(targetId) >= 0;
    })[0];
    const sourceNoteIndex = sourceLane.notes.indexOf(sourceId);
    const targetNoteIndex = targetLane.notes.indexOf(targetId);

    if(sourceLane === targetLane) {
      // move at once to avoid complications
      sourceLane.notes = update(sourceLane.notes, {
        $splice: [
          [sourceNoteIndex, 1],
          [targetNoteIndex, 0, sourceId]
        ]
      });
    }
    else {
      // get rid of the source
      sourceLane.notes.splice(sourceNoteIndex, 1);

      // and move it to target
      targetLane.notes.splice(targetNoteIndex, 0, sourceId);
    }

    this.setState({lanes});
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
