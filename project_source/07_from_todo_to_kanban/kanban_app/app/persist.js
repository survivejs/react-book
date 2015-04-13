'use strict';
import React from 'react';

export default (Component, initAction, store, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      initAction(storage.get(storageName));
    }
    componentDidMount() {
      store.listen(this.storeChanged.bind(this));
    }
    componentWillUnmount() {
      store.unlisten(this.storeChanged.bind(this));
    }
    storeChanged(d) {
      storage.set(storageName, d);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
