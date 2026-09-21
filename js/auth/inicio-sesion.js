import { apiFetch } from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember");
  const toggleBtn = document.querySelector(".toggle-password");
  const iconEye = toggleBtn?.querySelector(".icon-eye");
  const iconEyeOff = toggleBtn?.querySelector(".icon-eye-off");

  // Ojito de mostrar contraseña
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      if (isPassword) {
        iconEye.style.display = "none";
        iconEyeOff.style.display = "block";
        toggleBtn.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        iconEye.style.display = "block";
        iconEyeOff.style.display = "none";
        toggleBtn.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  }

  // Recordarme
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
  }

  //Inicio de sesion
  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const botonSubmit =
        loginForm.querySelector('button[type="submit"]');


    // =====================================================
    // OBTENER DATOS
    // =====================================================

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();


    // =====================================================
    // VALIDAR CAMPOS
    // =====================================================

    if (!email || !password) {

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
                "Por favor completa todos los campos.",
        });

        return;
    }


    // =====================================================
    // VALIDAR CORREO
    // =====================================================

    if (!email.includes("@")) {

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text:
                "Por favor ingresa un correo electrónico válido.",
        });

        return;
    }


    // =====================================================
    // BLOQUEAR BOTÓN
    // =====================================================

    if (botonSubmit) {
        botonSubmit.disabled = true;
    }


    // =====================================================
    // INICIAR SESIÓN
    // =====================================================

    try {

        const respuesta =
            await apiFetch("/auth/login", {

                method: "POST",

                body: JSON.stringify({

                    email: email,

                    password: password

                })

            });


        // =================================================
        // RECORDAR CORREO
        // =================================================

        if (rememberCheckbox.checked) {

            localStorage.setItem(
                "rememberedEmail",
                email
            );

        } else {

            localStorage.removeItem(
                "rememberedEmail"
            );
        }


        localStorage.setItem(
            "currentUser",
            JSON.stringify(respuesta)
        );


        // =================================================
        // LOGIN EXITOSO
        // =================================================

        Swal.fire({

            icon: "success",

            title: "¡Qué bien!",

            text:
                "¡Inicio de sesión exitoso!",

        }).then(() => {
            console.log(respuesta);
            

            // ADMIN
            if (respuesta.rol === "ADMIN") {
                window.location.href = "../admin/panel-administrador.html";
            }
            // CLIENTE
            else {
                window.location.href = "../../index.html";
            }

        });


    } catch (error) {

        Swal.fire({

            icon: "error",

            title: "Oops...",

            text:
                error.message ||
                "Correo electrónico o contraseña incorrectos.",

        });


    } finally {

        setTimeout(() => {

            if (botonSubmit) {
                botonSubmit.disabled = false;
            }

        }, 3000);
    }

  });
});