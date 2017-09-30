const path = require('path');

module.exports = {
    entry: ['babel-polyfill', './app/js/main.js'],
    output: {
        path: path.resolve(__dirname, 'app/static'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react']
                    }
                }
            }
        ]
    }
};
