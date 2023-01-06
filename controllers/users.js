// const {
//   BAD_REQUEST,
//   NOT_FOUND,
//   INTERNAL_SERVER_ERROR,
// } = require("../errors/errors");


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../errors/errors');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const ValidationError = require('../errors/ValidationError');
const WrongDataError = require('../errors/wrong-data-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const modelToDto = ( { _doc } ) => {
  const  { password, __v, ...rest }  =  _doc;
  return { ...rest };
};


// const getUsers = (req, res) => {
//   User.find({})
//     .then((users) => {
//       if (users.length === 0) {
//         res.status(NOT_FOUND).send({ message: "Пользователи на найдены." });
//         return;
//       }
//       res.status(200).send(users);
//     })
//     .catch(() => {
//       res
//         .status(INTERNAL_SERVER_ERROR)
//         .send({ message: "На сервере произошла ошибка" });
//     });
// };

// // module.exports.getUsers = async (req, res, next) => {
// const getUsers = async (req, res, next) => {
//   try {
//     const users = await User.find({});
//     if (users) {
//       const dtoUsers = users.map((user) => modelToDto(user));
//       res.send(dtoUsers);
//     } else throw new NotFoundError('Пользователей не найдено');
//   } catch (err) {
//     next(err);
//   }
// };

// exports.getUsers = async (req, res, next) => {
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    next(err);
  }
};


// const getUserById = (req, res) => {
//   const { userId } = req.params;
//   return User.findById(userId)
//     .orFail(() => new Error("NotFound"))
//     .then((user) => res.status(200).send(user))
//     .catch((err) => {
//       if (err.name === "CastError") {
//         res
//           .status(BAD_REQUEST)
//           .send({ message: "Переданы некорректные данные" });
//       } else if (err.message === "NotFound") {
//         res
//           .status(NOT_FOUND)
//           .send({ message: "Пользователь по указанному _id не найден" });
//       } else {
//         res
//           .status(INTERNAL_SERVER_ERROR)
//           .send({ message: "На сервере произошла ошибка" });
//       }
//     });
// };


// module.exports.getUser = const getUserById = (req, res) => { => {
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) res.send(modelToDto(user));
    else throw new NotFoundError('Пользователь не найден');
  } catch (err) {
    next(err);
  }
};

// const createUser = (req, res) => {
//   const { name, about, avatar } = req.body;
//   return User.create({ name, about, avatar })
//     .then((user) => {
//       res.status(200).send(user);
//     })
//     .catch((err) => {
//       if (err.name === "ValidationError" || err.name === "CastError") {
//         res.status(BAD_REQUEST).send({
//           message: "Переданы некорректные данные при создании пользователя",
//         });
//       } else {
//         res
//           .status(INTERNAL_SERVER_ERROR)
//           .send({ message: "На сервере произошла ошибка" });
//       }
//     });
// };

// module.exports.createUser = async (req, res, next) => {
const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, about, avatar, email, password: hashed,
    });
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );

    res
      .cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      })
      .send(modelToDto(user))
      .end();
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
    }
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Переданы некорректные данные'));
    } else next(err);
  }
};

// //Обновляет профиль
// const patchUserMe = (req, res) => {
//   const { name, about } = req.body;
//   User.findByIdAndUpdate(
//     req.user._id,
//     { name, about },
//     { new: true, runValidators: true }
//   )
//     .orFail(() => new Error("NotFound"))
//     .then((user) => res.send({ data: user }))
//     .catch((err) => {
//       if (err.name === "ValidationError" || err.name === "CastError") {
//         res.status(BAD_REQUEST).send({
//           message: "Переданы некорректные данные при обновлении профиля",
//         });
//       } else if (err.message === "NotFound") {
//         res
//           .status(NOT_FOUND)
//           .send({ message: "Пользователь с указанным _id не найден" });
//       } else {
//         res
//           .status(INTERNAL_SERVER_ERROR)
//           .send({ message: "На сервере произошла ошибка" });
//       }
//     });
// };

// module.exports.updateMe = async (req, res, next) => {
  //Обновляет профиль
const patchUserMe = async (req, res, next) => {
  const { name, about } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (user) res.send(modelToDto(user));
    else throw new NotFoundError('Пользователь не найден');
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Переданы некорректные данные'));
    } else next(err);
  }
};


// //Обновляет аватар
// const updateAvatar = (req, res) => {
//   const { avatar } = req.body;
//   User.findByIdAndUpdate(
//     req.user._id,
//     { avatar },
//     { new: true, runValidators: true }
//   )
//     .orFail(() => new Error("NotFound"))
//     .then((user) => res.send({ data: user }))
//     .catch((err) => {
//       if (err.name === "ValidationError" || err.name === "CastError") {
//         res.status(BAD_REQUEST).send({
//           message: "Переданы некорректные данные при обновлении аватара",
//         });
//       } else if (err.message === "NotFound") {
//         res
//           .status(NOT_FOUND)
//           .send({ message: "Пользователь с указанным _id не найден" });
//       } else {
//         res
//           .status(INTERNAL_SERVER_ERROR)
//           .send({ message: "На сервере произошла ошибка" });
//       }
//     });
// };


//Обновляет аватар
// const updateAvatar = (req, res) => {
//   const { avatar } = req.body;
//   User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
//     .orFail(new ObjectNotFound('Пользователь не найден.'))
//     .orFail(() => new Error('NotFound'))
//     .then(user => res.send({ data: user }))
//     .catch((err) => {
//       if (errors.name === 'ObjectIdIsNotFound') {
//         const UserNotFound = new ObjectNotFound('Пользователь не найден.')
//         return res.status(UserNotFound.status).send({ message: UserNotFound.message })

//       } else if (errors.name === 'ValidationError') {
//         const IncorrectInputValue = new ValidationError(`Переданы некорректные данные.`)
//         return res.status(IncorrectInputValue.status).send({ message: IncorrectInputValue.message })

//       } else if (errors.name === 'CastError') {
//         const UserIdNotValid = new ValidationError(`${req.user._id} не является валидным идентификатором пользователя.`)
//         return res.status(UserIdNotValid.status).send({ message: UserIdNotValid.message })
//       } else {
//         const ServerErr = new ServerError('Произошла ошибка.')
//         return res.status(ServerErr.status).send({ message: 'Произошла ошибка' });
//       }
//       if (err.name === 'ValidationError' || err.name === 'CastError') {
//         res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
//       } else if (err.message === 'NotFound') {
//         res.status(NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
//       } else {
//         res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
//       }
//     })
// };


//Обновляет аватар
// module.exports.updateMeAvatar = async (req, res, next) => {
const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (user) res.send(modelToDto(user));
    else throw new NotFoundError('Пользователь не найден');
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      next(new ValidationError('Переданы некорректные данные'));
    } else next(err);
  }
};



// Проверяет почту и пароль
const login = async (req, res, next) => {
  // получить данные
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new UnauthorizedError("Неправильный email или пароль");
    else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new UnauthorizedError("Неправильный email или пароль");
      else {
        // создать токен
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
          { expiresIn: "7d" }
        );
        // вернуть токен
        res
          .cookie("jwt", token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
          })
          .send(modelToDto(user))
          .end();
      }
    }
  } catch (err) {
    next(err);
  }
};


// exports.getUserMe = async (req, res, next) => {
const getUserMe = async (req, res, next) => {
  const ownerId = req.user._id;
  try {
    const userSpec = await User.findById(ownerId);
    if (userSpec) {
      res.status(200).send({ data: userSpec });
    } else {
      throw new NotFoundError(`Пользователь по указанному ${ownerId} не найден`);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new WrongDataError(`Невалидный id ${ownerId}`));
    } else {
      next(err);
    }
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  patchUserMe,
  updateAvatar,
  login,
  getUserMe,
};
