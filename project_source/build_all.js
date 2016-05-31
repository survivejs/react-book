#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const async = require('async');
const webpack = require('webpack');

const config = require('./webpack.config');

const PARTS = [
  'getting_started',
  'implementing_kanban'
];

main();

function main() {
  const chapters = getChapters(PARTS);

  console.log('starting to build');

  async.eachLimit(chapters, 4, function(d, cb) {
    console.log('building ' + d.chapter);

    webpack(config(d), cb);
  }, function(err) {
    if(err) {
      return console.error(err);
    }
  });
}

function getChapters(parts) {
  return _.concat.apply(null, parts.map(function(part) {
    const chapters = fs.readdirSync(part).filter(function(file) {
      return parseInt(file.split('_')[0], 10);
    });

    return chapters.map(function(chapter) {
      const partName = part.replace(/_/g, '-');
      const chapterName = chapter.split('_').slice(1).join('_').replace(/_/g, '-');

      return {
        part: part,
        chapter: chapterName,
        inputPath: path.join(__dirname, part, chapter, 'kanban-app'),
        outputPath: path.join(__dirname, 'builds', partName, chapterName)
      }
    }).filter(function(o) {
      return fs.existsSync(o.inputPath);
    });
  }));
}
