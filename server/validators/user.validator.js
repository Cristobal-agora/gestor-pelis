const { body } = require('express-validator');

const validateRegister = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

  body('email')
    .isEmail().withMessage('Debes proporcionar un email válido'),

  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Debes proporcionar un email válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = {
  validateRegister,
  validateLogin,
};
