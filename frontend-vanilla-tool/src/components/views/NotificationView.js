import View from './View.js';

class NotificationView extends View {

  name = 'NotificationView';
  /**
   * @constructor
   * @param {Object} data - Données à utiliser pour créer la vue
   * @param {string} data.message - Le message à afficher.
   * @param {string} data.type - Type de notification ("success" ou "error" ou "warning").
   * @param {number} data.duration - Durée d'affichage en millisecondes (défaut : 3000).
   */
  constructor(data) {
    super(data);
    const notification = this.getElementView();
    if (data.duration) {
      setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => {
          this.remove();
        }, 300);
      }, data.duration);
    }
  }

  remove() {
    this.getElementView()
      .remove();
  }
  /**
   * @override
   * @param {string} message - Le message à afficher.
   * @param {string} type - Type de notification ("success" ou "error").
   * @param {number} duration - Durée d'affichage en millisecondes (défaut : 3000).
   */
  getHtmlView(data) {
    return String.raw`<div class="notification ${ data.type }">${ data.message }</div>`;
  }

}

export default NotificationView;