import React from 'react';
import ReactDOM from 'react-dom';
import Notes from './Notes.jsx';

if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}

ReactDOM.render(
  <Notes />,
  document.getElementById('app')
);
