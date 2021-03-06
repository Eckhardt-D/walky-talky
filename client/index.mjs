import { TalkyForm } from "./src/form.mjs";
import { Posts } from "./src/posts.mjs";
import { App } from "./src/app.mjs";
import { getUser } from "./src/user.mjs";

const socket = io();

const app = new App(
  document.querySelector('*[data-app]'),
  document.querySelector('*[data-loader]'),
)

getUser()
  .then(async (user) => {
    app.setUser(
      user,
      document.querySelector('*[data-user-name]'),
    );

    const posts = new Posts(
      app,
      socket,
      document.querySelector('div[data-posts-container]'),
    );
      
    await posts.fetchPosts();
    app.loading = false;
    
    const talkyForm = new TalkyForm(
      document.querySelector('form[data-post-form]')
    );
    
    talkyForm.onSubmit(async (data) => {
      await posts.create({
        userId: app.user.id,
        content: data.content,
      });
    });
  })
  .catch(error => {
    console.error(error)
    // app.error(error); :TODO
  })