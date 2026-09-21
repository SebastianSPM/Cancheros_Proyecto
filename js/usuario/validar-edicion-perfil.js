import { apiFetch } from "../api/api.js";

const titulo = document.getElementById("titulo");
const mensaje = document.getElementById("mensaje");
const continuar = document.getElementById("continuar");

const parametros = new URLSearchParams(window.location.search);
const token = parametros.get("token");

async function validarToken() {

    if (!token) {
        titulo.textContent = "Enlace inválido";
        mensaje.textContent =
            "No se encontró el token de validación.";
        return;
    }

    try {

        await apiFetch(
            `/auth/validar-edicion-perfil?token=${encodeURIComponent(token)}`
        );

        titulo.textContent = "Correo validado correctamente";

        mensaje.textContent =
            "Tu correo ha sido validado. Ya puedes continuar con la edición de tu perfil.";

        continuar.href = `./perfil.html?editToken=${encodeURIComponent(token)}`;
        continuar.style.display = "inline-block";

    } catch (error) {

        titulo.textContent = "No se pudo validar el enlace";

        mensaje.textContent = error.message;
    }
}

validarToken();