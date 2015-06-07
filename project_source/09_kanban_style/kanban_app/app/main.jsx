import './stylesheets/main.css';
import './stylesheets/lane.css';
import './stylesheets/note.css';

import React from 'react';
import App from './components/App';

main();

function main() {
    var app = document.createElement('div');
    document.body.appendChild(app);

    React.render(<App />, app);
}
