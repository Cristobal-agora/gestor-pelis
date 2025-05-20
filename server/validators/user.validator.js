const { body } = require("express-validator");

const validateRegister = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio")
    .isEmail()
    .withMessage("Debes proporcionar un email válido"),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Za-z]/)
    .withMessage("La contraseña debe contener al menos una letra")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número")
    .custom((value) => !/\s/.test(value))
    .withMessage("La contraseña no puede contener espacios"),
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio")
    .isEmail()
    .withMessage("Debes proporcionar un email válido"),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Za-z]/)
    .withMessage("La contraseña debe contener al menos una letra")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número")
    .custom((value) => !/\s/.test(value))
    .withMessage("La contraseña no puede contener espacios"),
];

const validateUpdateProfile = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio")
    .isEmail()
    .withMessage("Debes proporcionar un email válido"),
];

const validateChangePassword = [
  body("passwordActual")
    .notEmpty()
    .withMessage("La contraseña actual es obligatoria"),

  body("nuevaPassword")
    .notEmpty()
    .withMessage("La nueva contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Za-z]/)
    .withMessage("La nueva contraseña debe contener al menos una letra")
    .matches(/\d/)
    .withMessage("La nueva contraseña debe contener al menos un número")
    .custom((value) => !/\s/.test(value))
    .withMessage("La nueva contraseña no puede contener espacios")
    .custom((value, { req }) => value !== req.body.passwordActual)
    .withMessage("La nueva contraseña debe ser distinta de la actual"),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
