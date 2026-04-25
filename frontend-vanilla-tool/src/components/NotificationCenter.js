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
   * @param {string} type - Type de notification ("success" ou "error").
   * @param {number} duration - Durée d'affichage en millisecondes (défaut : 3000).
   */
  showNotification(message, type = 'success') {
    this.addChild(new Notification({ message, type, duration: 3000 }));
  }

}

export default NotificationCenter;