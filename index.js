'use strict';
var markdownpdf = require('markdown-pdf');


main();

function main() {
    var mdDocs = [
        'TOC.md',
    ];

    var chapters = [
        'introduction.md',
        'preface.md',
        'glossary.md',
        'getting-started.md',
        'understanding-webpack.md',
        'developing-with-webpack.md',
        'webpack-and-react.md',
        'asset-management.md',
        'optimizing-development.md',
        'deploying-applications.md',
        'debugging-webpack.md',
        'http2.md',
    ].map(function(chapter) {
        return 'manuscript/' + chapter;
    });
    mdDocs = mdDocs.concat(chapters);

    var bookPath = 'book.pdf';

    markdownpdf({
        paperFormat: 'A4',
        cssPath: 'css/book.css',
    }).concat.from(mdDocs).to(bookPath, function () {
        console.log('created', bookPath);
    });
}
