'use strict';
import React from 'react';

export default (Component, cursor) => {
  return class Persist extends React.Component {
    constructor(props) {
      super(props);

      this.state = cursor.get();
    }
    componentDidMount() {
      const that = this;

      cursor.on('update', function() {
        that.setState(cursor.get());
      });
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};
