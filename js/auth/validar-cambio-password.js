import { apiFetch } from "../api/api.js";

document.addEventListener("DOMContentLoaded", async () => {

    // =========================================================
    // OBTENER TOKEN DE LA URL
    // =========================================================

    const parametros =
        new URLSearchParams(window.location.search);

    const token = parametros.get("token");


    // =========================================================
    // VALIDAR QUE EXISTA TOKEN
    // =========================================================

    if (!token) {

        await Swal.fire({
            icon: "error",
            title: "Enlace inválido",
            text:
                "No encontramos un enlace de validación válido."
        });

        window.location.href = "inicio-sesion.html";

        return;
    }


    // =========================================================
    // VALIDAR TOKEN EN BACKEND
    // =========================================================

    try {

        await apiFetch(
            `/auth/validar-cambio-password?token=${encodeURIComponent(token)}`
        );


        // =====================================================
        // TOKEN VÁLIDO
        // =====================================================

        await Swal.fire({
            icon: "success",
            title: "¡Enlace validado!",
            text:
                "Ahora puedes crear tu nueva contraseña.",
            timer: 1800,
            showConfirmButton: false
        });


        // =====================================================
        // IR A NUEVA CONTRASEÑA
        // =====================================================

        window.location.href =
            `nueva-password.html?token=${encodeURIComponent(token)}`;


    } catch (error) {

        console.error(
            "Error al validar el cambio de contraseña:",
            error
        );


        // =====================================================
        // TOKEN INVÁLIDO O EXPIRADO
        // =====================================================

        await Swal.fire({
            icon: "error",
            title: "Enlace inválido",
            text:
                error.message ||
                "El enlace puede haber expirado o ya haber sido utilizado."
        });


        window.location.href =
            "inicio-sesion.html";
    }
});