class DOMUtilities {

  /**
   * Recherche si l'élément est caché
   * @param {HTMLElement} element : Element
   * @returns {boolean} true si l'élément est caché
   */
  static isHidden(element) {
    if (!element) {
      return false;
    }
    if (element.closest('.hidden')) {
      return true;
    }
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    // Vérification des parents
    return DOMUtilities.isHidden(element.parentElement);
  }

}

export default DOMUtilities;
