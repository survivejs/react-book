'use strict';

export default (actions) => {
  return class TodoStore {
    constructor() {
      this.bindActions(actions);
    }
    init(data) {
      this.setState(data || {lanes: []});
    }
  };
};
