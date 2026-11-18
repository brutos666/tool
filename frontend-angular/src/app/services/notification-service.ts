import { Service, signal } from '@angular/core';
import { NotificationData } from '../data/notification-data.js';

@Service()
export class NotificationService {
  notificationsSignal = signal<NotificationData[]>([]);
  popupNotificationsSignal = signal<NotificationData[]>([]);
  helpNotificationsSignal = signal<NotificationData[]>([]);

  private notificationId: number = 0;
  helpMessageId: number = 0;

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
    this.removeHelp(id);
    this.notificationsSignal.set(this.notificationsSignal().filter((n) => n.getId() !== id));
  }

  clearNotifications() {
    this.notificationsSignal.set([]);
  }

  giveHelpId() {
    this.helpMessageId++;
    return `help${this.helpMessageId}`;
  }

  setHelp(id: string, title: string, message: string) {
    if (!message.length) {
      return;
    }
    const helpIndex = this.helpNotificationsSignal().findIndex((h) => h.getId() === id);
    if (helpIndex === -1) {
      this.addHelp(id, title, message);
    } else {
      this.replaceHelp(helpIndex, id, title, message);
    }
  }

  private addHelp(id: string, title: string, message: string) {
    this.helpNotificationsSignal.set([
      ...this.helpNotificationsSignal(),
      new NotificationData(id, `<h4>${title}</h4>${message}`, 'info', false),
    ]);
  }
  private replaceHelp(index: number, id: string, title: string, message: string) {
    const newHelps = [...this.helpNotificationsSignal()];
    newHelps.splice(
      index,
      1,
      new NotificationData(id, `<h4>${title}</h4>${message}`, 'info', false),
    );
    this.helpNotificationsSignal.set(newHelps);
  }
  removeHelp(id: string): void {
    const help = this.helpNotificationsSignal().findIndex((h) => h.getId() === id);
    if (help === -1) {
      return;
    }
    this.helpNotificationsSignal.set(
      this.helpNotificationsSignal().filter((n) => n.getId() !== id),
    );
  }
}
