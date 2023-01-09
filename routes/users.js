const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  getUsers,
  getUserById,
  createUser,
  patchUserMe,
  updateAvatar,
  login,
  getUserMe,
} = require('../controllers/users');

const {
  signUpValidation,
  signInValidation,
  patchUserMeValidation,
  patchUserAvatarValidation,
  userIdValidation,
} = require('../middlewares/validatons');

// роуты, не требующие авторизации - регистрация и логин
router.post('/signin', signInValidation, login);
router.post('/signup', signUpValidation, createUser);
// авторизация
router.use(auth);

// роуты, которым авторизация нужна
router.get('/users', getUsers);
router.get('/users/me', getUserMe);
router.patch('/users/me', patchUserMeValidation, patchUserMe);
router.get('/users/:userId', userIdValidation, getUserById);
router.patch('/users/me/avatar', patchUserAvatarValidation, updateAvatar);

module.exports = router;
