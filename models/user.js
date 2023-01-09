const mongoose = require('mongoose');
const validator = require('validator');
// const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      default:
        'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: [validator.isURL, 'Некорректный url'],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: [validator.isEmail, 'Некорректный email'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

// userSchema.statics.findUserByCredentials = function (email, password) {
//   // попытаемся найти пользователя по почте
//   return this.findOne({ email })
//     .select('+password')
//     .then((user) => {
//       if (!user) {
//         // не нашёлся — отклоняем промис
//         return Promise.reject(new Error('Неправильные почта или пароль'));
//       }
//       // нашёлся — сравниваем хеши
//       return bcrypt.compare(password, user.password).then((matched) => {
//         if (!matched) {
//           // отклоняем промис
//           return Promise.reject(new Error('Неправильные почта или пароль'));
//         }
//         return user;
//       });
//     });
// };

module.exports = mongoose.model('user', userSchema);
