import View from './View.js';
/** @import UserInfos from '../../data/User.js'; */

class LoginSpaceView extends View {

  name = 'LoginView';

  static INSCRIPTION = 'S\'inscrire';
  static CONNEXION = 'Se connecter';
  static PASSWORD_MIN_LENGTH = 8;

  #onSubmitEvent = this.callSubmitFormCallback.bind(this);
  #submitFormCallback = () => {};

  #title;

  constructor() {
    super();
    this.getElementView()
      .querySelector('.form')
      .addEventListener('submit', this.#onSubmitEvent);
    this.#title = this.getElementView()
      .querySelector('.login__title');
  }

  setSubmitFormCallback(callback) {
    this.#submitFormCallback = callback;
  }

  /**
   * Lance l'action
   * @param {Event} event
   */

  callSubmitFormCallback(event) {
    this.#submitFormCallback(event);
  }

  switchToSignup() {
    this.#title.innerHTML = LoginSpaceView.INSCRIPTION;
    this.getStaticView('firstName')
      .getElementView().classList.remove('hidden');
    this.getStaticView('lastName')
      .getElementView().classList.remove('hidden');
    this.getStaticView('confirmPassword')
      .getElementView().classList.remove('hidden');
    this.getStaticView('signUp')
      .getElementView().classList.remove('hidden');
    this.getStaticView('goToLogin')
      .getElementView().classList.remove('hidden');

    this.getStaticView('email')
      .setRequired(true);
    this.getStaticView('firstName')
      .setRequired(true);
    this.getStaticView('lastName')
      .setRequired(true);
    this.getStaticView('password')
      .setRequired(true);
    this.getStaticView('confirmPassword')
      .setRequired(true);
    this.getStaticView('password')
      .setInputAttribute('minlength', LoginSpaceView.PASSWORD_MIN_LENGTH);
    this.getStaticView('confirmPassword')
      .setInputAttribute('minlength', LoginSpaceView.PASSWORD_MIN_LENGTH);

    this.getStaticView('login')
      .getElementView().classList.add('hidden');
    this.getStaticView('goToSignUp')
      .getElementView().classList.add('hidden');
  }
  switchToLogin() {
    this.#title.innerHTML = LoginSpaceView.CONNEXION;

    this.getStaticView('firstName')
      .getElementView().classList.add('hidden');
    this.getStaticView('lastName')
      .getElementView().classList.add('hidden');
    this.getStaticView('confirmPassword')
      .getElementView().classList.add('hidden');
    this.getStaticView('signUp')
      .getElementView().classList.add('hidden');
    this.getStaticView('goToLogin')
      .getElementView().classList.add('hidden');

    this.getStaticView('email')
      .setRequired(true);
    this.getStaticView('password')
      .setRequired(true);
    this.getStaticView('firstName')
      .setRequired(false);
    this.getStaticView('lastName')
      .setRequired(false);
    this.getStaticView('confirmPassword')
      .setRequired(false);
    this.getStaticView('password')
      .removeInputAttribute('minlength');
    this.getStaticView('confirmPassword')
      .removeInputAttribute('minlength');

    this.getStaticView('login')
      .getElementView().classList.remove('hidden');
    this.getStaticView('goToSignUp')
      .getElementView().classList.remove('hidden');
  }

  /**
   * @override
   */
  getHtmlView() {
    return String.raw`<div class="login">
      <h2 class="login__header">
        <div class="login__title">Connexion</div>
      </h2>
      <form class="form" novalidate>
        <div class="login__submission">
          <template class="login__email" id="email"></template>
          <template class="login__first-name" id="firstName"></template>
          <template class="login__last-name" id="lastName"></template>
          <template class="login__password" id="password"></template>
          <template class="login__confirm-password" id="confirmPassword" ></template>
          <template class="login__login" id="login"></template>
          <template class="login__go-to-signup" id="goToSignUp"></template>
          <template class="login__signup" id="signUp"></template>
          <template class="login__go-to-login" id="goToLogin"></template>
        </div>
      </form>
    </div>`;
  }

  destroy() {
    this.getElementView()
      .querySelector('.form')
      .addEventListener('submit', this.#onSubmitEvent);

    super.destroy();
    this.#onSubmitEvent = null;
    this.#submitFormCallback = null;
  }

}
export default LoginSpaceView;