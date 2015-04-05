'use strict';
var markdownpdf = require('markdown-pdf');


main();

function main() {
    var mdDocs = [
        'TOC.md',
    ];

    var chapters = [
        'acknowledgments.md',
        'preface.md',
        'glossary.md',
        'getting-started.md',
        'understanding-webpack.md',
        'developing-with-webpack.md',
        'optimizing-development.md',
        'webpack-and-react.md',
        'deploying-applications.md',
        'asset-management.md',
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
