// constants/index.js
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Maps API-facing sort keys to real column names, so query params
// never get interpolated directly into SQL.
const POST_SORT_COLUMNS = {
  createdAt: 'created_at',
  title: 'title',
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  SORT_ORDERS,
  POST_SORT_COLUMNS,
};