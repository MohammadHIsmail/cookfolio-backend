const { Router } = require('express');
const subcategoryService = require('../services/subcategoryService');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { tagsSchema } = require('../validators/tagsValidator');
const { HTTP_STATUS } = require('../../constants');

const router = Router();

router.get('/', authenticate, async (request, response, next) => {
  try {
    const subcategory = await subcategoryService.list();
    response.status(HTTP_STATUS.OK).json(subcategory);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (request, response, next) => {
  try {
    const subcategory = await subcategoryService.get(request.params.id);
    response.status(HTTP_STATUS.OK).json(subcategory);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(tagsSchema), async (request, response, next) => {
  try {
    const subcategory = await subcategoryService.create(request.user.id, request.body);
    response.status(HTTP_STATUS.CREATED).json(subcategory);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, validate(tagsSchema), async (request, response, next) => {
  try {
    const subcategory = await subcategoryService.update(request.params.id, request.body);
    response.status(HTTP_STATUS.OK).json(subcategory);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (request, response, next) => {
  try {
    await subcategoryService.remove(request.params.id);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;