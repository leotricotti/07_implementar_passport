//Cerrar sesión
const logout = async () => {
  const response = await fetch("/api/session/logout", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response) {
    Swal.fire({
      icon: "success",
      title: "Gracias por utilizar nuestros servicios",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      window.location.href = "/";
      localStorage.removeItem("cartId");
      localStorage.removeItem("currentPage");
    });
  }
  return response;
};
