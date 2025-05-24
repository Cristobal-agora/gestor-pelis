const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
  validateEmailOnly,
  validateNuevaPassword,
} = require("../validators/user.validator");
const validateRequest = require("../middlewares/validation.middleware");

router.post(
  "/recuperar-password",
  validateEmailOnly,
  validateRequest,
  authController.recuperarPassword
);

router.post(
  "/reset-password",
  validateNuevaPassword,
  validateRequest,
  authController.restablecerPassword
);

router.post(
  "/register",
  validateRegister,
  validateRequest,
  authController.register
);

router.post("/login", validateLogin, validateRequest, authController.login);

module.exports = router;
