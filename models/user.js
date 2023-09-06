const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UnauthorizedError = require('../errors/Unauthorized');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Имя должно быть длиной от 2 до 30 символов',
      },
    },

    about: {
      type: String,
      default: 'Исследователь',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Информация должна быть длиной от 2 до 30 символов',
      },
    },

    avatar: {
      type: String,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (url) => URL_REGEX.test(url),
        message: 'Введите корректный URL',
      },
    },

    email: {
      type: String,
      required: [true, 'Поле должно быть заполнено'],
      unique: true,
      validate: {
        validator(email) {
          return /.+@.+\..+/.test(email);
        },
        message: 'Введите корректный email',
      },
    },

    password: {
      type: String,
      required: [true, 'Поле должно быть заполнено'],
      select: false,
    },
  },

  {
    versionKey: false,
  },
);

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Пожалуйста, проверьте корректность почты или пароля');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Пожалуйста, проверьте корректность почты или пароля');
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
