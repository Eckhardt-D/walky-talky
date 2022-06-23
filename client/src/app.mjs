export class App {
  #user;
  #loading = true;
  #appElement;
  #loadingElement;

  constructor(element, loader) {
    this.#appElement = element;
    this.#loadingElement = loader;
    this.loading = true;
  }

  get loading() {
    return this.#loading;
  }

  set loading(value) {
    this.#loading = value;
    this.#appElement.style.display = value ? 'none' : 'block';
    this.#loadingElement.style.display = value ? 'block' : 'none';
  }

  get user() {
    return this.#user;
  }

  setUser(user, nameElement) {
    this.#user = user;
    nameElement.innerText = user.username;
  }
}