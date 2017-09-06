const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV;

let webpackConfig = {
  entry: {
    sdk: './src/ts/apppot.ts',
  },
  output: {
    filename: 'apppot.min.js',
    library: ['AppPotSDK'],
    //libraryTarget: 'var'
    libraryTarget: 'umd'
  },
  resolve: {
    root: [path.join(__dirname)],
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      "global.GENTLY": false,
      "APPPOT_BUILD_UTC": Math.floor(Date.now()/1000),
      "APPPOT_VERSION": JSON.stringify(require("./package.json").version.split('.'))
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true
      },
    })
  ],
  node: {
    __dirname: true,
  }
};

module.exports = webpackConfig;
