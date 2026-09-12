const { Router } = require('express');
const authService = require('../services/authService');
const { HTTP_STATUS } = require('../../constants');

const router = Router();

router.post('/register', async (request, response, next) => {
  try {
    const user = await authService.register(request.body);
    response.status(HTTP_STATUS.CREATED).json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (request, response, next) => {
  try {
    const result = await authService.login(request.body);
    response.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;