import { Component, inject, signal } from '@angular/core';
import { Notification } from '../notification/notification';
import { IconButton } from '../action-button/icon-button.js';
import { NotificationService } from '../../services/notification-service.js';
import { ActionButton } from '../action-button/action-button';

@Component({
  imports: [ActionButton, Notification, ActionButton],
  selector: 'notification-center',
  styleUrl: './notification-center.scss',
  templateUrl: './notification-center.html',
})
export class NotificationCenter {
  // TODO : accessibilité => navigation, ouverture, fermeture avec echap, aria-expanded, aria-haspopup
  // TODO : badge (pas besoin du nombre ici)
  // TODO : bouton avec états enfoncés/ouvert (voir réponse Claude)
  // TODO : dans le service, ne stocker que les erreurs quand tout sera en place
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notificationsSignal;
  popNotifications = this.notificationService.popupNotificationsSignal;
  showAll = signal<boolean>(false);

  notificationButton: IconButton = new IconButton(
    'notificationButton',
    'Centre de notification',
    'bell',
    this.showHide.bind(this),
  );

  showHide() {
    this.showAll.set(!this.showAll());
  }
}
