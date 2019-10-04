import 'core-js';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
import 'raf/polyfill';
import './init/DOMParserShim';

import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import installDevTools from 'immutable-devtools';
import {install as installOfflinePlugin} from 'offline-plugin/runtime';

import {bugsnagClient} from './util/bugsnag';
import Application from './components/Application';
import initI18n from './util/initI18n';

installDevTools(Immutable);
installOfflinePlugin({
  onUpdateFailed() {
    bugsnagClient.notify('ServiceWorker update failed');
  },
});

initI18n();

ReactDOM.render(
  React.createElement(Application),
  document.getElementById('main'),
);
