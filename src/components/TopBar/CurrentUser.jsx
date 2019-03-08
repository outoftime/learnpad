import classnames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import {t} from 'i18next';

import {UserAccount} from '../../records';

import CurrentUserMenu from './CurrentUserMenu';

export default function CurrentUser({
  isLoginAvailable,
  isUserAnonymous,
  isUserAuthenticated,
  user,
  onLinkGitHub,
  onLogOut,
  onStartLogIn,
  onUnlinkGitHub,
}) {
  if (isUserAuthenticated) {
    return (
      <CurrentUserMenu
        user={user}
        onLinkGitHub={onLinkGitHub}
        onLogOut={onLogOut}
        onUnlinkGitHub={onUnlinkGitHub}
      />
    );
  }

  if (isUserAnonymous && isLoginAvailable) {
    return (
      <div
        className={classnames(
          'top-bar__current-user',
          'top-bar__menu-button',
          'top-bar__menu-button_primary',
        )}
        onClick={onStartLogIn}
      >
        {t('top-bar.session.log-in-prompt')}
      </div>
    );
  }

  return null;
}

CurrentUser.propTypes = {
  isLoginAvailable: PropTypes.bool.isRequired,
  isUserAnonymous: PropTypes.bool.isRequired,
  isUserAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.instanceOf(UserAccount),
  onLinkGitHub: PropTypes.func.isRequired,
  onLogOut: PropTypes.func.isRequired,
  onStartLogIn: PropTypes.func.isRequired,
  onUnlinkGitHub: PropTypes.func.isRequired,
};

CurrentUser.defaultProps = {
  user: null,
};
