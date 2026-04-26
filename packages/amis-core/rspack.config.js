// rspack.config.js - High performance build for amis-core
const path = require('path');

/** @type {import('@rspack/cli').Configuration} */
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    library: {
      name: 'amisCore',
      type: 'commonjs',
      export: 'named'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic'
                },
                legacyDecorator: true
              }
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        type: 'css'
      }
    ]
  },
  externals: [
    function({ context, request }, callback) {
      if (/^amis-formula$/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      if (/^lodash-es\//.test(request)) {
        return callback(null, 'commonjs ' + request.replace('lodash-es', 'lodash'));
      }
      callback();
    }
  ],
  builtins: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      '__buildVersion': JSON.stringify(require('./package.json').version),
      '__buildTime': JSON.stringify(new Date().toISOString())
    }
  },
  mode: 'production',
  devtool: false
};
