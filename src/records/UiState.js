import {Record, Map} from 'immutable';

export default Record({
  isDraggingColumnDivider: false,
  isEditingInstructions: false,
  isExperimental: false,
  isTextSizeLarge: false,
  isTyping: false,
  notifications: new Map(),
  openTopBarMenu: null,
  requestedFocusedLine: null,
  saveIndicatorShown: false,
  focusedSelector: null,
}, 'UiState');
