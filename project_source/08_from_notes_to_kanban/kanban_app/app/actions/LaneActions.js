import alt from '../libs/alt';

class LaneActions {
  init(lanes) {
    this.dispatch(lanes);
  }
  create(name) {
    this.dispatch(name);
  }
}

export default alt.createActions(LaneActions);
