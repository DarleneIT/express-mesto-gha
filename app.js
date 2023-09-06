const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const router = require('express').Router();
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const auth = require('./middlewares/auth');

const NotFoundError = require('./errors/NotFound');
const error = require('./middlewares/error');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.set('strictQuery', true);
mongoose.connect(DB_URL);

app.use((req, res, next) => {
  req.user = {
    _id: '64de2af2c411788b8c4dba8a',
  };
  next();
});

//надо проверить

mongoose.set('strictQuery', true);

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log('БД успешно подключена');
  })
  .catch(() => {
    console.log('Не удалось подключиться к БД');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(helmet());

app.use('/', router);

app.use('/cards', cardsRouter);
app.use('/users', usersRouter);

app.use(auth);
app.use(errors());
app.use(error);

app.use((req, res, next) => next(new NotFoundError('Страница не найдена')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT);
