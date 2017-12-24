import {createAction} from 'redux-actions';

export const userDoneTyping = createAction('USER_DONE_TYPING');

export const focusLine = createAction(
  'FOCUS_LINE',
  (language, line, column) => ({language, line, column}),
  (_language, _line, _column, timestamp = Date.now()) => ({timestamp}),
);

export const editorFocusedRequestedLine = createAction(
  'EDITOR_FOCUSED_REQUESTED_LINE',
);

export const dragRowDivider = createAction(
  'DRAG_ROW_DIVIDER',
);

export const dragColumnDivider = createAction(
  'DRAG_COLUMN_DIVIDER',
);

export const startDragColumnDivider = createAction(
  'START_DRAG_COLUMN_DIVIDER',
);

export const stopDragColumnDivider = createAction(
  'STOP_DRAG_COLUMN_DIVIDER',
);

export const dragOutputDivider = createAction(
  'DRAG_OUTPUT_DIVIDER',
);

export const startDragOutputDivider = createAction(
  'START_DRAG_OUTPUT_DIVIDER',
);

export const stopDragOutputDivider = createAction(
  'STOP_DRAG_OUTPUT_DIVIDER',
);

export const storeOutputRowRef = createAction(
  'STORE_OUTPUT_ROW_REF',
  (index, row) => ({index, row}),
);

export const popOutProject = createAction(
  'POP_OUT_PROJECT',
);

export const notificationTriggered = createAction(
  'NOTIFICATION_TRIGGERED',
  (type, severity = 'error', payload = {}) => ({type, severity, payload}),
);

export const userDismissedNotification = createAction(
  'USER_DISMISSED_NOTIFICATION',
  type => ({type}),
);

export const updateNotificationMetadata = createAction(
  'UPDATE_NOTIFICATION_METADATA',
  (type, metadata) => ({type, metadata}),
);

export const toggleEditorTextSize = createAction(
  'TOGGLE_EDITOR_TEXT_SIZE',
);

export const toggleTopBarMenu = createAction(
  'TOGGLE_TOP_BAR_MENU',
);

export const closeTopBarMenu = createAction(
  'CLOSE_TOP_BAR_MENU',
);
