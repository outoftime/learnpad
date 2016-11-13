import Immutable from 'immutable';
import pick from 'lodash/pick';

const defaultState = new Immutable.Map().
  set('editors', new Immutable.Map({typing: false})).
  set('requestedLine', null).
  set('minimizedComponents', new Immutable.Set()).
  set('notifications', new Immutable.Set()).
  set(
    'dashboard',
    new Immutable.Map().
      set('isOpen', false).
      set('activeSubmenu', null)
  );

function ui(stateIn, action) {
  let state = stateIn;
  if (state === undefined) {
    state = defaultState;
  }

  switch (action.type) {
    case 'USER_TYPING':
      return state.setIn(['editors', 'typing'], true);

    case 'USER_DONE_TYPING':
      return state.setIn(['editors', 'typing'], false);

    case 'DASHBOARD_TOGGLED':
      return state.updateIn(['dashboard', 'isOpen'], (isOpen) => !isOpen).
        setIn(['dashboard', 'activeSubmenu'], null);

    case 'DASHBOARD_SUBMENU_TOGGLED':
      return state.updateIn(['dashboard', 'activeSubmenu'], (submenu) => {
        const newSubmenu = action.payload.submenu;
        if (submenu === newSubmenu) {
          return null;
        }

        return newSubmenu;
      });

    case 'COMPONENT_MINIMIZED':
      return state.update(
        'minimizedComponents',
        (components) => components.add(action.payload.componentName)
      );

    case 'COMPONENT_MAXIMIZED':
      return state.update(
        'minimizedComponents',
        (components) => components.delete(action.payload.componentName)
      );

    case 'USER_REQUESTED_FOCUSED_LINE':
      return state.setIn(
        ['editors', 'requestedFocusedLine'],
        new Immutable.Map().
          set('language', action.payload.language).
          set('line', action.payload.line).
          set('column', action.payload.column)
      );

    case 'EDITOR_FOCUSED_REQUESTED_LINE':
      return state.setIn(['editors', 'requestedFocusedLine'], null);

    case 'NOTIFICATION_TRIGGERED':
      return state.update(
        'notifications',
        (errors) => errors.add(new Immutable.Map(
          pick(action.payload, ['type', 'severity', 'payload'])
        ))
      );

    case 'USER_DISMISSED_NOTIFICATION':
      return state.update(
        'notifications',
        (errors) => errors.filterNot(
          (error) => error.get('type') === action.payload.type
        )
      );

    default:
      return state;
  }
}

export default ui;
