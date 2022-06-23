import { TalkyForm } from "./src/form.mjs";
import { Posts } from "./src/posts.mjs";
import { App } from "./src/app.mjs";
import { getUser } from "./src/user.mjs";

const app = new App(
  document.querySelector('*[data-app]'),
  document.querySelector('*[data-loader]'),
)

getUser()
  .then(user => {
    app.setUser(
      user,
      document.querySelector('*[data-user-name]'),
    );

    app.loading = false;

    const posts = new Posts(
      app.user,
      document.querySelector('div[data-posts-container]'),
    );

  
    const talkyForm = new TalkyForm(
      document.querySelector('form[data-post-form]')
    );
    
    talkyForm.onSubmit(async (data) => {
      await posts.create(data);
    });
  })
  .catch(error => {
    app.error(error);
  })