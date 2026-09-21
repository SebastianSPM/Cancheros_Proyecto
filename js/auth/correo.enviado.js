import { apiFetch } from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {

    const emailDisplay = document.getElementById("email-display");
    const resendButton = document.querySelector(".btn-primary");

    const email = sessionStorage.getItem("recoveryEmail");

    if (!email) {
        Swal.fire({
            icon: "error",
            title: "No hay una recuperación pendiente",
            text: "No encontramos un correo pendiente de recuperación."
        }).then(() => {
            window.location.href = "recuperar-password.html";
        });

        return;
    }

    emailDisplay.textContent = email;

    resendButton.addEventListener("click", async () => {

        resendButton.disabled = true;

        try {

            await apiFetch("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({
                    email: email
                })
            });

            await Swal.fire({
                icon: "success",
                title: "¡Enlace reenviado!",
                text: "Hemos enviado nuevamente el enlace de recuperación a tu correo."
            });

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "No se pudo reenviar",
                text: error.message ||
                    "Ocurrió un error al reenviar el enlace."
            });

        } finally {
            resendButton.disabled = false;
        }
    });
});