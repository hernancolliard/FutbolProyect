const validateNewPassword = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    return "La nueva contraseña debe tener al menos 8 caracteres.";
  }

  // bcrypt solo procesa de forma segura los primeros 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "La nueva contraseña no puede superar los 72 bytes.";
  }

  return null;
};

module.exports = { validateNewPassword };
