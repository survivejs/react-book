'use strict';
var markdownpdf = require('markdown-pdf');


main();

function main() {
    var mdDocs = [
        'TOC.md',
        'acknowledgments.md',
        'preface.md',
        'getting-started.md',
        'build-automation.md',
        'loading-assets.md',
        'inlining-assets.md',
        'introduction-to-react.md',
        'webpack-and-react.md',
        'deployment.md',
        'optimizing-development.md',
    ];
    var bookPath = 'book.pdf';

    markdownpdf({
        paperFormat: 'A5',
    }).concat.from(mdDocs).to(bookPath, function () {
        console.log('created', bookPath);
    });
}
