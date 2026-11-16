export class SvgUtilities {
  // eslint-disable-next-line complexity
  static getIcon(name: string): string {
    let svgHtml;
    switch (name) {
      case 'cross':
        svgHtml = getCrossIcon();
        break;
      case 'plus':
        svgHtml = getPlusIcon();
        break;
      case 'burger':
        svgHtml = getBurgerIcon();
        break;
      case 'move':
        svgHtml = getMoveIcon();
        break;
      case 'reorder':
        svgHtml = getReorderIcon();
        break;
      case 'node':
        svgHtml = getNodeIcon();
        break;
      case 'pencil':
        svgHtml = getPencilIcon();
        break;
      case 'bell':
        svgHtml = getBellIcon();
        break;
      case 'trash':
        svgHtml = getTrashIcon();
        break;
      case 'rotate-right':
        svgHtml = getRotateRightIcon();
        break;
      case 'upload':
        svgHtml = getUploadIcon();
        break;
      case 'save':
        svgHtml = getSaveIcon();
        break;
      case 'info':
        svgHtml = getInfoIcon();
        break;
      default:
        break;
    }
    return svgHtml ? svgHtml : name;
  }
}
/** croix */
function getCrossIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="supprimer">
    <line x1="17" y1="7" x2="7" y2="17"></line>
    <line x1="7" y1="7" x2="17" y2="17"></line>
  </svg>`;
}
/** plus */
function getPlusIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="ajouter">
    <line x1="12" y1="6" x2="12" y2="18"></line>
    <line x1="6" y1="12" x2="18" y2="12"></line>
  </svg>`;
}
/** burger */
function getBurgerIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="ajouter">
    <line x1="6" y1="6" x2="18" y2="6"></line>
    <line x1="6" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="18" x2="18" y2="18"></line>
  </svg>`;
}
/** 2 * 3 points verticaux représentant un icon de drag and drop d'une liste */
function getReorderIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="réarranger">
    <circle cx="8" cy="12" r="1"></circle>
    <circle cx="8" cy="6" r="1"></circle>
    <circle cx="8" cy="18" r="1"></circle>
    <circle cx="16" cy="12" r="1"></circle>
    <circle cx="16" cy="6" r="1"></circle>
    <circle cx="16" cy="18" r="1"></circle>
  </svg>`;
}
/** croix de déplacement */
function getMoveIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="déplacer">
    <path d="M5.2 9l-3 3 3 3M9 5.2l3-3 3 3M15 18.9l-3 3-3-3M18.9 9l3 3-3 3M3.3 12h17.4M12 3.2v17.6"/>
  </svg>`;
}
/** indicateur de noeud */
function getNodeIcon() {
  // patch d="M9 18l6-6-6-6" => Démarre à x=9, y=18 (en bas à gauche), se déplace x+6 (vers la droite), y-6 (vers le haut), puis x-6 (vers la gauche), y-6 vers le haut.
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="ouvrir/fermer le noeud">
    <path d="M9 17l7-5-7-5"/>
  </svg>`;

  // Pour un triangle complet, on peut faire ça  : <polygon points="6 7 18 12 6 17 6 7"></polygon>

  // ou ça : <path d="M9 17l7-5-7-5+0+10"/>
}

/** crayon de passage en mode édition */
function getPencilIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="passer en mode édition"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>`;
}

function getBellIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="centre de notification"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>`;
}

function getTrashIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="supprimer"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
}

function getRotateRightIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
  </svg>`;
}

function getSaveIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>`;
}

function getUploadIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/>
  </svg>`;
}

function getInfoIcon() {
  return String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>`;
}
export default SvgUtilities;
