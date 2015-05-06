import React from 'react';

const root = (Component, tree, storage, storageName) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      var data = storage.get(storageName);

      if(data) {
        tree.set(data);
        tree.commit();
      }

      window.addEventListener('beforeunload', function() {
        storage.set(storageName, tree.get());
      }, false);
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};

export default (tree, storage, storageName) => {
  // storage expects
  // * get(storageName)
  // * set(storageName, data)
  return (target) => root(target, tree, storage, storageName);
};
