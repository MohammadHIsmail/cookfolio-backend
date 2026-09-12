const { Router } = require('express');
const bookService = require('../services/bookService');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createBookSchema } = require('../validators/bookValidator');
const { HTTP_STATUS } = require('../../constants');

const router = Router();

router.get('/', authenticate, async (request, response, next) => {
  try {
    const books = await bookService.list();
    response.status(HTTP_STATUS.OK).json(books);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (request, response, next) => {
  try {
    const book = await bookService.get(request.params.id);
    response.status(HTTP_STATUS.OK).json(book);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(createBookSchema), async (request, response, next) => {
  try {
    const book = await bookService.create(request.user.id, request.body);
    response.status(HTTP_STATUS.CREATED).json(book);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (request, response, next) => {
  try {
    const book = await bookService.update(request.params.id, request.body);
    response.status(HTTP_STATUS.OK).json(book);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (request, response, next) => {
  try {
    await bookService.remove(request.params.id);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
});



router.put('/fav/:id', authenticate, async (request, response, next) => {
  try {
    const book = await bookService.toggleFavorite(request.params.id);
    response.status(HTTP_STATUS.OK).json(book);
  } catch (err) {
    next(err);
  }
});

module.exports = router;