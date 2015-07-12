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
        name: name
      })
    });
  }
  update({id, name}) {
    const lanes = this.lanes;

    lanes[id].name = name;

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
