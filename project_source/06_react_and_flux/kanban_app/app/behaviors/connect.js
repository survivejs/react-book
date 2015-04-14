'use strict';
import React from 'react';

export default (Component, store) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.state = store.getState();
    }
    componentDidMount() {
      store.listen(this.storeChanged.bind(this));
    }
    componentWillUnmount() {
      store.unlisten(this.storeChanged.bind(this));
    }
    storeChanged() {
      this.setState(store.getState());
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
