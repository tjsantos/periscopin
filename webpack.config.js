const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: [/*'babel-polyfill',*/ './app/src/main.js'],
    output: {
        path: path.resolve(__dirname, 'app/dist'),
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
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('postcss-flexbugs-fixes'),
                                require('autoprefixer')
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    devServer: {
        contentBase: './app/dist'
    }
};
