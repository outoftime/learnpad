/* eslint-env node */
/* eslint-disable import/unambiguous */
/* eslint-disable import/no-commonjs */
/* eslint-disable comma-dangle */

const OfflinePlugin = require('offline-plugin');
const path = require('path');
const webpack = require('webpack');
const escapeRegExp = require('lodash/escapeRegExp');
const startsWith = require('lodash/startsWith');
const map = require('lodash/map');
const includes = require('lodash/includes');
const git = require('git-rev-sync');

function matchModule(modulePath) {
  const modulePattern = new RegExp(
    escapeRegExp(path.join('/node_modules', modulePath))
  );
  const moduleDependencyPattern = new RegExp(
    escapeRegExp(path.join('/node_modules', modulePath, 'node_modules'))
  );

  return filePath =>
    modulePattern.test(filePath) && !moduleDependencyPattern.test(filePath);
}

function directoryContentsExcept(directory, exceptions) {
  const fullExceptions = map(
    exceptions,
    exception => path.resolve(directory, exception)
  );

  return filePath =>
    startsWith(filePath, path.resolve(directory)) &&
      !includes(fullExceptions, filePath);
}

module.exports = {
  entry: './src/application.js',
  output: {
    path: path.resolve(__dirname, './static/compiled'),
    publicPath: 'compiled/',
    filename: 'application.js',
    sourceMapFilename: 'application.js.map',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ],
        loaders: ['babel-loader', 'transform-loader/cacheable?brfs-babel'],
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules/htmllint'),
        ],
        loader: 'transform-loader/cacheable?bulkify',
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules/PrettyCSS'),
          path.resolve(__dirname, 'node_modules/css'),
        ],
        loader: 'transform-loader/cacheable?brfs',
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules/postcss/lib/previous-map'),
          path.resolve(
            __dirname,
            'node_modules/stylelint/lib/getPostcssResult'
          ),
          matchModule('postcss/lib/previous-map'),
        ],
        loader: 'string-replace-loader',
        query: {
          search: /require\(['"]fs['"]\)/,
          replace: '{}',
        },
      },
      {
        test: /\.js$/,
        include: [
          matchModule('htmllint'),
        ],
        loader: 'string-replace-loader',
        query: {
          search: 'require(plugin)',
          replace: 'undefined',
        },
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(
            __dirname,
            'node_modules/stylelint/lib/utils/isAutoprefixable'
          ),
        ],
        loader: 'substitute-loader',
        query: {content: '() => false'},
      },
      {
        test: /\.js$/,
        include: [
          matchModule('redux'),
          matchModule('lodash-es'),
          matchModule('stylelint'),
          matchModule('redux-saga-debounce-effect'),
        ],
        loader: 'babel-loader',
      },
      {
        include: [
          path.resolve(
            __dirname,
            'node_modules/html-inspector/html-inspector.js'
          ),
        ],
        loader:
          'imports-loader?window=>{}!exports-loader?window.HTMLInspector',
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules/brace/worker'),
          matchModule('autoprefixer'),
          matchModule('postcss-scss'),
          matchModule('postcss-less'),
          matchModule('sugarss'),
          matchModule('stylelint/lib/dynamicRequire'),
          matchModule('css/lib/stringify/source-map-support'),
        ],
        loader: 'null-loader',
      },
      {
        test: /\.js$/,
        include: directoryContentsExcept(
          'node_modules/stylelint/lib/rules',
          [
            'index.js',
            'declaration-block-trailing-semicolon/index.js',
          ]
        ),
        loader: 'null-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.svg$/,
        loader: [
          'svg-react-loader',
          {
            loader: 'svgo-loader',
            query: {
              plugins: [
                {
                  removeXMLNS: true,
                },
                {
                  removeAttrs: {
                    active: true,
                    attrs: 'svg:data-name',
                  },
                },
              ],
            },
          },
        ],
      },
      {
        include: path.resolve(__dirname, 'locales'),
        loader: 'i18next-resource-store-loader',
        query: 'include=\\.json$',
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      FIREBASE_APP: 'popcode-development',
      FIREBASE_API_KEY: 'AIzaSyCHlo2RhOkRFFh48g779YSZrLwKjoyCcws',
      GIT_REVISION: git.short(),
      LOG_REDUX_ACTIONS: 'false',
      NODE_ENV: 'development',
      WARN_ON_DROPPED_ERRORS: 'false',
      GOOGLE_ANALYTICS_TRACKING_ID: 'UA-90316486-2'
    }),
    // it's always better if OfflinePlugin is the last plugin added https://github.com/NekR/offline-plugin#setup
    new OfflinePlugin({
      publicPath: '/compiled/',
      relativePaths: false,
      responseStrategy: 'network-first',
      externals: [
        '/',
        '/compiled/application.css',
      ],
      ServiceWorker: {
        navigateFallbackURL: '/',
      },
    }),
  ],
  resolve: {
    alias: {
      'github-api$': 'github-api/dist/components/GitHub.js',
      'github-api': 'github-api/dist/components',
      'html-inspector$': 'html-inspector/html-inspector.js',
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
};
