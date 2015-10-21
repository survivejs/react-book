#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var flatten = require('array-flatten');
var async = require('async');
var glob = require('glob');
var marked = require('marked');
var request = require('request');

main();

function main() {
  getLinks(path.resolve(__dirname, '../manuscript'), function(err, urls) {
    if(err) {
      return console.error(err);
    }

    checkLinks(urls, function(err) {
      if(err) {
        return console.error(err);
      }

      console.log('\nAll links were fine!');
    });
  });
}

function getLinks(dir, cb) {
  glob(dir + '**/*.md', function(err, files) {
    if(err) {
      return cb(err);
    }

    async.map(files, parseLinks, function(err, allLinks) {
      if(err) {
        return cb(err);
      }

      cb(null, flatten(allLinks));
    });
  })
}

function parseLinks(filePath, cb) {
  fs.readFile(filePath, {
    encoding: 'utf8'
  }, function(err, d) {
    if(err) {
      return cb(err);
    }

    var renderer = new marked.Renderer();
    var ret = [];

    renderer.link = function(link) {
      ret.push(link);
    };

    marked.parser(marked.lexer(d), {
      renderer: renderer
    });

    cb(null, ret);
  });
}

function checkLinks(urls, cb) {
  async.eachLimit(urls, 10, function(url, cb) {
    console.log('Checking ' + url);

    if(url.indexOf('mailto:') === 0) {
      return cb();
    }

    request.get(url, {timeout: 10000}, function(err) {
      if(err) {
        console.error('Failed to find ' + url);

        return cb(err);
      }

      console.log('Checked ' + url);

      cb();
    });
  }, cb);
}
