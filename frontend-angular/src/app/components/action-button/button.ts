export class Button {
  id!: string;
  type!: 'icon' | 'menu' | 'label' | 'primary' | 'burger';
  label!: string;
  icon!: string;
  role!: string;
  onClick!: Function;

  private visible: boolean = true;

  /**
   * @constructor
   * @param {string} id - Label du bouton
   * @param {string} label - Label du bouton
   * @param {string|undefined} icon - Icône du bouton
   * @param {'button'|'menuitem'} role - Rôle du bouton
   * @param {'icon'|'menu'|'label'|'primary'|'burger'} data.type - Type de bouton
   * @param {Function} onClick - méthode à appeler sur le click d'un bouton
   */
  constructor(
    id: string,
    label: string,
    icon: string | undefined,
    role: 'button' | 'menuitem',
    type: 'icon' | 'menu' | 'label' | 'primary' | 'burger',
    onClick: Function = () => {},
  ) {
    this.id = id;
    this.type = type;
    this.label = label;
    if (icon) {
      this.icon = icon;
    }
    this.role = role;
    this.onClick = onClick;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  isVisible() {
    return this.visible;
  }
}
