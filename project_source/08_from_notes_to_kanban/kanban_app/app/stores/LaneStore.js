import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);
  }
  init(data) {
    this.setState(data || {lanes: []});
  }
  create(name) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.concat({
        name: name,
        notes: [],
      })
    });
  }
  update({id, lane}) {
    const lanes = this.lanes;
    const laneToUpdate = lanes[id];

    Object.keys(lane).forEach(function(k) {
      laneToUpdate[k] = lane[k];
    });

    lanes[id] = laneToUpdate;

    this.setState({
      lanes: lanes
    });
  }
  remove(id) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.slice(0, id).concat(lanes.slice(id + 1))
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
