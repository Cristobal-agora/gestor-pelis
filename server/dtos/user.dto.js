class RegisterUserDTO {
  constructor({ nombre, email, password }) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
  }
}

class LoginUserDTO {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

module.exports = {
  RegisterUserDTO,
  LoginUserDTO,
};
