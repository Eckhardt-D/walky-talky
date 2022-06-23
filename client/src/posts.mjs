import { createDOMFromHTML } from "./helpers.mjs";
import { createComponent } from "../upvotes.mjs";
import { TalkyForm } from "./form.mjs";

export class Posts {
  #activeReplyForms = [];
  #postInterval;
  #containerEl;
  #posts = [];
  #loading = false;
  #socket;
  #user;
  #app;

  constructor(app, socket, containerEl) {
    if (containerEl == null || !app) {
      throw new Error('Posts controller requires a container element and user.')
    }

    this.#containerEl = containerEl;
    this.#socket = socket;
    this.#app = app;
    this.#user = app.user;
    this.#setPostTimer();
    this.#registerSocketEvents();
  }

  get posts() {
    return this.#posts;
  }

  #registerSocketEvents() {
    this.#socket.on('upvote', () => {
      // We could be more explicit here
      // and only set the value of the
      // relevant post.
      this.fetchPosts();
    });
  }

  #getMinutesSinceCreateFromCreatedAt(createdAt) {
    const millisSinceCreate = Date.now() - new Date(createdAt).getTime();
    const minutesSinceCreate = (millisSinceCreate / 1000) / 60;
    const minutesAgo = Math.floor(Math.max(0, minutesSinceCreate));
    return minutesAgo;
  }

  #generateSafeCommentsHTML(comments) {
    if (comments.length === 0 ) return '';
    let str = '';

    comments.forEach(comment => {
      const minutes = this.#getMinutesSinceCreateFromCreatedAt(comment.createdAt);

      str += `
        <section data-comment="${comment.id}" class="mt-5 w-11/12 mx-auto">
          <header data-post-header class="flex items-center mb-2">
            <h1 data-author class="font-bold m-0">${comment.author.username}</h1>
            <p data-post-created class="text-sm text-gray-600 m-0 mt-0.5 ml-2">${minutes} min ago</p>
          </header>
          <main data-post-content class=" text-gray-900 text-sm">
            <p>

            <!-- DO NOT insert content here directly (xss) -->
            
            </p>
          </main>
        </section>
      `
    })

    return str;
  }

  #generateSafePostHTML({ id, author, createdAt, upvotes, comments }) {
    const minutes = this.#getMinutesSinceCreateFromCreatedAt(createdAt);

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
        <footer data-post-footer="${id}" class="flex items-center mt-3">
          <div data-upvote-btn class="text-sm font-regular cursor-pointer"></div>
          <p data-reply-btn class="text-sm ml-5 font-medium cursor-pointer">Reply</p>
        </footer>
        <section data-reply-form></section>
        <section data-comments-container>
          ${ comments ? this.#generateSafeCommentsHTML(comments.filter( comment => comment.postId === id)) : '' }
        </section>
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

  #showReplyForm(post) {
    const postContainer = this.#containerEl.querySelector(`*[data-post="${post.id}"]`);
    const replyFormContainer = postContainer.querySelector('*[data-reply-form]');
    
    if (this.#activeReplyForms.includes(post.id)) {
      this.#activeReplyForms = this.#activeReplyForms.filter(activeForm => {
        return activeForm !== post.id;
      });

      return replyFormContainer.firstChild.remove();
    }
    
    this.#activeReplyForms.push(post.id);
    const formHTML = document.querySelector('form[data-post-form]');
    const copy = formHTML.cloneNode(true);
    replyFormContainer.appendChild(copy);

    const form = new TalkyForm(copy);

    form.onSubmit(async (data) => {
      const url = '/api/comments';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          authorId: this.#user.id,
          postId: post.id,
          content: data.content,
        })
      })

      const { data: comment } = await response.json();
      post.comments.push(comment);
      this.#render();
    })
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
      const replyButton = domContent.querySelector('*[data-reply-btn]');

      replyButton.addEventListener('click',
        () => this.#showReplyForm(post)
      );
      
      contentContainer.innerText = post.content.trim();

      post.comments.forEach(comment => {
        const commentContentContainer = domContent.querySelector(`*[data-comment="${comment.id}"] main[data-post-content] > p`);
        commentContentContainer.innerText = comment.content.trim();
      });

      this.#containerEl.appendChild(domContent);

      // Hide actions for own post.
      if (post.authorId === this.#user.id) {
        replyButton.style.display = 'none';
        return;
      }

      // Use react component for upvotes
      createComponent(
        upvoteButton,
        post,
        this.#user,
        this
      );
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
      comments: post.comments,
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
      comments: data.comments,
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
    this.#socket.emit('upvoted');
  }

  async fetchPosts() {
    const url = `/api/posts`;
    const response = await fetch(url);
    const {data} = await response.json();

    this.#posts = this.#formatPosts(data);
    this.#render();
  }
}