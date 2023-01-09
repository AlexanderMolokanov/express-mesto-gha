const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
// const ValidationError = require('../errors/ValidationError');

// const WrongDataError = require('../errors/wrong-data-err');
const BadRequest = require('../errors/BadRequest'); // 400

const { NODE_ENV, JWT_SECRET } = process.env;

const modelToDto = ({ _doc }) => {
  const { password, __v, ...rest } = _doc;
  return { ...rest };
};

// получить пользователей
const getUsers = async (req, res, next) => {
  userSchema
    .find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  userSchema.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Передан некорретный Id'));
        return;
      }
      next(err);
    });
};

const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await userSchema.create({
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
    if (err.name === 'BadRequest' || err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else next(err);
  }
};

// обновить профиль
const patchUserMe = async (req, res, next) => {
  const { name, about } = req.body;
  try {
    const user = await userSchema.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (user) res.send(modelToDto(user));
    else throw new NotFoundError('Пользователь не найден');
  } catch (err) {
    if (err.name === 'BadRequest' || err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else next(err);
  }
};

// обновить аватар
const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  try {
    const user = await userSchema.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (user) res.send(modelToDto(user));
    else throw new NotFoundError('Пользователь не найден');
  } catch (err) {
    if (err.name === 'BadRequest' || err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else next(err);
  }
};

// проверить почту и пароль
const login = async (req, res, next) => {
  // получить данные
  const { email, password } = req.body;
  try {
    const user = await userSchema.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedError('Неправильный email или пароль');
    else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new UnauthorizedError('Неправильный email или пароль');
      else {
        // создать токен
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '7d' },
        );
        // вернуть токен
        res
          .cookie('jwt', token, {
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

const getUserMe = async (req, res, next) => {
  const ownerId = req.user._id;
  try {
    const userSpec = await userSchema.findById(ownerId);
    if (userSpec) {
      res.status(200).send({ data: userSpec });
    } else {
      throw new NotFoundError(`Пользователь по указанному ${ownerId} не найден`);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest(`Невалидный id ${ownerId}`));
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
