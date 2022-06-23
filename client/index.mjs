import { TalkyForm } from "./src/form.mjs";
import { Posts } from "./src/posts.mjs";

const talkyForm = new TalkyForm(
  document.querySelector('form[data-post-form]')
);

const posts = new Posts(
  document.querySelector('div[data-posts-container]')
);

talkyForm.onSubmit(async (data) => {
  await posts.create(data);
});