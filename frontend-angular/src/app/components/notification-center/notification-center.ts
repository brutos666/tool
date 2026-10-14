import { Component, effect, inject, signal } from '@angular/core';
import { Notification } from '../notification/notification';
import { IconButton } from '../action-button/icon-button.js';
import { NotificationService } from '../../services/notification-service.js';
import { ActionButton } from '../action-button/action-button';
import { PopupButton } from '../../directives/popup-button.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation.js';
import { PopOverContainer } from '../../directives/popover-container';

@Component({
  imports: [ActionButton, Notification, PopupButton, EnterTabNavigation, PopOverContainer],
  selector: 'notification-center',
  styleUrl: './notification-center.scss',
  templateUrl: './notification-center.html',
  hostDirectives: [{ directive: ArrowNavigation, inputs: ['navOrientation'] }],
})
export class NotificationCenter {
  // TODO : badge (pas besoin du nombre ici)
  // TODO : bouton avec états enfoncés/ouvert (voir réponse Claude)
  // TODO : dans le service, ne stocker que les erreurs quand tout sera en place
  private notificationService = inject(NotificationService);
  private navigation = inject(ArrowNavigation);

  notifications = this.notificationService.notificationsSignal;
  popNotifications = this.notificationService.popupNotificationsSignal;
  show = signal<boolean>(false);

  notificationButton: IconButton = new IconButton(
    'notificationButton',
    'Centre de notification',
    'bell',
  );

  constructor() {
    effect(() => {
      if (this.show()) {
        this.navigation?.giveFocus();
      }
    });
  }
}
