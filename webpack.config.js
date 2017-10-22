const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const common = {
  entry: {
    polyfills: './app/src/polyfills.js',
    main: ['react-hot-loader/patch', './app/src/main.js']
  },
  output: {
    path: path.resolve(__dirname, 'app/dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', { "modules": false }],
              'react'
            ],
            plugins: ['react-hot-loader/babel']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {loader: 'css-loader', options: {importLoaders: 1}},
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
  plugins: [
    new CleanWebpackPlugin(['./app/dist']),
    new HtmlWebpackPlugin({
      template: './app/src/index.ejs',
      excludeChunks: ['polyfills'] // inlined in template to conditionally load polyfills
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    })
  ]
};

const dev = Object.assign({}, common, {
  output: {
    ...common.output,
    filename: '[name].js'
  },
  plugins: [
    ...common.plugins,
    new webpack.NamedModulesPlugin()
  ],
  devtool: 'inline-source-map'
});
const prod = Object.assign({}, common, {
  output: {
    ...common.output,
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    ...common.plugins,
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.HashedModuleIdsPlugin()
  ],
  devtool: 'source-map'
});

if (NODE_ENV === 'development') {
  exports.default = dev;
} else if (NODE_ENV === 'production') {
  exports.default = prod;
}