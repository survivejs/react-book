import './main.css';

import React from 'react';
import App from './components/App';

main();

function main() {
  const app = document.createElement('div');

  document.body.appendChild(app);

  React.render(<App />, app);
}