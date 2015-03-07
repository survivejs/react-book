'use strict';
var markdownpdf = require('markdown-pdf');


main();

function main() {
    var mdDocs = [
        'TOC.md',
        'acknowledgments.md',
        'preface.md',
        'getting-started.md',
        'understanding-webpack.md',
        'build-automation.md',
        'asset-management.md',
        'webpack-and-react.md',
        'deployment-strategies.md',
        'optimizing-development.md',
        'debugging-webpack.md',
        'http2.md',
    ];
    var bookPath = 'book.pdf';

    markdownpdf({
        paperFormat: 'A5',
    }).concat.from(mdDocs).to(bookPath, function () {
        console.log('created', bookPath);
    });
}
