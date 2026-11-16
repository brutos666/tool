import { Service, signal } from '@angular/core';
import { NotificationData } from '../data/notification-data.js';

@Service()
export class NotificationService {
  INFO_WHEN_NO_TREE_SELECTED = "Sélectionner un élément dans l'espace de navigation à gauche";
  INFO_WHEN_NO_TREE = "Ajouter un élément dans l'espace de navigation";
  INFO_WHEN_NO_CHILD = 'Ajouter un élément';
  INFO_NAVIGATION = String.raw`<div class="aide-navigation">
    <h3>Navigation au clavier</h3>

    <h4>Arbres</h4>
    <ul>
      <li><strong>Flèche haut / bas</strong> : se déplacer d'un nœud à l'autre</li>
      <li><strong>Flèche droite</strong> : ouvrir un nœud replié (ou passer au premier enfant s'il est déjà ouvert)</li>
      <li><strong>Flèche gauche</strong> : replier un nœud ouvert (ou revenir au parent s'il est déjà replié)</li>
      <li><strong>Ctrl + Flèches</strong> : passer directement d'un arbre à l'autre</li>
    </ul>

    <h4>Menus et barres d'outils</h4>
    <ul>
      <li><strong>Flèches</strong> : se déplacer dans le menu ou la barre d'outils</li>
    </ul>

    <h4>Tâches</h4>
    <ul>
      <li><strong>Entrée</strong> : ouvrir une tâche ou un dossier</li>
      <li><strong>Échap</strong> : revenir en arrière</li>
      <li><strong>Espace</strong> : sélectionner une tâche</li>
      <li><strong>Tab</strong> : passer d'un champ à l'autre et à la barre d'outils</li>
    </ul>
  </div>`;

  notificationsSignal = signal<NotificationData[]>([]);
  popupNotificationsSignal = signal<NotificationData[]>([]);
  helpSignal = signal<string>('Rien à signaler');

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

  addHelp(message: string) {
    this.helpSignal.set(message);
  }

  removeHelp() {
    this.helpSignal.set('');
  }

  addNoSelectTreeHelp() {
    this.helpSignal.set(this.INFO_WHEN_NO_TREE_SELECTED);
  }

  addNoTreeHelp() {
    this.helpSignal.set(this.INFO_WHEN_NO_TREE);
  }

  addNavigationHelp() {
    this.helpSignal.set(this.INFO_NAVIGATION);
  }
}
