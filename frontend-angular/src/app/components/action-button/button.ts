export class Button {
  className!: string;
  label!: string;
  icon!: string;
  role!: string;
  onClick!: Function;

  /**
   * @constructor
   * @param {string} label - Label du bouton
   * @param {string|undefined} icon - Icône du bouton
   * @param {'button'|'menuitem'} role - Rôle du bouton
   * @param {'icon'|'menu'|'label'|'primary'|'burger'} data.type - Type de bouton
   * @param {Function} onClick - méthode à appeler sur le click d'un bouton
   */
  constructor(
    label: string,
    icon: string | undefined,
    role: 'button' | 'menuitem',
    type: 'icon' | 'menu' | 'label' | 'primary' | 'burger',
    onClick: Function = () => {},
  ) {
    this.className = `${type}-button`;
    this.label = label;
    if (icon) {
      this.icon = icon;
    }
    this.role = role;
    this.onClick = onClick;
  }
}
