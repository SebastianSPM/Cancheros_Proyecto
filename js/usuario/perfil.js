import { apiFetch } from "../api/api.js";


window.addEventListener("pageshow", (event) => {

    if (event.persisted) {
        window.location.reload();
    }

});

document.addEventListener("DOMContentLoaded", async () => {

    // =========================================================
    // OBTENER USUARIO AUTENTICADO
    // =========================================================

    let usuario;

    try {

        // apiFetch envía automáticamente la cookie HttpOnly
        usuario = await apiFetch("/api/perfil");

    } catch (error) {

        console.error("Error al obtener el perfil:", error);

        Swal.fire({
            icon: "error",
            title: "Sesión no válida",
            text: "Debes iniciar sesión para acceder a tu perfil."
        }).then(() => {

            window.location.href = "../auth/inicio-sesion.html";

        });

        return;
    }


    // =========================================================
    // MOSTRAR FOTO DE PERFIL
    // =========================================================

    const avatar = document.querySelector(".avatar");

    if (usuario.fotoPerfil) {

        avatar.innerHTML = `
            <img src="${usuario.fotoPerfil}" alt="Foto de perfil">
        `;

    }


 // =========================================================
// MOSTRAR DATOS DEL USUARIO
// =========================================================

document.getElementById("nombreUsuario").textContent =
    usuario.nombre;

document.getElementById("apellidoUsuario").textContent =
    usuario.apellido;

document.getElementById("correoUsuario").textContent =
    usuario.email;

document.getElementById("telefonoUsuario").textContent =
    usuario.telefono;


// =========================================================
// HISTORIAL DE RESERVAS
// =========================================================

mostrarHistorialReservas(usuario);


// =========================================================
// DATOS PERSONALES
// =========================================================

const parametros =
    new URLSearchParams(window.location.search);

const editToken =
    parametros.get("editToken");

const botonEditarDatos =
    document.getElementById("editarDatos");

const botonCambiarCorreo =
    document.getElementById("cambiarCorreo");


// =========================================================
// EDITAR NOMBRE, APELLIDO Y TELÉFONO
// =========================================================

if (botonEditarDatos) {

    botonEditarDatos.addEventListener("click", async () => {

        // -----------------------------------------
        // Solicitar enlace de edición
        // -----------------------------------------

        if (!editToken) {

            try {

                await apiFetch(
                    "/auth/solicitar-edicion-perfil",
                    {
                        method: "POST"
                    }
                );

                await Swal.fire({
                    icon: "info",
                    title: "Valida tu correo",
                    text:
                        "Hemos enviado un enlace a tu correo " +
                        "para poder editar tus datos."
                });

            } catch (error) {

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message
                });

            }

            return;
        }


        // -----------------------------------------
        // Formulario de edición
        // -----------------------------------------

        const resultado = await Swal.fire({

            title: "Editar datos personales",

            html: `
                <input
                    type="text"
                    id="nuevoNombre"
                    class="swal2-input"
                    placeholder="Nombre"
                    value="${usuario.nombre}"
                >

                <input
                    type="text"
                    id="nuevoApellido"
                    class="swal2-input"
                    placeholder="Apellido"
                    value="${usuario.apellido}"
                >

                <input
                    type="tel"
                    id="nuevoTelefono"
                    class="swal2-input"
                    placeholder="Número de contacto"
                    value="${usuario.telefono}"
                >
            `,

            showCancelButton: true,

            confirmButtonText: "Guardar cambios",

            cancelButtonText: "Cancelar",

            focusConfirm: false,

            preConfirm: () => {

                const nombre =
                    document
                        .getElementById("nuevoNombre")
                        .value
                        .trim();

                const apellido =
                    document
                        .getElementById("nuevoApellido")
                        .value
                        .trim();

                const telefono =
                    document
                        .getElementById("nuevoTelefono")
                        .value
                        .trim();


                if (!nombre || !apellido || !telefono) {

                    Swal.showValidationMessage(
                        "Completa todos los campos."
                    );

                    return false;
                }


                return {
                    nombre,
                    apellido,
                    telefono
                };
            }

        });


        // -----------------------------------------
        // Si canceló
        // -----------------------------------------

        if (!resultado.isConfirmed) {
            return;
        }


        const nuevosDatos =
            resultado.value;


        // -----------------------------------------
        // Actualizar en backend
        // -----------------------------------------

        try {

            const usuarioActualizado =
                await apiFetch(
                    "/api/perfil",
                    {
                        method: "PUT",

                        body: JSON.stringify({
                            nombre:
                                nuevosDatos.nombre,

                            apellido:
                                nuevosDatos.apellido,

                            telefono:
                                nuevosDatos.telefono,

                            token:
                                editToken
                        })
                    }
                );


            // Actualizar usuario en memoria

            usuario =
                usuarioActualizado;


            // Actualizar información visible

            document.getElementById(
                "nombreUsuario"
            ).textContent =
                usuario.nombre;

            document.getElementById(
                "apellidoUsuario"
            ).textContent =
                usuario.apellido;

            document.getElementById(
                "telefonoUsuario"
            ).textContent =
                usuario.telefono;


            await Swal.fire({
                icon: "success",
                title: "Datos actualizados",
                text:
                    "Tus datos personales fueron " +
                    "actualizados correctamente."
            });


            // El token ya fue utilizado.
            // Lo quitamos de la URL.

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );


        } catch (error) {

            console.error(
                "Error al editar perfil:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "No se pudieron actualizar los datos",
                text: error.message
            });
        }

    });

}


// =========================================================
// CAMBIAR CORREO
// =========================================================

if (botonCambiarCorreo) {

    botonCambiarCorreo.addEventListener(
        "click",
        async () => {

            // ==========================================
            // PASO 1: PEDIR NUEVO CORREO
            // ==========================================

            const resultadoCorreo = await Swal.fire({

                title: "Cambiar correo",

                html: `
                    <p>
                        Correo actual:
                        <strong>${usuario.email}</strong>
                    </p>

                    <input
                        type="email"
                        id="nuevoCorreo"
                        class="swal2-input"
                        placeholder="Nuevo correo"
                    >
                `,

                showCancelButton: true,

                confirmButtonText: "Enviar código",

                cancelButtonText: "Cancelar",

                focusConfirm: false,

                preConfirm: () => {

                    const nuevoCorreo =
                        document
                            .getElementById("nuevoCorreo")
                            .value
                            .trim();

                    if (!nuevoCorreo) {

                        Swal.showValidationMessage(
                            "Ingresa el nuevo correo."
                        );

                        return false;
                    }


                    const correoRegex =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                    if (!correoRegex.test(nuevoCorreo)) {

                        Swal.showValidationMessage(
                            "Ingresa un correo válido."
                        );

                        return false;
                    }


                    if (
                        nuevoCorreo.toLowerCase() ===
                        usuario.email.toLowerCase()
                    ) {

                        Swal.showValidationMessage(
                            "El nuevo correo debe ser diferente al actual."
                        );

                        return false;
                    }


                    return nuevoCorreo;
                }

            });


            if (!resultadoCorreo.isConfirmed) {
                return;
            }


            const nuevoCorreo =
                resultadoCorreo.value;


            // ==========================================
            // PASO 2: ENVIAR CÓDIGO
            // ==========================================

            try {

                await apiFetch(
                    "/api/perfil/cambiar-correo/solicitar",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            nuevoCorreo
                        })
                    }
                );


            } catch (error) {

                Swal.fire({
                    icon: "error",
                    title: "No se pudo enviar el código",
                    text: error.message
                });

                return;
            }


            // ==========================================
            // PASO 3: PEDIR CÓDIGO
            // ==========================================

            const resultadoCodigo = await Swal.fire({

                title: "Verificar nuevo correo",

                html: `
                    <p>
                        Hemos enviado un código de 6 dígitos a:
                    </p>

                    <strong>${nuevoCorreo}</strong>

                    <input
                        type="text"
                        id="codigoCorreo"
                        class="swal2-input"
                        placeholder="Código de verificación"
                        maxlength="6"
                    >
                `,

                showCancelButton: true,

                confirmButtonText: "Verificar",

                cancelButtonText: "Cancelar",

                focusConfirm: false,

                preConfirm: () => {

                    const codigo =
                        document
                            .getElementById("codigoCorreo")
                            .value
                            .trim();


                    if (!codigo) {

                        Swal.showValidationMessage(
                            "Ingresa el código."
                        );

                        return false;
                    }


                    if (!/^\d{6}$/.test(codigo)) {

                        Swal.showValidationMessage(
                            "El código debe tener 6 dígitos."
                        );

                        return false;
                    }


                    return codigo;
                }

            });


            if (!resultadoCodigo.isConfirmed) {
                return;
            }


            const codigo =
                resultadoCodigo.value;


            // ==========================================
            // PASO 4: VERIFICAR Y CAMBIAR CORREO
            // ==========================================

            try {

                const usuarioActualizado =
                    await apiFetch(
                        "/api/perfil/cambiar-correo/verificar",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                nuevoCorreo,
                                codigo
                            })
                        }
                    );


                usuario =
                    usuarioActualizado;


                document.getElementById(
                    "correoUsuario"
                ).textContent =
                    usuario.email;


                await Swal.fire({

                    icon: "success",

                    title: "Correo actualizado",

                    text:
                        "Tu correo electrónico se cambió correctamente."

                });


            } catch (error) {

                Swal.fire({

                    icon: "error",

                    title: "No se pudo cambiar el correo",

                    text:
                        error.message ||
                        "El código no es válido."

                });

            }

        }
    );

}


    // =========================================================
    // EDITAR FOTO
    // =========================================================

    const botonEditarFoto =
        document.getElementById("editarFoto");

    const inputFoto =
        document.getElementById("inputFoto");


    if (botonEditarFoto && inputFoto) {

        botonEditarFoto.addEventListener("click", () => {

            inputFoto.click();

        });


        inputFoto.addEventListener("change", () => {

            const archivo = inputFoto.files[0];


            if (!archivo) {
                return;
            }


            if (!archivo.type.startsWith("image/")) {

                Swal.fire({

                    icon: "error",

                    title: "Archivo no válido",

                    text: "Por favor selecciona una imagen."

                });

                return;
            }


            const lector = new FileReader();


            lector.onload = () => {

                const imagen = lector.result;


                avatar.innerHTML = `
                    <img src="${imagen}" alt="Foto de perfil">
                `;


                usuario.fotoPerfil = imagen;


                Swal.fire({

                    icon: "success",

                    title: "¡Foto actualizada!",

                    text:
                        "Tu foto de perfil se actualizó visualmente. " +
                        "La conexión con el backend está pendiente."

                });

            };


            lector.readAsDataURL(archivo);

        });

    }


// =========================================================
// CAMBIAR CONTRASEÑA
// =========================================================

const botonCambiarPassword =
    document.getElementById("cambiarPassword");

if (botonCambiarPassword) {

    botonCambiarPassword.addEventListener("click", async () => {

        const resultado = await Swal.fire({
            icon: "question",
            title: "Cambiar contraseña",
            text:
                "Te enviaremos un enlace de validación a tu correo electrónico para que puedas crear una nueva contraseña.",
            showCancelButton: true,
            confirmButtonText: "Enviar enlace",
            cancelButtonText: "Cancelar"
        });

        if (!resultado.isConfirmed) {
            return;
        }

        try {

            await apiFetch(
                "/auth/solicitar-cambio-password",
                {
                    method: "POST"
                }
            );

            await Swal.fire({
                icon: "success",
                title: "¡Correo enviado!",
                text:
                    "Hemos enviado un enlace de validación a tu correo electrónico. Revisa tu bandeja de entrada para continuar."
            });

        } catch (error) {

            console.error(
                "Error al solicitar cambio de contraseña:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "No se pudo enviar el enlace",
                text:
                    error.message ||
                    "Ocurrió un error al solicitar el cambio de contraseña."
            });
        }
    });
}


    // =========================================================
    // CERRAR SESIÓN
    // =========================================================

    const botonCerrarSesion =
        document.getElementById("cerrarSesion");


    if (botonCerrarSesion) {

        botonCerrarSesion.addEventListener("click", async () => {

            try {

                // Le pedimos al backend eliminar la cookie.

                await apiFetch("/auth/logout", {

                    method: "POST"

                });


                // Volvemos al index.

                window.location.href = "../../index.html";


            } catch (error) {

                console.error(
                    "Error al cerrar sesión:",
                    error
                );


                Swal.fire({

                    icon: "error",

                    title: "Error",

                    text:
                        "No fue posible cerrar la sesión."

                });

            }

        });

    }

});


// =========================================================
// HISTORIAL DE RESERVAS
// =========================================================

const mostrarHistorialReservas = (usuario) => {

    if (!usuario) {
        return;
    }


    const reservas =
        JSON.parse(
            localStorage.getItem("reservas")
        ) || [];


    const historial =
        document.getElementById("historialReservas");


    if (!historial) {
        return;
    }


    const misReservas =
        reservas.filter(
            reserva =>
                reserva.email === usuario.email
        );


    historial.innerHTML = "";


    if (misReservas.length === 0) {

        historial.innerHTML = `
            <tr>
                <td colspan="5">
                    No tienes reservas registradas.
                </td>
            </tr>
        `;

        return;
    }


    misReservas.forEach(reserva => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `
            <td>${reserva.fecha}</td>

            <td>${reserva.hora}</td>

            <td>${reserva.nombreCancha}</td>

            <td>
                $${Number(reserva.total).toLocaleString("es-CO")}
            </td>

            <td>
                <span class="estado-reserva">
                    Confirmada
                </span>
            </td>
        `;


        historial.appendChild(fila);

    });

};
