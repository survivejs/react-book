import React from 'react';

const connect = (Component, store) => {
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

export default (store) => {
  return (target) => connect(target, store);
};
