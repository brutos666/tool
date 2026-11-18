export class Help {
  static NO_TREE_SELECTED = "Sélectionner un élément dans l'espace de navigation à gauche";
  static NO_TREE = "Ajouter un élément dans l'espace de navigation";
  static NO_CHILD = 'Ajouter un élément';

  static TREE_LIST_NAVIGATION_VERTICAL = String.raw`<ul>
    <li><strong>Ctrl + flèches haut / bas</strong> : passer directement d'un arbre à l'autre</li>
  </ul>`;
  static TREE_LIST_NAVIGATION_HORIZONTAL = String.raw`<ul>
    <li><strong>Ctrl + flèches gauche / droite</strong> : passer directement d'un arbre à l'autre</li>
  </ul>`;
  static TREE_NAVIGATION = String.raw`<ul>
    <li><strong>Flèches haut / bas</strong> : se déplacer d'un nœud à l'autre</li>
    <li><strong>Flèche droite</strong> : ouvrir un nœud replié (ou passer au 1er enfant si déjà ouvert)</li>
    <li><strong>Flèche gauche</strong> : replier un nœud ouvert (ou revenir au parent si déjà replié)</li>
  </ul>`;
  static ENTER_NAVIGATION = String.raw`<ul>
    <li><strong>Entrée</strong> : entrer dans la zone</li>
    <li><strong>Échap</strong> : sortir de la zone</li>
  </ul>`;
  static EXIT_NAVIGATION = String.raw`<ul>
    <li><strong>Tab / shift + Tab</strong> : se déplacer dans la zone</li>
    <li><strong>Échap</strong> : sortir de la zone</li>
  </ul>`;
  static SELECT_NAVIGATION = String.raw`<strong>Espace</strong> : sélectionner l'élément`;

  static ARROW_NAVIGATION_HORIZONTAL = String.raw`<ul>
    <li><strong>Flèches gauche / droite</strong> : se déplacer</li>
    <li><strong>Home (↖, Fn + flèche gauche)</strong> : aller sur le premier</li>
    <li><strong>End (Fin, Fn + flèche droite)</strong> : aller sur sur le dernier</li>
  </ul>`;
  static ARROW_NAVIGATION_VERTICAL = String.raw`<ul>
    <li><strong>↑ ↓</strong> : se déplacer</li>
    <li><strong>Home (↖, Fn + flèche gauche)</strong> : aller sur le premier</li>
    <li><strong>End (Fin, Fn + flèche droite)</strong> : aller sur sur le dernier</li>
  </ul>`;
}
