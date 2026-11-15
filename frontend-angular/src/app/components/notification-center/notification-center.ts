import { Component, effect, inject, input, signal } from '@angular/core';
import { Notification } from '../notification/notification';
import { NotificationService } from '../../services/notification-service.js';
import { PopupButton } from '../../directives/popup-button.js';
import { ArrowNavigation } from '../../directives/arrow-navigation.js';
import { EnterTabNavigation } from '../../directives/enter-tab-navigation.js';
import { PopOverContainer } from '../../directives/popover-container';
import { FocusableButton } from '../action-button/focusable-button.js';
import { Button } from '../action-button/button.js';

@Component({
  imports: [FocusableButton, Notification, PopupButton, EnterTabNavigation, PopOverContainer],
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
  show = signal<boolean>(false);

  notificationButton: Button = new Button(
    'notificationButton',
    'Centre de notification',
    'bell',
    'button',
    'status',
  );

  constructor() {
    effect(() => {
      if (this.show()) {
        this.navigation?.giveFocus();
      }
    });
  }
}
