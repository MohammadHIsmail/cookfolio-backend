const recipeDao = require('../daos/recipeDao');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function list() {
  return recipeDao.findAll();
}

async function get(id) {
  const recipe = await recipeDao.findById(id);
  if (!recipe) throw new AppError('Recipe not found', HTTP_STATUS.NOT_FOUND);
  return recipe;
}

async function create(userId, data) {
  return recipeDao.create({ ...data, userId });
}

async function toggleFavorite(id) {
  await get(id); // throws 404 if missing
  return recipeDao.toggleFavorite(id);
}

async function remove(id) {
  await get(id);
  return recipeDao.remove(id);
}

async function update(id, data) {
  await get(id);
  return recipeDao.update(id, {...data});
}

module.exports = { list, get, create, toggleFavorite, remove, update };