import alt from '../libs/alt';

class LaneActions {
  init(lanes) {
    this.dispatch(lanes);
  }
  create(name) {
    this.dispatch(name);
  }
  update(id, name) {
    this.dispatch({id, name});
  }
  remove(id) {
    this.dispatch(id);
  }
}

export default alt.createActions(LaneActions);
