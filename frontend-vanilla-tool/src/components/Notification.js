import Component from './Component.js';
import NotificationView from './views/NotificationView.js';

class Notification extends Component {

  name = 'Notification';
  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.message - Le message à afficher.
   * @param {string} data.type - Type de notification ("success" ou "error").
   * @param {number} data.duration - Durée d'affichage en millisecondes (défaut : 3000).
   */
  constructor(data) {
    super(new NotificationView(data));
  }

}

export default Notification;