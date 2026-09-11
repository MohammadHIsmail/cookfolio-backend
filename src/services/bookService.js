const bookDao = require('../daos/bookDao');
const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../../constants');

async function list() {
  return bookDao.findAll();
}

async function get(id) {
  const book = await bookDao.findById(id);
  if (!book) throw new AppError('Book not found', HTTP_STATUS.NOT_FOUND);
  return book;
}

async function create(userId, data) {
  return bookDao.create({ ...data, userId });
}

async function toggleFavorite(id) {
  await get(id); // throws 404 if missing
  return bookDao.toggleFavorite(id);
}

async function remove(id) {
  await get(id);
  return bookDao.remove(id);
}

module.exports = { list, get, create, toggleFavorite, remove };