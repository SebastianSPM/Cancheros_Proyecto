import { apiFetch } from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            Swal.fire({
                icon: "error",
                title: "Correo requerido",
                text: "Ingresa tu correo electrónico."
            });
            return;
        }

        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: "error",
                title: "Correo inválido",
                text: "Ingresa un correo electrónico válido."
            });
            return;
        }

        try {

            await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({
                    email: email
                })
            });

            sessionStorage.setItem("recoveryEmail", email);

            await Swal.fire({
                icon: "success",
                title: "¡Correo enviado!",
                text: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
            });

            window.location.href = "correo-enviado.html";

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "No se pudo enviar el enlace",
                text: error.message ||
                    "Ocurrió un error al procesar la solicitud."
            });
        }
    });
});