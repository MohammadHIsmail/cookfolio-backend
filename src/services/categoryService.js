const categoryDao = require('../daos/categoryDao');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function list() {
  return categoryDao.findAll();
}

async function get(id) {
  const category = await categoryDao.findById(id);
  if (!category) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  return category;
}

async function create(userId, name) {
  return categoryDao.create({ name, userId });
}

async function remove(id) {
  await get(id);
  return categoryDao.remove(id);
}

async function update(id, name) {
  await get(id);
  return categoryDao.update(id, name);
}

module.exports = { list, get, create, remove, update };