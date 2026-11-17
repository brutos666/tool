import { Service, signal } from '@angular/core';
import { NotificationData } from '../data/notification-data.js';

@Service()
export class NotificationService {
  static NO_TREE_SELECTED = "Sélectionner un élément dans l'espace de navigation à gauche";
  static NO_TREE = "Ajouter un élément dans l'espace de navigation";
  static NO_CHILD = 'Ajouter un élément';

  static TREE_LIST_NAVIGATION_VERTICAL = String.raw`<div>
    <h4>Navigation arbre</h4>
    <ul>
      <li><strong>Ctrl + ↑ ↓</strong> : passer directement d'un arbre à l'autre</li>
      <li><strong>↑ ↓</strong> : se déplacer d'un nœud à l'autre</li>
      <li><strong>→</strong> : ouvrir un nœud replié (ou passer au premier enfant s'il est déjà ouvert)</li>
      <li><strong>←</strong> : replier un nœud ouvert (ou revenir au parent s'il est déjà replié)</li>
    </ul>
  </div>`;
  static TREE_LIST_NAVIGATION_HORIZONTAL = String.raw`<div>
    <h4>Navigation clavier arbre</h4>
    <ul>
      <li><strong>Ctrl + ← →</strong> : passer directement d'un arbre à l'autre</li>
      <li><strong>↑ ↓</strong> : se déplacer d'un nœud à l'autre</li>
      <li><strong>→</strong> : ouvrir un nœud replié (ou passer au premier enfant s'il est déjà ouvert)</li>
      <li><strong>←</strong> : replier un nœud ouvert (ou revenir au parent s'il est déjà replié)</li>
    </ul>
  </div>`;
  static ENTER_NAVIGATION = String.raw`<div>
    <h4>Navigation clavier tâche</h4>
    <ul>
      <li><strong>Espace (navigation)</strong> : afficher la sélection</li>
      <li><strong>Entrée</strong> : entrer dans la tâche</li>
      <li><strong>Échap</strong> : sortir de la tâche</li>
    </ul>
  </div>`;
  static EXIT_NAVIGATION = String.raw`<strong>Échap</strong> : sortir de la tâche`;

  static TAB_NAVIGATION = String.raw`<strong>Tab / Shift+Tab</strong> : se déplacer dans les différents éléments`;
  static ARROW_NAVIGATION_HORIZONTAL = String.raw`<div>
    <h4>Navigation clavier</h4>
    <ul>
      <li><strong>Flèches ← →</strong> : se déplacer</li>
      <li><strong>Home (↖, Fn + ←)</strong> : aller sur le premier</li>
      <li><strong>End (Fin, Fn + →)</strong> : aller sur sur le dernier</li>
    </ul>
    </div>`;
  static ARROW_NAVIGATION_VERTICAL = String.raw`<div>
    <h4>Navigation clavier</h4>
    <ul>
      <li><strong>↑ ↓</strong> : se déplacer</li>
      <li><strong>Home (↖, Fn + ←)</strong> : aller sur le premier</li>
      <li><strong>End (Fin, Fn + →)</strong> : aller sur sur le dernier</li>
    </ul>
    </div>`;

  notificationsSignal = signal<NotificationData[]>([]);
  popupNotificationsSignal = signal<NotificationData[]>([]);
  helpsSignal = signal<NotificationData[]>([]);

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
    this.notificationsSignal.set(this.notificationsSignal().filter((n) => n.getId() !== id));
  }

  clearNotifications() {
    this.notificationsSignal.set([]);
  }

  giveHelpId() {
    this.helpMessageId++;
    return `help${this.helpMessageId}`;
  }

  addHelp(id: string, message: string) {
    if (!message.length) {
      return;
    }
    if (!this.helpsSignal().find((h) => h.getId() === id)) {
      this.helpsSignal.set([
        ...this.helpsSignal(),
        new NotificationData(id, id + ' ' + message, 'info', false),
      ]);
    }
  }

  removeHelp(id: string) {
    const helpIndex = this.helpsSignal().findIndex((h) => h.getId() === id);
    if (helpIndex > -1) {
      this.helpsSignal.set(this.helpsSignal().filter((n) => n.getId() !== id));
    }
  }
}
