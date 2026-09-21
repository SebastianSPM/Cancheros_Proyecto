import { apiFetch } from "../api/api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-verificacion");
    const codigoInput = document.getElementById("codigo");
    const email = sessionStorage.getItem("pendingVerificationEmail");

    // Verificar que exista un correo pendiente de verificación
    if (!email) {
        Swal.fire({
            icon: "error",
            title: "No hay un registro pendiente",
            text: "No encontramos un correo pendiente de verificación."
        }).then(() => {
            window.location.href = "registro.html";
        });
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const codigo = codigoInput.value.trim();

        if (!codigo) {
            Swal.fire({
                icon: "error",
                title: "Código requerido",
                text: "Ingresa el código de verificación."
            });
            return;
        }
        try {

            await apiFetch("/auth/verificar-correo", {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    codigo: codigo
                })
            });

            sessionStorage.removeItem("pendingVerificationEmail");
            await Swal.fire({
                icon: "success",
                title: "¡Correo verificado!",
                text: "Tu correo fue verificado correctamente."
            });
            window.location.href = "inicio-sesion.html";
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "No se pudo verificar",
                text: error.message || "El código no es válido."
            });
        }
    });
});