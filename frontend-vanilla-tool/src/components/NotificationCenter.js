import Composite from './Composite.js';
import Notification from './Notification.js';
import NotificationCenterView from './views/NotificationCenterView.js';

class NotificationCenter extends Composite {

  name = 'Notifications';
  constructor() {
    super(new NotificationCenterView());
  }

  /**
   * Affiche une notification en bas à droite de l'écran.
   * @param {string} message - Le message à afficher.
   * @param {string} type - Type de notification ("success" ou "error" ou "warning").
   * @returns {Notification} La notification crée.
   */
  showNotification(message, type) {
    if (type === 'error') {
      return this.addChild(new Notification({ message, type, duration: 10_000 }));
    }
    return this.addChild(new Notification({ message, type, duration: 3000 }));
  }

  displayInformation(message) {
    return this.addChild(new Notification({ message, type: 'info' }));
  }

  removeInformation(notification) {
    this.removeChild(notification);
  }

}

export default NotificationCenter;