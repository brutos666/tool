import ActionButtonView from '../../views/ActionButtonView.js';
import DecoratorView from './DecoratorView.js';

class ButtonDialogView extends DecoratorView {

  name = 'DialogView';
  constructor(view, data) {
    super(view, data);
    const buttonView = new ActionButtonView(data);
    buttonView.getElementView()
      .setAttribute('popovertarget', 'dialog');
    this.setStaticView('button', buttonView);

    const closeButtonView = new ActionButtonView({ id: 'close-button', label: 'Fermer', type: 'label', role: 'button' });
    closeButtonView.getElementView()
      .setAttribute('popovertargetaction', 'hide');
    closeButtonView.getElementView()
      .setAttribute('popovertarget', 'dialog');
    this.setStaticView('close-button', closeButtonView);
  }

  getHtmlView(/* data */) {
    return String.raw`<div><template id="button"></template>
    <dialog id="dialog" class="dialog" popover>${ super.getTemplateDecoratorHTML() }
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

}

export default ButtonDialogView;