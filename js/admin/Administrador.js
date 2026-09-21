import { apiFetch } from "../api/api.js";

// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

const salirbtn =
    document.getElementById("salirbtn");

const opcionesAdmin =
    document.querySelectorAll(".opcion-admin");

const seccionesAdmin =
    document.querySelectorAll(".seccion-admin");


// =========================================================
// NAVEGACIÓN DEL PANEL
// =========================================================

opcionesAdmin.forEach((opcion) => {

    opcion.addEventListener("click", () => {

        const seccion =
            opcion.dataset.seccion;


        // Quitar estado activo de todas las opciones

        opcionesAdmin.forEach((item) => {
            item.classList.remove("activa");
        });


        // Activar opción seleccionada

        opcion.classList.add("activa");


        // Ocultar todas las secciones

        seccionesAdmin.forEach((seccionElemento) => {
            seccionElemento.classList.remove("activa");
        });


        // Construir el ID de la sección

        const primeraLetra =
            seccion.charAt(0).toUpperCase();

        const resto =
            seccion.slice(1);

        const idSeccion =
            `seccion${primeraLetra}${resto}`;


        // Mostrar sección seleccionada

        const seccionSeleccionada =
            document.getElementById(idSeccion);

        if (seccionSeleccionada) {
            seccionSeleccionada.classList.add("activa");
        }

    });

});


// =========================================================
// CERRAR SESIÓN
// =========================================================

if (salirbtn) {

    salirbtn.addEventListener(
        "click",
        async () => {

            try {

                await apiFetch(
                    "/auth/logout",
                    {
                        method: "POST"
                    }
                );

                window.location.href =
                    "../../index.html";

            } catch (error) {

                console.error(
                    "Error al cerrar sesión:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.message ||
                        "No fue posible cerrar la sesión."
                });
            }
        }
    );
}


// =========================================================
// VALIDAR ACCESO AL PANEL
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const usuario =
                await apiFetch("/api/perfil");

            // El backend nos devuelve el rol
            // del usuario autenticado.

            if (!usuario || usuario.rol !== "ADMIN") {

                window.location.href =
                    "../../index.html";

                return;
            }

        } catch (error) {

            window.location.href =
                "../auth/inicio-sesion.html";
        }
    }
);


// =========================================================
// RESTAURAR PÁGINA DESDE CACHE
// =========================================================

window.addEventListener(
    "pageshow",
    (event) => {

        if (event.persisted) {
            window.location.reload();
        }

    }
);