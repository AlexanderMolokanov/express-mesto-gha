const express = require('express');
const mongoose = require('mongoose');

// const path = require('path')

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
// const { celebrate, Joi, errors } = require('celebrate');

const { handleError } = require('./errors/handleError');
// const { login, createUser } = require('./controllers/users');
// const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/NotFoundError');
require('dotenv').config();
const routes = require('./routes');

const { PORT = 3000 } = process.env;
const app = express();

// app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/mestodb');




app.use((req, res, next) => {
  req.user = {
    _id: '63a02c5ebc2de6001f0025c4' // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});



// app.post(
//   '/signin',
//   celebrate({
//     body: Joi.object().keys({
//       email: Joi.string().email().required(),
//       password: Joi.string().required(),
//     }),
//   }),
//   login,
// );

// app.post(
//   '/signup',
//   // celebrate({
//   //   body: Joi.object().keys({
//   //     name: Joi.string().min(2).max(30),
//   //     about: Joi.string().min(2).max(30),
//   //     avatar: Joi.string().pattern(
//   //       /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
//   //     ),
//   //     email: Joi.string().email().required(),
//   //     password: Joi.string().required(),
//   //   }),
//   // }),
//   createUser,
// );

// app.use(auth);
app.use(routes);

app.use((req, res, next) => next(new NotFoundError('Маршрут не найден')));
// app.use(errors());

app.use((err, req, res, next) => handleError({ res, err, next }));

app.listen(PORT, () => {
  console.log(`порт слушает ${PORT}!`)
});
