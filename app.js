const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const router = require('express').Router();
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const login = require('./routes/index');
const createUser = require('./routes/index');

const auth = require('./middlewares/auth');

const NotFoundError = require('./errors/NotFound');
const error = require('./middlewares/error');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.set('strictQuery', true);
mongoose.connect(DB_URL);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(helmet());

app.use('/', router);
app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/cards', auth, cardsRouter);
app.use('/users', auth, usersRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Cтраница не найдена'));
});
app.use(errors());
app.use(error);

app.listen(PORT);
