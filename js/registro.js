document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const emailInput = document.getElementById("email");
  const telefonoInput = document.getElementById("telefono");
  const passwordInput = document.getElementById("password");
  const password2Input = document.getElementById("password2");
  const terminosInput = document.getElementById("terminos");
  const btnSubmit = document.querySelector(".btn-primary");

  // Regex para validación
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  btnSubmit.addEventListener("click", (e) => {
    e.preventDefault();

    // Obtener valores quitando espacios
    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const email = emailInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const password = passwordInput.value;
    const password2 = password2Input.value;
    const terminos = terminosInput.checked;

    // Validar campos vacíos
    if (!nombre || !apellido || !email || !telefono || !password || !password2) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, completa todos los campos del formulario.",
      });
      return;
    }

    // Validar formato de correo
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Ingresa un correo electrónico válido (ej. usuario@dominio.com).",
      });
      return;
    }

    // Validar formato de contraseña
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.",
      });
      return;
    }

    // Confirmar contraseñas
    if (password !== password2) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    // Validar términos
    if (!terminos) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Debes aceptar los términos y condiciones para registrarte.",
      });
      return;
    }

    // Persistencia en localStorage
    // Obtener lista previa de usuarios o inicializar arreglo vacío
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verificar si el correo ya existe
    const existeUsuario = usuarios.some(user => user.email === email);
    if (existeUsuario) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El correo electrónico ya se encuentra registrado.",
      });
      return;
    }

    // Estructurar el nuevo usuario
    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      apellido,
      email,
      telefono,
      password // Nota: Dylan usará este campo para validar el login
    };

    // Guardar en el arreglo y actualizar localStorage
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    Swal.fire({
        icon: "good",
        title: "¡Que bien!",
        text: "¡Registro exitoso! Redirigiendo a inicio de sesión...",
      });
    
    // Limpiar formulario y redirigir
    form.reset();
    window.location.href = "inicio-sesion.html";
  });

  // Mostrar/ocultar contraseña
  const toggles = document.querySelectorAll(".toggle-password");
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const eyeIcon = btn.querySelector(".icon-eye");
      const eyeOffIcon = btn.querySelector(".icon-eye-off");

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      eyeIcon.style.display = isPassword ? "none" : "block";
      eyeOffIcon.style.display = isPassword ? "block" : "none";

      btn.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });
});