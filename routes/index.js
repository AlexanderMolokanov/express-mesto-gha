const router = require('express').Router();
const { NOT_FOUND } = require('../errors/errors');

router.use('/', require('./users'));
router.use('/', require('./cards'));

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Сервер не найден' });
});

module.exports = router;