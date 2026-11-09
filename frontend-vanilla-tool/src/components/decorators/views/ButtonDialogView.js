import ActionButtonView from '../../views/ActionButtonView.js';
import DecoratorView from './DecoratorView.js';

class ButtonDialogView extends DecoratorView {

  name = 'DialogView';

  /** @type {HTMLDialogElement} */
  #dialogElement;

  constructor(view, data) {
    super(view, data);
    this.#dialogElement = this.getElementView()
      .querySelector('.dialog');
    const buttonView = new ActionButtonView(data);
    /** @type {HTMLButtonElement} */
    const openButtonElement = buttonView.getElementView();
    openButtonElement.commandForElement = this.#dialogElement;
    openButtonElement.command = 'show-modal';
    this.setStaticView('button', buttonView);

    const closeButtonView = new ActionButtonView({ id: 'close-button', label: 'Fermer', type: 'label', role: 'button' });
    /** @type {HTMLButtonElement} */
    const closeElement = closeButtonView.getElementView();
    closeElement.commandForElement = this.#dialogElement;
    closeElement.command = 'close';
    this.setStaticView('close-button', closeButtonView);
  }

  getHtmlView(/* data */) {
    return String.raw`<div><template id="button"></template>
    <dialog id="dialog" class="dialog">${ super.getTemplateDecoratorHTML() }
    <template id="close-button"></template>
    </dialog></div>`;
  }

  giveFocus() {
    this.getStaticView('button')
      .giveFocus();
  }
  isFocused() {
    return this.getStaticView('button')
      .isFocused();
  }
  setTabIndex(value) {
    this.getStaticView('button')
      .setTabIndex(value);
  }
  closeDialog() {
    this.#dialogElement.close();
  }

}

export default ButtonDialogView;