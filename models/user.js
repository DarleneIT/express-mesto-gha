const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { URL_REGEX } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Имя пользователя должно быть длиной от 2 до 30 символов',
      },
    },

    about: {
      type: String,
      default: 'Исследователь',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Информация о пользователе должна быть длиной от 2 до 30 символов',
      },
    },

    avatar: {
      type: String,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (url) => URL_REGEX.test(url),
        message: 'Введите URL',
      },
    },

    email: {
      type: String,
      required: [true, 'Поле должно быть заполнено'],
      unique: true,
      validate: {
        validator: (email) => /.+@.+\..+/.test(email),
        message: 'Введите корректный e-mail',
      },
    },

    password: {
      type: String,
      required: [true, 'Поле должно быть заполнено'],
      select: false,
      validate: {
        validator: ({ length }) => length >= 3,
        message: 'Пароль должен иметь не менее 3х символов ',
      },
    },
  },

  {
    versionKey: false,
    statics: {
      findUserByCredentials(email, password) {
        return this.findOne({ email })
          .select('+password')
          .then((user) => {
            if (user) {
              return bcrypt.compare(password, user.password).then((matched) => {
                if (matched) return user;

                return Promise.reject();
              });
            }

            return Promise.reject();
          });
      },
    },
  }
);

module.exports = mongoose.model('user', userSchema);
