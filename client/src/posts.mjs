import { createDOMFromHTML } from "./helpers.mjs";

export class Posts {
  #postInterval;
  #containerEl;
  #posts = [];
  #user;
  #app;

  constructor(app, containerEl) {
    if (containerEl == null || !app) {
      throw new Error('Posts controller requires a container element and user.')
    }

    this.#containerEl = containerEl;
    this.#app = app;
    this.#user = app.user;
    this.#setPostTimer();
  }

  get posts() {
    return this.#posts;
  }

  #getMinutesSinceCreateFromCreatedAt(createdAt) {
    const millisSinceCreate = Date.now() - new Date(createdAt).getTime();
    const minutesSinceCreate = (millisSinceCreate / 1000) / 60;
    const minutesAgo = Math.floor(Math.max(0, minutesSinceCreate));
    return minutesAgo;
  }

  #generateSafePostHTML({ id, author, createdAt }) {
    const minutes = this.#getMinutesSinceCreateFromCreatedAt(createdAt);

    return `
      <section data-post="${id}" class="mt-5 w-11/12 mx-auto">
        <header data-post-header class="flex items-center mb-2">
          <h1 data-author class="font-bold m-0">${author}</h1>
          <p data-post-created class="text-sm text-gray-600 m-0 mt-0.5 ml-2">${minutes} min ago</p>
        </header>
        <main data-post-content class=" text-gray-900 text-sm">
          <p>

            <!-- DO NOT insert content here directly (xss) -->
          
          </p>
        </main>
        <footer data-post-footer class="flex items-center mt-3">
          <p class="text-sm font-regular">&#8679; Upvote</p>
          <p class="text-sm ml-5 font-medium">Reply</p>
        </footer>
      </section>
    `
  }

  #setPostTimer() {
    if (this.#postInterval) return;

    this.#postInterval = setInterval(() => {
      if (this.#posts.length > 0) {
        this.#posts.forEach(post => {
          this.#updatePostTime(post.id);
        });
      };
    }, 5000);
  }

  #updatePostTime(id) {
    const post = this.#posts.find(post => post.id === id);
    const postElement = document.querySelector(`*[data-post="${id}"]`);
    const postTimeContainer = postElement.querySelector('*[data-post-created]');
    const timeSinceCreated = this.#getMinutesSinceCreateFromCreatedAt(post.createdAt);
    postTimeContainer.innerText = `${timeSinceCreated} min ago`;
  }

  #render() {
    const posts = this.#posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.#containerEl.innerHTML = '';

    posts.forEach(post => {
      const html = this.#generateSafePostHTML(post);
      const domContent = createDOMFromHTML(html);
      const contentContainer = domContent.querySelector('main[data-post-content] > p');
      contentContainer.innerText = post.content.trim();
      this.#containerEl.appendChild(domContent);
    })
  }

  async create({ content, userId }) {
    const url = '/api/posts';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        content,
        userId,
      })
    });
    const {data} = await response.json();
    
    const post = {
      id: data.id,
      author: this.#user.username,
      createdAt: data.createdAt,
      content: data.content,
    }

    this.#posts.push(post);
    this.#render();
  }

  async fetchPosts() {
    const url = `/api/posts`;
    const response = await fetch(url);
    const {data} = await response.json();

    this.#posts = data.map(post => ({
      id: post.id,
      author: post.author.username,
      createdAt: post.createdAt,
      content: post.content,
    }));

    this.#render();
  }
}