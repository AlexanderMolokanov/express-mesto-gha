const mongoose = require('mongoose');
const validator = require('validator');

const cardModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: [validator.isURL, 'Некорректный url'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: '[]',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
// { versionKey: false }
);

module.exports = mongoose.model('card', cardModel);
