const { Router } = require('express');
const { Users } = require('../controllers/users');

const router = Router();
const users = new Users();

router.get('/', async (_, res) => {
  try {
    const user = await users.getRandomUser();

    res.json({
      data: user,
      error: null,
    })
  } catch (error) {
    res.json({
      data: null,
      error: error.message,
    })
  }
})

module.exports = router;