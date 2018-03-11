import {createAction} from 'redux-actions';

export const userDoneTyping = createAction('USER_DONE_TYPING');

export const focusLine = createAction(
  'FOCUS_LINE',
  (component, line, column) => ({component, line, column}),
  (_component, _line, _column, timestamp = Date.now()) => ({timestamp}),
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

export const courseWorkSelectorOpened = createAction(
  'COURSE_WORK_SELECTOR_OPENED',
);

export const openCourseWorkSelector = createAction(
  'OPEN_COURSE_WORK_SELECTOR',
);

export const courseWorkSelectorClosed = createAction(
  'COURSE_WORK_SELECTOR_CLOSED',
);

export const courseSelected = createAction(
  'COURSE_SELECTED',
);
