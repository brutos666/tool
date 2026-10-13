import { AfterViewInit, Component, computed, inject, input, signal } from '@angular/core';
import { NotificationData } from '../../data/notification-data.js';
import { NodeElement } from '../common/NodeElement.js';
import { BasicButton } from '../basic-button/basic-button';
import { IconButton } from '../action-button/icon-button.js';
import { NotificationService } from '../../services/notification-service.js';

@Component({
  imports: [BasicButton],
  selector: 'notification',
  styleUrl: './notification.scss',
  templateUrl: './notification.html',
  host: {
    '[class]': 'data().getType()',
    '[class.show]': 'show()',
    '[class.hide]': 'hide()',
  },
})
export class Notification extends NodeElement implements AfterViewInit {
  private notificationService = inject(NotificationService);

  data = input.required<NotificationData>();

  show = computed(() => this.data().isShortLived());
  hide = signal<boolean>(false);

  trashButton: IconButton = new IconButton(
    'notificationTrashButton',
    'Supprimer la notification',
    'trash',
    this.remove.bind(this),
  );

  ngAfterViewInit(): void {
    if (this.data().isShortLived()) {
      setTimeout(() => {
        this.hide.set(true);
      }, 3_000);
    }
  }

  remove(): void {
    this.notificationService.deleteNotification(this.data().getId());
  }
}
