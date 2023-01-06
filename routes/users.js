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
  patchUserMeValidation,
  patchUserAvatarValidation,
  userIdValidation,
} = require('../middlewares/validatons');

 // роуты, не требующие авторизации - регистрация и логин
 router.post('/signin', login);
 router.post('/signup', createUser);
 // авторизация
router.use(auth);

// роуты, которым авторизация нужна
router.get('/users', getUsers);
router.get('/users/me', getUserMe);
router.patch('/users/me', patchUserMeValidation,  patchUserMe);
router.get('/users/:userId', getUserById);
// router.post('/users', createUser);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;