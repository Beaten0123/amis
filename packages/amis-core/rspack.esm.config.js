// rspack.esm.config.js - ESM build for amis-core
const path = require('path');

/** @type {import('@rspack/cli').Configuration} */
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'esm'),
    filename: '[name].js',
    library: {
      name: 'amisCore',
      type: 'module'
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
                }
              }
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  externals: [
    function({ context, request }, callback) {
      if (/^amis-formula$/.test(request)) {
        return callback(null, 'module ' + request);
      }
      if (/^lodash-es\//.test(request)) {
        return callback(null, 'module ' + request);
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
