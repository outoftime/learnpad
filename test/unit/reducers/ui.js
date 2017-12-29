import test from 'tape';
import Immutable from 'immutable';
import tap from 'lodash/tap';
import partial from 'lodash/partial';
import reducerTest from '../../helpers/reducerTest';
import reducer, {DEFAULT_WORKSPACE} from '../../../src/reducers/ui';
import {
  gistNotFound,
  gistImportError,
  updateProjectSource,
} from '../../../src/actions/projects';
import {
  dragDivider,
  startDragDivider,
  stopDragDivider,
  storeResizableSectionRef,
  storeDividerRef,
  userDoneTyping,
  focusLine,
  editorFocusedRequestedLine,
  notificationTriggered,
  userDismissedNotification,
  toggleTopBarMenu,
} from '../../../src/actions/ui';
import {
  snapshotCreated,
  snapshotExportError,
  snapshotImportError,
  snapshotNotFound,
  gistExportNotDisplayed,
  gistExportError,
  repoExportNotDisplayed,
  repoExportError,
} from '../../../src/actions/clients';
import {EmptyGistError} from '../../../src/clients/github';
import {
  userLoggedOut,
} from '../../../src/actions/user';
import {applicationLoaded} from '../../../src/actions/';

const initialState = Immutable.fromJS({
  editors: {
    typing: false,
    requestedFocusedLine: null,
  },
  workspace: DEFAULT_WORKSPACE,
  notifications: new Immutable.Map(),
  topBar: {openMenu: null},
});

function withNotification(type, severity, payload = {}) {
  return initialState.setIn(
    ['notifications', type],
    Immutable.fromJS({type, severity, payload, metadata: {}}),
  );
}

const gistId = '12345';

test('dragColumnDivider', reducerTest(
  reducer,
  initialState,
  partial(
    dragDivider,
    'columns',
    {
      dividerWidth: {minWidth: 4},
      columnWidths: [
        {width: 400, minWidth: 300},
        {width: 400, minWidth: 300},
      ],
      deltaX: 5,
      lastX: 400,
      x: 405,
    },
  ),
  initialState.setIn(
    ['workspace', 'columns', 'flex'],
    new Immutable.List(['0 1 405px', '1', '1']),
  ),
));

test('dragEditorDivider', (t) => {
  t.test('dragging first divider down', reducerTest(
    reducer,
    initialState,
    partial(dragDivider,
      'editors',
      {
        index: 0,
        dividerHeights: [
          {minHeight: 4},
          {minHeight: 4},
        ],
        editorHeights: [
          {height: 100, minHeight: 85},
          {height: 100, minHeight: 85},
          {height: 100, minHeight: 85},
        ],
        deltaY: 5,
        lastY: 100,
        y: 105,
      },
    ),
    initialState.setIn(
      ['workspace', 'editors', 'flex'],
      new Immutable.List(['0 1 105px', '1', '0 1 100px']),
    ),
  ));
  t.test('dragging second divider down', reducerTest(
    reducer,
    initialState,
    partial(
      dragDivider,
      'editors',
      {
        index: 1,
        dividerHeights: [
          {minHeight: 4},
          {minHeight: 4},
        ],
        editorHeights: [
          {height: 100, minHeight: 85},
          {height: 100, minHeight: 85},
          {height: 100, minHeight: 85},
        ],
        deltaY: 5,
        lastY: 204,
        y: 209,
      },
    ),
    initialState.setIn(
      ['workspace', 'editors', 'flex'],
      new Immutable.List(['0 1 100px', '0 1 105px', '1']),
    ),
  ));
});

test('startDragDivider', reducerTest(
  reducer,
  initialState,
  partial(
    startDragDivider,
    'columns',
  ),
  initialState.setIn(
    ['workspace', 'columns', 'isDraggingDivider'],
    true,
  ),
));

test('stopDragDivider', reducerTest(
  reducer,
  initialState,
  partial(
    stopDragDivider,
    'columns',
  ),
  initialState.setIn(
    ['workspace', 'columns', 'isDraggingDivider'],
    false,
  ),
));

test('storeResizableSectionRef', reducerTest(
  reducer,
  initialState,
  partial(
    storeResizableSectionRef,
    'columns',
    0,
    'ref',
  ),
  initialState.setIn(
    ['workspace', 'columns', 'refs'],
    new Immutable.List(['ref']),
  ),
));

test('storeDividerRef', reducerTest(
  reducer,
  initialState,
  partial(
    storeDividerRef,
    'columns',
    0,
    'ref',
  ),
  initialState.setIn(
    ['workspace', 'columns', 'dividerRefs'],
    new Immutable.List(['ref']),
  ),
));

test('gistNotFound', reducerTest(
  reducer,
  initialState,
  partial(gistNotFound, gistId),
  withNotification('gist-import-not-found', 'error', {gistId}),
));

test('gistImportError', reducerTest(
  reducer,
  initialState,
  partial(gistImportError, gistId),
  withNotification('gist-import-error', 'error', {gistId}),
));

test('updateProjectSource', reducerTest(
  reducer,
  initialState,
  updateProjectSource,
  initialState.setIn(['editors', 'typing'], true),
));

test('userDoneTyping', reducerTest(
  reducer,
  initialState.setIn(['editors', 'typing'], true),
  userDoneTyping,
  initialState,
));

test('userLoggedOut', (t) => {
  t.test('with no top bar menu open', reducerTest(
    reducer,
    initialState,
    userLoggedOut,
    initialState,
  ));

  t.test('with currentUser menu open', reducerTest(
    reducer,
    initialState.setIn(['topBar', 'openMenu'], 'currentUser'),
    userLoggedOut,
    initialState,
  ));

  t.test('with different menu open', reducerTest(
    reducer,
    initialState.setIn(['topBar', 'openMenu'], 'silly'),
    userLoggedOut,
    initialState.setIn(['topBar', 'openMenu'], 'silly'),
  ));
});

tap('https://gists.github.com/12345abc', (url) => {
  test('gistExportNotDisplayed', reducerTest(
    reducer,
    initialState,
    partial(gistExportNotDisplayed, url),
    withNotification('gist-export-complete', 'notice', {url}),
  ));
});

test('gistExportError', (t) => {
  t.test('with generic error', reducerTest(
    reducer,
    initialState,
    partial(gistExportError, new Error()),
    withNotification('gist-export-error', 'error'),
  ));

  t.test('with empty gist error', reducerTest(
    reducer,
    initialState,
    partial(gistExportError, new EmptyGistError()),
    withNotification('empty-gist', 'error'),
  ));
});

test('snapshotExportError', reducerTest(
  reducer,
  initialState,
  partial(snapshotExportError, new Error()),
  withNotification('snapshot-export-error', 'error'),
));

test('snapshotImportError', reducerTest(
  reducer,
  initialState,
  partial(snapshotImportError, new Error()),
  withNotification('snapshot-import-error', 'error'),
));

test('snapshotNotFound', reducerTest(
  reducer,
  initialState,
  snapshotNotFound,
  withNotification('snapshot-not-found', 'error'),
));

tap('https://popcode-mat.github.io/my-popcode-repo', (url) => {
  test('repoExportNotDisplayed', reducerTest(
    reducer,
    initialState,
    partial(repoExportNotDisplayed, url),
    withNotification('repo-export-complete', 'notice', {url}),
  ));
});

test('repoExportError', (t) => {
  t.test('with generic error', reducerTest(
    reducer,
    initialState,
    partial(repoExportError, new Error()),
    withNotification('repo-export-error', 'error'),
  ));
});

test('focusLine', reducerTest(
  reducer,
  initialState,
  partial(focusLine, 'javascript', 4, 2),
  initialState.setIn(
    ['editors', 'requestedFocusedLine'],
    new Immutable.Map({language: 'javascript', line: 4, column: 2}),
  ),
));

test('editorFocusedRequestedLine', reducerTest(
  reducer,
  initialState.setIn(
    ['editors', 'requestedFocusedLine'],
    new Immutable.Map({language: 'javascript', line: 4, column: 2}),
  ),
  editorFocusedRequestedLine,
  initialState,
));

test('notificationTriggered', (t) => {
  t.test('with no payload', reducerTest(
    reducer,
    initialState,
    partial(notificationTriggered, 'some-error', 'error'),
    withNotification('some-error', 'error'),
  ));

  t.test('with payload', reducerTest(
    reducer,
    initialState,
    partial(notificationTriggered, 'some-error', 'error', {goofy: true}),
    withNotification('some-error', 'error', {goofy: true}),
  ));
});

test('userDismissedNotification', reducerTest(
  reducer,
  withNotification('some-error', 'error'),
  partial(userDismissedNotification, 'some-error'),
  initialState,
));

test('applicationLoaded', (t) => {
  t.test('isExperimental = true', reducerTest(
    reducer,
    initialState,
    partial(applicationLoaded, {gistId: null, isExperimental: true}),
    initialState.set('experimental', true),
  ));

  t.test('isExperimental = false', reducerTest(
    reducer,
    initialState,
    partial(applicationLoaded, {gistId: null, isExperimental: false}),
    initialState.set('experimental', false),
  ));
});

tap('123-456', snapshotKey =>
  test('snapshotCreated', reducerTest(
    reducer,
    initialState,
    partial(snapshotCreated, snapshotKey),
    withNotification('snapshot-created', 'notice', {snapshotKey}),
  )),
);

test('toggleTopBarMenu', (t) => {
  t.test('with no menu open', reducerTest(
    reducer,
    initialState,
    partial(toggleTopBarMenu, 'silly'),
    initialState.setIn(['topBar', 'openMenu'], 'silly'),
  ));

  t.test('with specified menu open', reducerTest(
    reducer,
    initialState.setIn(['topBar', 'openMenu'], 'silly'),
    partial(toggleTopBarMenu, 'silly'),
    initialState,
  ));

  t.test('with different menu open', reducerTest(
    reducer,
    initialState.setIn(['topBar', 'openMenu'], 'goofy'),
    partial(toggleTopBarMenu, 'silly'),
    initialState.setIn(['topBar', 'openMenu'], 'silly'),
  ));
});
