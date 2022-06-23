export class TalkyForm {
  form;
  #input;
  #button;
  #inputValue = '';
  #loading = false;
  onSubmitPromises = [];
  
  constructor(el) {
    this.form = el;
    this.#input = this.form.querySelector('input[data-form-input]');
    this.#button = this.form.querySelector('button[data-form-submit]');
    this.#registerEventListeners();
  };

  get loading() {
    return this.#loading;
  }

  set loading(value) {
    this.#button.toggleAttribute('disabled', value);
    this.#input.toggleAttribute('disabled', value);
    this.#loading = value;
  }

  onSubmit(promiseFn) {
    this.onSubmitPromises.push(promiseFn);
  };

  #registerEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    this.#input.addEventListener('input', (e) => {
      this.#inputValue = e.target.value;
    });

    this.#button.addEventListener('click', async () => {
      await this.#submit();
      this.#input.value = '';
      this.#inputValue = '';
      this.loading = false;
    });
  };

  async #submit() {
    if (this.#loading) return;
    
    this.loading = true;
    if (this.onSubmitPromises.length > 0) {
      await Promise.all(
        this.onSubmitPromises.map(promise => promise({
          content: this.#inputValue,
        })
      ));
    };
  };
}
