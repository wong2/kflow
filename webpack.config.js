var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var NpmInstallPlugin = require('npm-install-webpack-plugin')

module.exports = {
  entry: {
    app: './src/app.js',
    download: './src/download.js',
  },
  output: {
    path: path.resolve(__dirname, 'compiled'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use:  ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 9999999
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  externals: [{
    'electron-config': 'electron-config'
  }],
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new NpmInstallPlugin(),
  ],
  target: 'electron'
}
