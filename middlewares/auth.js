const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/Unauthorized');

const SECRET_KEY = '0beb9865b2a6f1d2b90f66a9a8e6c642e0b8e34593c9a71f5b7cbce0cdd2e2cd';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Пожалуйста, пройдите авторизацию');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new UnauthorizedError('Пожалуйста, пройдите авторизацию');
  }

  req.user = payload;
  next();
};
