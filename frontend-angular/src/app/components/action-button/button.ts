export class Button {
  id!: string;
  label!: string;
  description!: string;
  icon!: string;
  onClick!: Function;
  upload: boolean;

  private visible: boolean = true;

  /**
   * @constructor
   * @param {string} id - Label du bouton
   * @param {string} label - Label du bouton
   * @param {string} description - Label du bouton
   * @param {string|undefined} icon - Icône du bouton
   * @param {Function} onClick - méthode à appeler sur le click d'un bouton
   * @param {boolean} upload - Icône du bouton
   */
  constructor(
    id: string,
    label: string,
    description: string,
    icon: string | undefined,
    onClick: Function = () => {},
    upload: boolean = false,
  ) {
    this.id = id;
    this.label = label;
    this.description = description;
    if (icon) {
      this.icon = icon;
    }
    this.onClick = onClick;
    this.upload = upload;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  isVisible() {
    return this.visible;
  }
}
