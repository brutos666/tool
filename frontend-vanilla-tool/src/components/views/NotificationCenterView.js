import CompositeView from './CompositeView.js';

class NotificationCenterView extends CompositeView {

  name = 'NotificationsView';

  getHtmlView() {
    return String.raw`<div id="spaceChildren" class="notification-center"></div>`;
  }

}

export default NotificationCenterView;