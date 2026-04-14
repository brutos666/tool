import ActionButton from '../ActionButton.js';
import CommandDecorator from './CommandDecorator.js';

/**
 * Cette classe permet de décorer un espace pour lequel on aura besoin d'un bouton relancer en cas d'échec de la commande
 */
class CommandSpaceDecorator extends CommandDecorator {

  #relaunchButton;
  #relaunchCallback = null;

  constructor(view, decoratedElement) {
    super(view, decoratedElement);
    this.#relaunchButton = new ActionButton({
      id: 'relaunchButton',
      label: 'Relancer'
    });
    this.#relaunchButton.setDoActionCallback(() => {
      this.#relaunchCallback();
    });
    this.#relaunchButton.setHidden();
    this.setStaticChild('relaunch', this.#relaunchButton);
  }
  setRelaunchCallback(callback) {
    this.#relaunchCallback = callback;
  }

  /** @override */
  commandInProgress(name, command) {
    this.#relaunchButton.setHidden();
    if (this.#relaunchCallback === null) {
      this.#relaunchCallback = () => {
        command.execute();
      };
    }
    super.commandInProgress(name);
  }
  /** @override */
  commandDone(name, response) {
    super.commandDone(name, response);
    this.#relaunchCallback = null;
    this.#relaunchButton.setHidden();
  }
  commandFailed(name, error) {
    super.commandFailed(name, error);
    this.#relaunchButton.setVisible();
  }

}

export default CommandSpaceDecorator;