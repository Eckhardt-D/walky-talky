const { Router } = require('express');
const { Posts } = require('../controllers/posts');

const router = Router();
const posts = new Posts();

router.post('/', async (req, res) => {
  const { userId, content } = req.body;

  try {
    const post = await posts.add({
      userId,
      content,
    });

    res.json({
      data: post,
      error: null,
    })
  } catch (error) {
     res.json({
      data: null,
      error: error.message,
    })
  }
})

router.get('/', async (_, res) => {
  try {
    const items = await posts.get();

    res.json({
      data: items,
      error: null,
    })
  } catch (error) {
    res.json({
      error: error.message,
      data: null,
    })
  }
});

router.post('/upvote', async (req, res) => {
  const { postId, authorId, upvoterId } = req.body;

  try {
    const items = await posts.upvotePost({
      authorId,
      upvoterId,
      postId,
    });

    res.json({
      data: items,
      error: null,
    })
  } catch (error) {
    res.json({
      error: error.message,
      data: null,
    })
  }
})

module.exports = router;