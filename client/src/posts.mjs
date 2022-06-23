import { createDOMFromHTML } from "./helpers.mjs";

export class Posts {
  #postInterval;
  #containerEl;
  #posts = [];
  #loading = false;
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

  #generateSafePostHTML({ id, author, createdAt, upvotes }) {
    const minutes = this.#getMinutesSinceCreateFromCreatedAt(createdAt);
    const myUpvotes = this.#user.upvotes;
    const hasUpvoted = myUpvotes.some(upvote => upvote.postId === id);

    return `
      <section data-post="${id}" class="mt-5 w-11/12 mx-auto">
        <header data-post-header class="flex items-center mb-2">
          <h1 data-author class="font-bold m-0">${author}</h1>
          <p data-post-created class="text-sm text-gray-600 m-0 mt-0.5 ml-2">${minutes} min ago</p>
          <div class="ml-5 p-1 bg-purple-500 text-[0.6rem] grid place-items-center text-white">
          ${upvotes} upvote${upvotes === 1 ? '' :'s'}
          </div>
        </header>
        <main data-post-content class=" text-gray-900 text-sm">
          <p>

            <!-- DO NOT insert content here directly (xss) -->
          
          </p>
        </main>
        <footer data-post-footer class="flex items-center mt-3">
          <p data-upvote-btn class="text-sm font-regular cursor-pointer ${hasUpvoted ? 'text-purple-500' : ''}">&#8679; Upvote</p>
          <p data-reply-btn class="text-sm ml-5 font-medium cursor-pointer">Reply</p>
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

  #registerUpvoteClickEvent(el, post) {
    el.addEventListener('click', async () => {
      if(post.authorId === this.#user.id) return;
      el.classList.add('text-gray-400')

      await this.upvotePost({
        authorId: post.authorId,
        postId: post.id,
        upvoterId: this.#user.id,
      });

      el.classList.remove('text-gray-400');
    });
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
      const upvoteButton = domContent.querySelector('*[data-upvote-btn]');
      contentContainer.innerText = post.content.trim();

      if (post.author === this.#user.id) {
        upvoteButton.style.display = 'none';
      }

      this.#registerUpvoteClickEvent(upvoteButton, post);
      this.#containerEl.appendChild(domContent);
    })
  }

  #formatPosts(posts) {
    return posts.map(post => ({
      id: post.id,
      author: post.author.username,
      authorId: post.author.id,
      createdAt: post.createdAt,
      content: post.content,
      upvotes: post._count.upvotes,
    }));
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
      authorId: this.#user.id,
      createdAt: data.createdAt,
      content: data.content,
      upvotes: data._count.upvotes,
    }

    this.#posts.push(post);
    this.#render();
  }

  async upvotePost({authorId, postId, upvoterId}) {
    if (this.#loading) return;

    const isExistingUpvote = this.#user.upvotes.some(vote => vote.postId === postId);

    // Locally update the users data to avoid another fetch
    if (isExistingUpvote) {
      this.#user.upvotes = this.#user.upvotes.filter(vote => {
        vote.postId !== postId
      })
    } else {
      this.#user.upvotes.push({
        postId,
      })
    }

    this.#loading = true;
    const url = '/api/posts/upvote';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        authorId,
        postId,
        upvoterId,
      })
    });

    const {data} = await response.json();

    this.#posts = this.#formatPosts(data);
    this.#render();
    this.#loading = false;
  }

  async fetchPosts() {
    const url = `/api/posts`;
    const response = await fetch(url);
    const {data} = await response.json();

    this.#posts = this.#formatPosts(data);
    this.#render();
  }
}