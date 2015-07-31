#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

main();

function main() {
  var files = fs.readdirSync('./');
  var io = files.filter(function(file) {
    var stat = fs.statSync(file);

    return stat.isDirectory();
  }).filter(function(file) {
    return parseInt(file.split('_')[0], 10);
  }).map(function(file) {
    return {
      input: path.join(__dirname, file, '/kanban_app'),
      output: path.join(__dirname, 'builds', file)
    };
  });

  console.log(io);

  // TODO: build each directory through webpack now
}
