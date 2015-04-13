'use strict';
import './main.css';

import React from 'react';
import TodoApp from './TodoApp';

main();

function main() {
    React.render(<TodoApp />, document.getElementById('app'));
}
