import Immutable from 'immutable';
import get from 'lodash/get';
import AuthenticationStates from '../enums/AuthenticationStates';

const init = new Immutable.Map({
  authenticationState: AuthenticationStates.UNKNOWN,
});

function user(stateIn, action) {
  const state = stateIn || init;

  switch (action.type) {
    case 'CONFIRM_IDENTITY': {
      return state.merge({
        authenticationState: AuthenticationStates.AUTHENTICATED,
      });
    }

    case 'REJECT_IDENTITY': {
      return new Immutable.Map({
        authenticationState: AuthenticationStates.UNAUTHENTICATED,
      });
    }

    case 'USER_AUTHENTICATED': {
      const {user: userData, credential, additionalUserInfo} = action.payload;

      const profileData = get(userData, ['providerData', 0], userData);

      return state.merge({
        authenticationState: AuthenticationStates.PENDING_CONFIRMATION,
        id: userData.uid,
        displayName: profileData.displayName || get(
          additionalUserInfo,
          'username',
        ),
        avatarUrl: profileData.photoURL,
        accessTokens: new Immutable.Map().set(
          credential.providerId,
          credential.accessToken,
        ),
      });
    }

    case 'USER_LOGGED_OUT':
      return init;

    default:
      return state;
  }
}

export default user;
