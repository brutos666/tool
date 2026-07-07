import ActionButton from './ActionButton.js';
import Component from './Component.js';
import CommandUserDecorator from './decorators/CommandUserDecorator.js';
import Input from './Input.js';
import SubmitButton from './SubmitButton.js';
import InputView from './views/InputView.js';
import LoginSpaceView from './views/LoginSpaceView.js';
/**
 * @typedef {Object} RegisterUserInfos - Informations sur l'utilisateur qui veut s'enregistrer
 * @property {string} email - Email
 * @property {string} firstName - Prénom
 * @property {string} lastName - Nom
 * @property {string} password - Mot de passe
 */
/**
 * @typedef {Object} LoginInfos - Informations sur l'utilisateur qui veut se connecter
 * @property {string} email - Email
 * @property {string} password - Mot de passe
 */
class LoginSpace extends Component {

  #emailInput;
  #firstNameInput;
  #lastNameInput;
  #passwordInput;
  #confirmPasswordInput;
  #loginDecorator;
  #signUpDecorator;

  #isLogin = false;

  constructor() {
    super(new LoginSpaceView());
    this.#emailInput = new Input({ id: 'email', label: 'Adresse Email', type: 'email', placeHolder: 'nom@domaine.com' });
    this.#firstNameInput = new Input({ id: 'firstName', label: 'Prénom', type: 'text', placeHolder: 'ex: John' });
    this.#lastNameInput = new Input({ id: 'lastName', label: 'Nom', type: 'text', placeHolder: 'ex: Doe' });
    this.#passwordInput = new Input({ id: 'password', label: 'Mot de passe', type: 'password', placeHolder: '' });
    this.#confirmPasswordInput = new Input({ id: 'confirmPassword', label: 'Confirmer le mot de passe', type: 'password', placeHolder: '' });

    const login = new SubmitButton({ id: 'submitConnexion', label: 'Se connecter' });
    login.setDoActionCallback(this.doLogin.bind(this));
    const signUp = new ActionButton({ id: 'signUp', label: 'Se connecter', role: 'button', type: 'label' });
    signUp.setDoActionCallback(this.doSignup.bind(this));
    const gotoSignUp = new ActionButton({ id: 'goToSignUp', label: 'S\'inscrire', role: 'button', type: 'label' });
    gotoSignUp.setDoActionCallback(this.switchToSignup.bind(this));
    const gotoLogin = new ActionButton({ id: 'goToLogin', label: 'Se connecter à un compte existant', role: 'button', type: 'label' });
    gotoLogin.setDoActionCallback(this.switchToLogin.bind(this));

    this.#loginDecorator = new CommandUserDecorator(login);
    this.#signUpDecorator = new CommandUserDecorator(signUp);

    this.setStaticChild('email', this.#emailInput);
    this.setStaticChild('firstName', this.#firstNameInput);
    this.setStaticChild('lastName', this.#lastNameInput);
    this.setStaticChild('password', this.#passwordInput);
    this.setStaticChild('confirmPassword', this.#confirmPasswordInput);
    this.setStaticChild('login', this.#loginDecorator);
    this.setStaticChild('signUp', this.#signUpDecorator);
    this.setStaticChild('goToSignUp', gotoSignUp);
    this.setStaticChild('goToLogin', gotoLogin);

    this.getView()
      .setSubmitFormCallback(this.doLogin.bind(this));
    this.getView()
      .switchToLogin();
  }

  switchToSignup(event) {
    event.preventDefault();
    this.getView()
      .switchToSignup();
    this.#isLogin = false;
  }

  switchToLogin(event) {
    event.preventDefault();
    this.getView()
      .switchToLogin();
    this.#isLogin = true;
  }

  /**
   * Retourne les informations saisies pour inscrire l'utilisateur
   * @returns {RegisterUserInfos}
   */
  getRegisterUserInfos() {
    return {
      email: this.#emailInput.getValue(),
      firstName: this.#firstNameInput.getValue(),
      lastName: this.#lastNameInput.getValue(),
      password: this.#passwordInput.getValue()
    };
  }

  /**
   * Retourne les informations saisies pour inscrire l'utilisateur
   * @returns {LoginInfos}
   */
  getLoginInfos() {
    return {
      email: this.#emailInput.getValue(),
      password: this.#passwordInput.getValue()
    };
  }
  doLogin(event) {
    event.preventDefault();
    if (!this.#emailInput.checkValidity() || !this.#passwordInput.checkValidity()) {
      return;
    }
    this.#loginDecorator.logIn(this.getLoginInfos());
  }

  doSignup(event) {
    event.preventDefault();
    if (!this.checkValidity()) {
      return;
    }
    this.#signUpDecorator.signup(this.getRegisterUserInfos());
  }

  checkValidity() {
    if (this.#isLogin) {
      return !this.#emailInput.checkValidity() || !this.#passwordInput.checkValidity();
    }
    return this.signupCheckValidity();
  }

  signupCheckValidity() {
    if (!this.#emailInput.checkValidity()
    || !this.#firstNameInput.checkValidity()
    || !this.#lastNameInput.checkValidity()
    || !this.#passwordInput.checkValidity()
    || !this.#confirmPasswordInput.checkValidity()) {
      return false;
    }
    if (this.#passwordInput.getValue() === this.#confirmPasswordInput.getValue()) {
      this.#passwordInput.setCustomValidity('');
      return true;
    }

    this.#passwordInput.setCustomValidity(InputView.PASSWORD_ERROR);
    this.#passwordInput.checkValidity();
    this.#passwordInput.clearValue();
    this.#confirmPasswordInput.clearValue();
    return false;
  }

}
export default LoginSpace;