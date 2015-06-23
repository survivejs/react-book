import alt from '../libs/alt';

class NoteDndActions {
  move(source, target) {
    this.dispatch({source, target});
  }
}

export default alt.createActions(NoteDndActions);
