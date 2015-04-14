'use strict';

export default (alt) => {
  function FinalStore() {
    this.dispatcher.register(function(payload) {
      var stores = Object.keys(this.alt.stores).reduce(function(arr, store) {
        arr.push(this.alt.stores[store].dispatchToken);

        return arr;
      }.bind(this), []);

      this.waitFor(stores);

      // XXXXX: how to get whole tree?
      console.log('got payload', payload);
      //this.setState({ payload: payload });
    }.bind(this));
  }

  return alt.createStore(FinalStore, 'AltFinalStore', false);
};
