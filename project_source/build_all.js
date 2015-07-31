#!/usr/bin/env node
var fs = require('fs');

main();

function main() {
  var files = fs.readdirSync('./');
  var directories = files.filter(function(file) {
    var stat = fs.statSync(file);

    return stat.isDirectory();
  }).filter(function(file) {
    return parseInt(file.split('_')[0], 10);
  }).map(function(file) {
    return file + '/kanban_app';
  });

  console.log(directories);

  // TODO: build each directory through webpack now
}
