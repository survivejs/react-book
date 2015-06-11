import alt from '../libs/alt';
import LaneActions from '../actions/LaneActions';

class LaneStore {
  constructor() {
    this.bindActions(LaneActions);

    this.lanes = [];
  }
  create(name) {
    const lanes = this.lanes;

    this.setState({
      lanes: lanes.concat({
        name: name,
      })
    });
  }
}

export default alt.createStore(LaneStore, 'LaneStore');
