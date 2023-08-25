import { dirname } from "path";
import { fileURLToPath } from "url";
import { hashSync, genSaltSync, compareSync } from "bcrypt";

//Ruta absoluta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Encriptar contraseña
export const hashPassword = (password) => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

//Validar contraseña
export const comparePassword = (password, passwordHash) => {
  return compareSync(password, passwordHash);
};

export default __dirname;
