#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var async = require('async');
var webpack = require('webpack');

var config = require('./webpack.config');

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
      chapter: file,
      inputPath: path.join(__dirname, file, '/kanban_app'),
      outputPath: path.join(__dirname, 'builds', file)
    };
  });

  console.log('starting to build');

  async.eachLimit(io, 4, function(d, cb) {
    console.log('building ' + d.chapter);

    webpack(config(d), cb);
  }, function(err) {
    if(err) {
      return console.error(err);
    }
  });
}
