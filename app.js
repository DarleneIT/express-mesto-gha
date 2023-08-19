const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const router = require('express').Router();
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const app = express();

mongoose.connect(DB_URL);

app.use((req, res, next) => {
  req.user = {
    _id: '64de2af2c411788b8c4dba8a',
  };
  next();
});

app.use(express.json());
app.use(helmet());
app.use('/', router);
app.use('/cards', cardsRouter);
app.use('/users', usersRouter);
app.use('/', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.listen(PORT);
