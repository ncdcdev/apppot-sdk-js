const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV;

let webpackConfig = {
  entry: {
    sdk: './src/ts/apppot.ts',
  },
  output: {
    filename: 'apppot.js',
    path: path.join(__dirname, 'dist'),
    library: 'AppPotSDK',
    //libraryTarget: 'var'
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: false
  },
  target: "node",
  resolve: {
    roots: [path.join(__dirname)],
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        'ts-loader'
      ]
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      "global.GENTLY": false,
      "APPPOT_BUILD_UTC": Math.floor(Date.now()/1000),
      "APPPOT_VERSION": JSON.stringify(require("./package.json").version.split('.'))
    })
  ],
  node: {
    __dirname: true,
  }
};

module.exports = webpackConfig;
