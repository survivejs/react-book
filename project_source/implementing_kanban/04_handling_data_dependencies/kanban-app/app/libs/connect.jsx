import React from 'react';
import connect from 'connect-alt';

const connectAdapter = (Component, actions) => {
  return props => <Component {...Object.assign({}, props, actions)} />
};

export default (state, actions) => {
  if(typeof state === 'function' ||
    (typeof state === 'object') &&
    Object.keys(state).length) {
    return target => connect(state)(connectAdapter(target, actions));
  }

  return target => connectAdapter(target, actions);
};