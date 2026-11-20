import { Component, inject, signal } from '@angular/core';
import { Notification } from '../notification/notification';
import { NotificationService } from '../../services/notification-service.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation.js';
import { FocusableButton } from '../action-button/focusable-button.js';
import { Button } from '../action-button/button.js';
import { Toolbar } from '../toolbar/toolbar';
import { ShowPopupButton } from '../../directives/show-popup-button';

@Component({
  imports: [
    FocusableButton,
    Notification,
    EnterTabNavigation,
    Toolbar,
    ShowPopupButton,
    ArrowNavigation,
  ],
  selector: 'notification-center',
  styleUrl: './notification-center.scss',
  templateUrl: './notification-center.html',
  host: {
    'aria-label': 'Centre de notification',
  },
})
export class NotificationCenter {
  // TODO : badge (pas besoin du nombre ici)
  // TODO : dans le service, ne stocker que les erreurs quand tout sera en place
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notificationsSignal;
  popNotifications = this.notificationService.popupNotificationsSignal;
  helpNotifications = this.notificationService.helpNotificationsSignal;

  show = signal<boolean>(false);
  showHelp = signal<boolean>(true);

  notificationButton: Button = new Button(
    'notificationButton',
    'Afficher les notifications',
    'Affiche les notifications',
    'bell',
  );
  infoButton: Button = new Button(
    'infoButton',
    "Afficher l'aide'",
    "Affiche les messages d'aide à l'utilisation de l'interface",
    'info',
  );
}
