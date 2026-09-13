const { Router } = require('express');
const recipeService = require('../services/recipeService');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createRecipeSchema, updateRecipeSchema } = require('../validators/recipeValidator');
const { HTTP_STATUS } = require('../../constants');

const router = Router();

router.get('/', authenticate, async (request, response, next) => {
  try {
    const recipes = await recipeService.list();
    response.status(HTTP_STATUS.OK).json(recipes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (request, response, next) => {
  try {
    const recipe = await recipeService.get(request.params.id);
    response.status(HTTP_STATUS.OK).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(createRecipeSchema), async (request, response, next) => {
  try {
    const recipe = await recipeService.create(request.user.id, request.body);
    response.status(HTTP_STATUS.CREATED).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, validate(updateRecipeSchema), async (request, response, next) => {
  try {
    const recipe = await recipeService.update(request.params.id, request.body);
    response.status(HTTP_STATUS.OK).json(recipe);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (request, response, next) => {
  try {
    await recipeService.remove(request.params.id);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
});

router.put('/fav/:id', authenticate, async (request, response, next) => {
  try {
    const recipe = await recipeService.toggleFavorite(request.params.id);
    response.status(HTTP_STATUS.OK).json(recipe);
  } catch (err) {
    next(err);
  }
});

module.exports = router;