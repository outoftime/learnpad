import React from 'react';
import partial from 'lodash/partial';
import NotificationContainer from './NotificationContainer';
import {
  GenericNotification,
  GistExportNotification,
  GistImportError,
} from './notifications';

const NOTIFICATION_COMPONENTS = {
  'gist-export-complete': GistExportNotification,
  'gist-import-error': GistImportError,
};

function chooseNotificationComponent(notification) {
  if (notification.type in NOTIFICATION_COMPONENTS) {
    return NOTIFICATION_COMPONENTS[notification.type];
  }

  return GenericNotification;
}

export default function NotificationList(props) {
  if (!props.notifications.length) {
    return null;
  }

  const notificationList = props.notifications.map((notification) => {
    const Notification = chooseNotificationComponent(notification);

    return (
      <NotificationContainer
        key={notification.type}
        severity={notification.severity}
        onErrorDismissed={partial(props.onErrorDismissed, notification)}
      >
        <Notification
          payload={notification.payload}
          type={notification.type}
        />
      </NotificationContainer>
    );
  });

  return (
    <div className="notificationList">{notificationList}</div>
  );
}

NotificationList.propTypes = {
  notifications: React.PropTypes.array,
  onErrorDismissed: React.PropTypes.func,
};
