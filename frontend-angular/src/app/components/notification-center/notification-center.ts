import { Component, effect, inject, input, signal } from '@angular/core';
import { Notification } from '../notification/notification';
import { NotificationService } from '../../services/notification-service.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation.js';
import { FocusableButton } from '../action-button/focusable-button.js';
import { Button } from '../action-button/button.js';
import { Toolbar } from '../toolbar/toolbar';
import { ShowPopupButton } from '../../directives/show-popup-button';

@Component({
  imports: [FocusableButton, Notification, EnterTabNavigation, Toolbar, ShowPopupButton],
  selector: 'notification-center',
  styleUrl: './notification-center.scss',
  templateUrl: './notification-center.html',
  hostDirectives: [{ directive: ArrowNavigation, inputs: ['navOrientation'] }],
})
export class NotificationCenter {
  // TODO : badge (pas besoin du nombre ici)
  // TODO : dans le service, ne stocker que les erreurs quand tout sera en place
  private notificationService = inject(NotificationService);
  private navigation = inject(ArrowNavigation);
  navOrientation = input<'horizontal' | 'vertical'>('horizontal');

  notifications = this.notificationService.notificationsSignal;
  popNotifications = this.notificationService.popupNotificationsSignal;
  helpNotifications = this.notificationService.helpsSignal;

  show = signal<boolean>(false);
  showHelp = signal<boolean>(true);

  notificationButton: Button = new Button('notificationButton', 'Centre de notification', 'bell');
  infoButton: Button = new Button('infoButton', "Zone d'information", 'info');

  constructor() {
    effect(() => {
      if (this.show()) {
        this.navigation?.giveFocus();
      }
    });
  }
}
