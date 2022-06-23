const { Router } = require('express');
const { Comments } = require('../controllers/comments');

const router = Router();
const comments = new Comments();

router.post('/', async (req, res) => {
  const { authorId, postId, content } = req.body;

  try {
    const comment = await comments.add({
      authorId,
      postId,
      content,
    });

    res.json({
      data: comment,
      error: null,
    })
  } catch (error) {
     res.json({
      data: null,
      error: error.message,
    })
  }
});

module.exports = router;