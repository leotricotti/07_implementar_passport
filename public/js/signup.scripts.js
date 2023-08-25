// Dirije a la página de login
const moveToLogin = () => {
  window.location.href = "/";
};

// Dirije a recuperar contraseña
const moveToForgot = () => {
  window.location.href = "/forgot";
};

// Función para crear un usuario
async function postSignup(first_name, last_name, age, username, password) {
  const data = {
    first_name,
    last_name,
    age,
    email: username,
    password,
  };

  const response = await fetch("/api/session/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result;
}

// Escucha el evento submit del formulario de registro
const signupForm = document.getElementById("signup-form");

// Captura los datos del formulario de registro
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const age = document.getElementById("age").value;

  // Envía los datos del formulario de registro y crea un usuario
  postSignup(first_name, last_name, age, username, password).then((datos) => {
    if (datos.length > 0) {
      Swal.fire({
        icon: "success",
        title: "Usuario creado correctamente",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        moveToLogin();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal! Vuelve a intentarlo luego",
      });
    }
  });
});
