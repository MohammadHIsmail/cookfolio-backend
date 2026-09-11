const subcategoryDao = require('../daos/subcategoryDao');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function list() {
  return subcategoryDao.findAll();
}

async function get(id) {
  const subcategory = await subcategoryDao.findById(id);
  if (!subcategory) throw new AppError('Subcategory not found', HTTP_STATUS.NOT_FOUND);
  return subcategory;
}

async function create(userId, name) {
  return subcategoryDao.create({ name, userId });
}

async function remove(id) {
  await get(id);
  return subcategoryDao.remove(id);
}

module.exports = { list, get, create, remove };