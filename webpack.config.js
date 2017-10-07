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
                  // 'postcss-loader'
                //     {
                // loader: require.resolve('postcss-loader'),
                // options: {
                //   // Necessary for external CSS imports to work
                //   // https://github.com/facebookincubator/create-react-app/issues/2677
                //   ident: 'postcss',
                //   plugins: () => [
                //     require('postcss-flexbugs-fixes'),
                //     autoprefixer({
                //       browsers: [
                //         '>1%',
                //         'last 4 versions',
                //         'Firefox ESR',
                //         'not ie < 9', // React doesn't support IE8 anyway
                //       ],
                //       flexbox: 'no-2009',
                //     }),
                //   ],
                // },
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    }
};
