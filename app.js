const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const helmet = require('helmet');
const { handleError } = require('./errors/handleError');
const NotFoundError = require('./errors/NotFoundError');
require('dotenv').config();
const routes = require('./routes');

const { PORT = 3000 } = process.env;
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());

app.use(limiter);
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(routes);

app.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

app.use((req, res, next) => next(new NotFoundError('Маршрут не найден')));
// обработчик ошибок celebrate
app.use(errors());
// централизованная обработка ошибок
app.use((err, req, res, next) => handleError({ res, err, next }));

app.listen(PORT, () => {
  console.log(`порт слушает ${PORT}!`);
});
