'use strict';
import './main.css';

import React from 'react';
import TodoItem from './TodoItem';

main();

function main() {
    React.render(<TodoItem />, document.getElementById('app'));
}
