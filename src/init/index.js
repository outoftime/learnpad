import Immutable from 'immutable';
import installDevTools from 'immutable-devtools';
import {install as installOfflinePlugin} from 'offline-plugin/runtime';

import {applicationLoaded} from '../actions';
import {loadRemoteConfig} from '../clients/firebase';
import {rehydrateProject} from '../clients/localStorage';
import {initMixpanel} from '../clients/mixpanel';
import createApplicationStore from '../createApplicationStore';
import {bugsnagClient, includeStoreInBugReports} from '../util/bugsnag';
import {getQueryParameters, setQueryParameters} from '../util/queryParams';

import initI18n from './initI18n';

async function initApplication(store) {
  const {
    gistId,
    snapshotKey,
    isExperimental,
    remoteConfig: remoteConfigOverrides,
  } = getQueryParameters(location.search);
  setQueryParameters({isExperimental});
  const rehydratedProject = rehydrateProject();
  const remoteConfig = await loadRemoteConfig();

  store.dispatch(
    applicationLoaded({
      snapshotKey,
      gistId,
      isExperimental,
      rehydratedProject,
      remoteConfig: {
        ...remoteConfig,
        ...remoteConfigOverrides,
      },
    }),
  );
}

export default function init() {
  const store = createApplicationStore();
  includeStoreInBugReports(store);

  initI18n();
  initMixpanel();

  initApplication(store);

  installDevTools(Immutable);
  installOfflinePlugin({
    onUpdateFailed() {
      bugsnagClient.notify('ServiceWorker update failed');
    },
  });

  return {store};
}
