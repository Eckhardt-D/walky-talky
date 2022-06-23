export class Posts {
  #containerEl;
  #posts = [];

  constructor(containerEl) {
    if (containerEl == null) {
      throw new Error('Posts controller requires a container element.')
    }

    this.#containerEl = containerEl;
  }

  get posts() {
    return this.#posts;
  }

  #getMinutesSinceCreateFromCreatedAt(createdAt) {
    const millisSinceCreate = Date.now() - new Date(createdAt).getTime();
    const minutesSinceCreate = (millisSinceCreate / 1000) / 60;
    const minutesAgo = Math.max(0, minutesSinceCreate);
    return minutesAgo;
  }

  #generateSafePostHTML({ author, createdAt }) {
    const minutes = this.#getMinutesSinceCreateFromCreatedAt(createdAt);

    return `
      <section data-post class="mt-5 w-11/12 mx-auto">
        <header data-post-header class="flex items-center mb-2">
          <h1 data-author class="font-bold m-0">${author}</h1>
          <p data-post-created class="text-sm text-gray-600 m-0 mt-0.5 ml-2">${minutes} min ago</p>
        </header>
        <main data-post-content class=" text-gray-900 text-sm">
          <p>

            <!-- Do not insert content here directly -->
          
          </p>
        </main>
        <footer data-post-footer class="flex items-center mt-3">
          <p class="text-sm font-regular">&#8679; Upvote</p>
          <p class="text-sm ml-5 font-medium">Reply</p>
        </footer>
      </section>
    `
  }

  #createDOMFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  async create({ content }) {
    this.#posts.push({content});

    const html = this.#generateSafePostHTML({
      author: 'John Doe',
      createdAt: new Date().toISOString(),
    });

    const domContent = this.#createDOMFromHTML(html);
    const contentContainer = domContent.querySelector('main[data-post-content] > p');
    contentContainer.innerText = content.trim();

    this.#containerEl.appendChild(domContent);
  }
}