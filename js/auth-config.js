/* AX // auth-config.js
   El workflow de GitHub rellena HASH y borra PLAIN automáticamente.
   Mientras HASH esté vacío, el login funciona con PLAIN (modo local). */
window.AX_AUTH = {
  HASH: "",
  PLAIN: "AX2026",
  SALT: "AX::v1",
  SESSION_MIN: 120,
  MAX_ATTEMPTS: 5,
  LOCK_SECONDS: 20
};