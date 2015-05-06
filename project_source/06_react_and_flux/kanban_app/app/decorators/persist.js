import React from 'react';

const persist = (Component, initAction, store, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      initAction(storage.get(storageName));

      window.addEventListener('beforeunload', function() {
        storage.set(storageName, store.getState());
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};

export default (initAction, store, storage, storageName) => {
  return (target) => persist(target, initAction, store, storage, storageName);
};
