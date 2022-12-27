const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Мария Кюри',
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Ученый',
  },
  avatar: {
    type: String,
    required: true,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: [validator.isURL, 'Некорректный url'],
  }
  // ,
  // email: {
  //   type: String,
  //   unique: true,
  //   required: true,
  //   validate: [validator.isEmail, 'Некорректный email'],
  // },
  // password: {
  //   type: String,
  //   required: true,
  //   select: false,
  // },
}
, { versionKey: false }
);

module.exports = mongoose.model('user', userSchema);
