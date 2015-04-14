'use strict';
import React from 'react';

export default (Component, initAction, store, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      initAction(storage.get(storageName));

      window.addEventListener('beforeunload', function(e){
        storage.set(storageName, store.getState());
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
