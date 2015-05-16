'use strict';
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('../webpack.config');
var ip = '0.0.0.0';

new WebpackDevServer(webpack(config), {
    contentBase: __dirname,
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
}).listen(config.port, ip, function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('Listening at ' + ip + ':' + config.port);
});
