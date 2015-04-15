require('./stylesheets/main.css');

var component = require('./component.js');
var app = document.getElementById('app');

app.appendChild(component());
