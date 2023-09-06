const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const BadRequestError = require('../errors/BadRequest');
const UnauthorizedError = require('../errors/Unauthorized');
const NotFoundError = require('../errors/NotFound');
const ConflictError = require('../errors/Conflict');

const SECRET_KEY = require('../utils/constants');

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  return bcrypt
    .hash(password, 8)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Проверьте корректность отправленных данных'));
      } else if (err.code === 11000) {
        next(
          new ConflictError('Пользователь с таким   e-mail уже зарегистрирован'),
        );
      } else {
        next(err);
      }
    });
};

module.exports.getUsers = (_, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь с таким id не найден'));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.editUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true }
  )
    .orFail(() => next(new NotFoundError('NotFound')))
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Не удалось обновить профиль'));
      }
      return next(err);
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Не удалось обновить аватар'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });

        return res.send({ _id: token });
      }
      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
};
