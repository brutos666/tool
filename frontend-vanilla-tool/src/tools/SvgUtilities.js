class SvgUtilities {

  static getIcon(name) {
    let svgHtml;
    switch (name) {
      case 'cross':
        svgHtml = getCrossIcon();
        break;
      case 'move':
        svgHtml = getMoveIcon();
        break;
      case 'reorder':
        svgHtml = getReorderIcon();
        break;
      default:
        break;
    }
    return svgHtml ? svgHtml : name;
  }

}
/** croix */
function getCrossIcon() {
  return String.raw`<svg viewBox="0 0 10 10" width="0.75em" height="0.75em" stroke="currentColor" stroke-width="2">
  		<line x1="1" y1="1" x2="9" y2="9" />
  		<line x1="9" y1="1" x2="1" y2="9" />
		</svg>`;
}
/** 2 * 3 points verticaux représentant un icon de drag and drop d'une liste */
function getReorderIcon() {
  return String.raw`<svg aria-label="Drag" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <circle cx="8"  cy="6"  r="1.8"/>
          <circle cx="8"  cy="12" r="1.8"/>
          <circle cx="8"  cy="18" r="1.8"/>
          <circle cx="16" cy="6"  r="1.8"/>
          <circle cx="16" cy="12" r="1.8"/>
          <circle cx="16" cy="18" r="1.8"/>
        </svg>`;
}
/** croix de déplacement */
function getMoveIcon() {
  return String.raw`<svg aria-label="Drag" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>`;
}
export default SvgUtilities;