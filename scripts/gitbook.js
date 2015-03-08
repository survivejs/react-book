'use strict';

var gitbook = require('gitbook');


main();

function main() {
    var config = {
        input: '.',
        generator: 'ebook',
    };

    gitbook.generate.folder(config).then(function() {
        console.log('Done!');
    }, function(err) {
        console.error(err);
    });
}
