'use strict';
import './stylesheets/main.css';
import './stylesheets/lane.css';
import './stylesheets/note.css';

import React from 'react';
import App from './components/App';

main();

function main() {
    React.render(<App />, document.getElementById('app'));
}
