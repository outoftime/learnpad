import React from 'react';
import PropTypes from 'prop-types';
import AuthenticationStates from '../enums/AuthenticationStates';

// TODO: Move to saga
function navigateToGithubLogOut() {
  const GITHUB_LOGOUT_URL = 'https://github.com/logout';
  window.open(GITHUB_LOGOUT_URL, '_blank');
}

function IdentityConfirmation(props) {
  const {
    currentUser,
    onConfirmIdentity,
    onRejectIdentity,
  } = props;

  if (currentUser.authenticationState !== AuthenticationStates.AUTHENTICATED) {
    return null;
  }

  return (
    <div className="identity-confirmation">
      <div className="identity-confirmation__modal">
        {`Are you ${currentUser.displayName}?`}

        <button type="button" onClick={onRejectIdentity}>
          No
        </button>

        <button type="button" onClick={onConfirmIdentity}>
          Yes
        </button>
      </div>
    </div>
  );
}

IdentityConfirmation.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onConfirmIdentity: PropTypes.func.isRequired,
  onRejectIdentity: PropTypes.func.isRequired,
};

export default IdentityConfirmation;
