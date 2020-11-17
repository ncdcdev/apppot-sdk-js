const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV;

const baseConfig = {
  entry: {
    sdk: './src/ts/apppot.ts',
  },
  // output: {
  //   filename: 'apppot.js',
  //   path: path.join(__dirname, 'dist'),
  //   library: 'AppPotSDK',
  //   // library: {
  //   //   root: 'AppPotSDK',
  //   //   amd: 'apppot-sdk',
  //   //   commonjs: 'apppot-sdk'
  //   // },
  //   //libraryTarget: 'var'
  //   libraryTarget: 'umd',
  //   chunkLoading: false,
  //   wasmLoading: false
  // },
  optimization: {
    minimize: false
  },
  // target: ['web', 'node'],
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
      "APPPOT_BUILD_UTC": Math.floor(Date.now() / 1000),
      "APPPOT_VERSION": JSON.stringify(require("./package.json").version.split('.'))
    })
  ],
  node: {
    __dirname: true,
  }
};

const serverConfig = {
  ...baseConfig,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'apppot.node.js',
    libraryTarget: 'commonjs2',
  },
};

const clientConfig = {
  ...baseConfig,
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'apppot.web.js',
    library: 'AppPotSDK',
    libraryTarget: 'umd',
  }
};

module.exports = [serverConfig, clientConfig];
