import { Service, signal } from '@angular/core';
import { NotificationData } from '../data/notification-data.js';

@Service()
export class NotificationService {
  notificationsSignal = signal<NotificationData[]>([]);
  popupNotificationsSignal = signal<NotificationData[]>([]);
  private notificationId: number = 0;

  addNotification(message: string, type: 'error' | 'success' | 'warning' | 'info') {
    this.notificationId++;
    const popupNotification = new NotificationData(`${this.notificationId}`, message, type, true);
    this.popupNotificationsSignal.set([...this.popupNotificationsSignal(), popupNotification]);
    this.notificationsSignal.set([
      ...this.notificationsSignal(),
      new NotificationData(`${this.notificationId}`, message, type, false),
    ]);
    // Suppression de la notification au bout de 4 secondes
    setTimeout(() => {
      this.popupNotificationsSignal.set(
        this.popupNotificationsSignal().filter((n) => n != popupNotification),
      );
    }, 4000);
  }

  deleteNotification(id: string) {
    this.notificationsSignal.set(this.notificationsSignal().filter((n) => n.getId() !== id));
  }

  clearNotifications() {
    this.notificationsSignal.set([]);
  }
}
