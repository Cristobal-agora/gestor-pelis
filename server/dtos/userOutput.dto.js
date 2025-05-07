function userToDto(user) {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    };
  }
  
  module.exports = { userToDto };