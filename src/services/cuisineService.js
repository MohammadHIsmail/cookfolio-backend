const cuisineDao = require('../daos/cuisineDao');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function list() {
  return cuisineDao.findAll();
}

async function get(id) {
  const cuisine = await cuisineDao.findById(id);
  if (!cuisine) throw new AppError('Cuisine not found', HTTP_STATUS.NOT_FOUND);
  return cuisine;
}

async function create(userId, name) {
  return cuisineDao.create({ name, userId });
}

async function remove(id) {
  await get(id);
  return cuisineDao.remove(id);
}

async function update(id, name) {
  await get(id);
  return cuisineDao.update(id, name);
}

module.exports = { list, get, create, remove, update };