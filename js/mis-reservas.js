
import { apiFetch } from "./api.js";


// =====================================================
// OBTENER USUARIO ACTUAL
// =====================================================

const obtenerUsuarioActual = () => {

    try {

        return JSON.parse(
            localStorage.getItem("currentUser")
        );

    } catch (error) {

        console.error(
            "Error obteniendo usuario:",
            error
        );

        return null;
    }
};


// =====================================================
// ELEMENTOS HTML
// =====================================================

const listaReservas =
    document.getElementById("listaReservas");

const sinReservas =
    document.getElementById("sinReservas");


// =====================================================
// MODAL
// =====================================================

const modalElement =
    document.getElementById("modalEditarReserva");

let modalEditar = null;

if (modalElement) {

    modalEditar =
        new bootstrap.Modal(modalElement);
}


// =====================================================
// CAMPOS DEL MODAL
// =====================================================

const editarCancha =
    document.getElementById("editarCancha");

const editarFecha =
    document.getElementById("editarFecha");

const editarHora =
    document.getElementById("editarHora");

const editarPrecio =
    document.getElementById("editarPrecio");

const horariosDisponibles =
    document.getElementById("horariosDisponibles");

const guardarCambios =
    document.getElementById("guardarCambios");


// =====================================================
// RESERVA SELECCIONADA
// =====================================================

let reservaSeleccionada = null;


// =====================================================
// OBTENER FECHA ACTUAL
// =====================================================

const obtenerFechaHoy = () => {

    const ahora = new Date();

    const año =
        ahora.getFullYear();

    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            ahora.getDate()
        ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
};


// =====================================================
// CONVERTIR FECHA + HORA
// =====================================================

const convertirFechaHora = (
    fecha,
    hora
) => {

    return new Date(
        `${fecha}T${hora}`
    );

};


// =====================================================
// FORMATEAR FECHA
// =====================================================

const formatearFecha = (
    fecha
) => {

    if (!fecha) {
        return "";
    }

    const [
        año,
        mes,
        dia
    ] = fecha.split("-");

    return `${dia}/${mes}/${año}`;
};


// =====================================================
// FORMATEAR HORA
// =====================================================

const formatearHora = (
    hora
) => {

    if (!hora) {
        return "";
    }

    return hora.substring(0, 5);
};


// =====================================================
// FORMATEAR PRECIO
// =====================================================

const formatearPrecio = (
    precio
) => {

    return Number(
        precio || 0
    ).toLocaleString("es-CO");

};


// =====================================================
// OBTENER MIS RESERVAS DESDE EL BACKEND
// =====================================================

const obtenerMisReservas = async () => {

    const usuario =
        obtenerUsuarioActual();


    if (!usuario || !usuario.id) {

        window.location.href =
            "./inicio-sesion.html";

        return [];

    }


    try {

        const reservas =
            await apiFetch(
                `/api/reservas/mis-reservas?usuarioId=${usuario.id}`
            );


        console.log(
            "Mis reservas:",
            reservas
        );


        return reservas || [];


    } catch (error) {

        console.error(
            "Error obteniendo reservas:",
            error
        );


        Swal.fire({
            icon: "error",
            title: "Error",
            text:
                error.message ||
                "No se pudieron cargar tus reservas."
        });


        return [];

    }

};


// =====================================================
// OBTENER RESERVAS FUTURAS
// =====================================================

const obtenerReservasFuturas = (
    reservas
) => {

    const ahora =
        new Date();


    return reservas.filter(
        reserva => {

            // -----------------------------------------
            // CANCELADAS NO SE MUESTRAN
            // -----------------------------------------

            if (
                reserva.estado ===
                "CANCELADA"
            ) {

                return false;

            }


            // -----------------------------------------
            // FECHA + HORA
            // -----------------------------------------

            const fechaHoraReserva =
                convertirFechaHora(
                    reserva.fecha,
                    reserva.horaInicio
                );


            return (
                fechaHoraReserva >
                ahora
            );

        }
    );

};


// =====================================================
// MOSTRAR RESERVAS
// =====================================================

const mostrarReservas = async () => {

    listaReservas.innerHTML = "";


    // Mostrar cargando

    sinReservas.style.display =
        "none";


    listaReservas.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Cargando reservas...
            </td>
        </tr>
    `;


    // -----------------------------------------------
    // OBTENER DESDE BACKEND
    // -----------------------------------------------

    const reservas =
        await obtenerMisReservas();


    const reservasFuturas =
        obtenerReservasFuturas(
            reservas
        );


    listaReservas.innerHTML = "";


    // =================================================
    // NO HAY RESERVAS
    // =================================================

    if (
        reservasFuturas.length === 0
    ) {

        sinReservas.style.display =
            "block";

        return;

    }


    sinReservas.style.display =
        "none";


    // =================================================
    // CREAR FILAS
    // =================================================

    reservasFuturas.forEach(
        reserva => {

            const fila =
                document.createElement("tr");


            fila.innerHTML = `

                <td>
                    ${reserva.nombreCancha}
                </td>

                <td>
                    ${formatearFecha(
                        reserva.fecha
                    )}
                </td>

                <td>
                    ${formatearHora(
                        reserva.horaInicio
                    )}
                    -
                    ${formatearHora(
                        reserva.horaFin
                    )}
                </td>

                <td>
                    $${formatearPrecio(
                        reserva.total
                    )}
                </td>

                <td>

                    <span class="badge ${
                        reserva.estado === "CONFIRMADA"
                            ? "bg-success"
                            : "bg-secondary"
                    }">

                        ${reserva.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-warning btn-sm btn-editar"
                        data-id="${reserva.id}"
                    >

                        <i class="bi bi-pencil-fill"></i>

                        Editar

                    </button>


                    <button
                        class="btn btn-danger btn-sm btn-cancelar"
                        data-id="${reserva.id}"
                    >

                        <i class="bi bi-trash-fill"></i>

                        Cancelar

                    </button>

                </td>

            `;


            listaReservas.appendChild(
                fila
            );

        }
    );


    // =================================================
    // BOTONES EDITAR
    // =================================================

    document
        .querySelectorAll(".btn-editar")
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        abrirEditar(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );


    // =================================================
    // BOTONES CANCELAR
    // =================================================

    document
        .querySelectorAll(".btn-cancelar")
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        cancelarReserva(
                            Number(
                                boton.dataset.id
                            )
                        );

                    }
                );

            }
        );

};


// =====================================================
// OBTENER DETALLE DE RESERVA
// =====================================================

const obtenerDetalleReserva = async (
    reservaId
) => {

    const usuario =
        obtenerUsuarioActual();


    if (!usuario || !usuario.id) {

        return null;

    }


    try {

        return await apiFetch(
            `/api/reservas/${reservaId}?usuarioId=${usuario.id}`
        );

    } catch (error) {

        console.error(
            "Error obteniendo detalle:",
            error
        );


        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });


        return null;

    }

};


// =====================================================
// MOSTRAR HORARIOS DISPONIBLES
// =====================================================

const mostrarHorariosDisponibles = async (
    fecha
) => {

    horariosDisponibles.innerHTML = "";

    editarHora.value = "";


    // -----------------------------------------------
    // VALIDAR
    // -----------------------------------------------

    if (!fecha) {

        horariosDisponibles.innerHTML = `
            <span class="text-muted">
                Selecciona una fecha.
            </span>
        `;

        return;

    }


    if (!reservaSeleccionada) {

        return;

    }


    try {

        // =============================================
        // CONSULTAR BACKEND
        // =============================================

        const horarios =
            await apiFetch(
                `/api/reservas/disponibilidad?canchaId=${reservaSeleccionada.canchaId}&fecha=${fecha}`
            );


        console.log(
            "Disponibilidad para editar:",
            horarios
        );


        // =============================================
        // DURACIÓN DE LA RESERVA
        // =============================================

        const duracion =
            Number(
                reservaSeleccionada.duracion
            );


        let cantidadDisponibles = 0;


        // =============================================
        // EVALUAR HORARIOS
        // =============================================

        horarios.forEach(
            (horario, index) => {

                const horaInicio =
                    formatearHora(
                        horario.horaInicio
                    );


                const horaFin =
                    formatearHora(
                        horario.horaFin
                    );


                // -----------------------------------------
                // COMPROBAR BLOQUES CONTINUOS
                // -----------------------------------------

                let bloquesDisponibles =
                    horario.disponible;


                if (
                    duracion > 1
                ) {

                    for (
                        let i = 1;
                        i < duracion;
                        i++
                    ) {

                        const siguiente =
                            horarios[index + i];


                        if (
                            !siguiente ||
                            !siguiente.disponible
                        ) {

                            bloquesDisponibles =
                                false;

                            break;

                        }

                    }

                }


                // -----------------------------------------
                // CREAR BOTÓN
                // -----------------------------------------

                if (
                    !bloquesDisponibles
                ) {

                    return;

                }


                const boton =
                    document.createElement(
                        "button"
                    );


                boton.type =
                    "button";


                boton.className =
                    "btn btn-outline-success";


                boton.textContent =
                    horaInicio;


                boton.dataset.hora =
                    horaInicio;


                // -----------------------------------------
                // SELECCIONAR
                // -----------------------------------------

                boton.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                "#horariosDisponibles button"
                            )
                            .forEach(
                                btn => {

                                    btn.classList.remove(
                                        "btn-success"
                                    );

                                    btn.classList.add(
                                        "btn-outline-success"
                                    );

                                }
                            );


                        boton.classList.remove(
                            "btn-outline-success"
                        );


                        boton.classList.add(
                            "btn-success"
                        );


                        editarHora.value =
                            boton.dataset.hora;

                    }
                );


                horariosDisponibles.appendChild(
                    boton
                );


                cantidadDisponibles++;

            }
        );


        // =============================================
        // SIN HORARIOS
        // =============================================

        if (
            cantidadDisponibles === 0
        ) {

            horariosDisponibles.innerHTML = `
                <div class="alert alert-warning mb-0">
                    <i class="bi bi-exclamation-triangle"></i>
                    No hay horarios disponibles para esta fecha.
                </div>
            `;

        }


    } catch (error) {

        console.error(
            "Error consultando disponibilidad:",
            error
        );


        horariosDisponibles.innerHTML = `
            <div class="alert alert-danger mb-0">
                No se pudieron cargar los horarios.
            </div>
        `;


        Swal.fire({
            icon: "error",
            title: "Error de disponibilidad",
            text: error.message
        });

    }

};


// =====================================================
// ABRIR EDITAR
// =====================================================

const abrirEditar = async (
    id
) => {

    // ================================================
    // OBTENER RESERVA REAL DEL BACKEND
    // ================================================

    const reserva =
        await obtenerDetalleReserva(
            id
        );


    if (!reserva) {

        return;

    }


    // ================================================
    // COMPROBAR ESTADO
    // ================================================

    if (
        reserva.estado ===
        "CANCELADA"
    ) {

        Swal.fire({
            icon: "warning",
            title: "Reserva cancelada",
            text:
                "No puedes modificar una reserva cancelada."
        });

        return;

    }


    // ================================================
    // COMPROBAR FECHA/HORA
    // ================================================

    const fechaHoraReserva =
        convertirFechaHora(
            reserva.fecha,
            reserva.horaInicio
        );


    if (
        fechaHoraReserva <=
        new Date()
    ) {

        Swal.fire({
            icon: "warning",
            title: "Reserva no disponible",
            text:
                "La fecha y hora de esta reserva ya pasaron."
        });

        return;

    }


    // ================================================
    // GUARDAR RESERVA
    // ================================================

    reservaSeleccionada =
        reserva;


    // ================================================
    // CANCHA
    // ================================================

    editarCancha.value =
        reserva.nombreCancha;


    // ================================================
    // FECHA
    // ================================================

    editarFecha.value =
        reserva.fecha;


    editarFecha.min =
        obtenerFechaHoy();


    // ================================================
    // PRECIO
    // ================================================

    editarPrecio.value =
        `$${formatearPrecio(
            reserva.total
        )}`;


    // ================================================
    // HORARIOS
    // ================================================

    await mostrarHorariosDisponibles(
        reserva.fecha
    );


    // ================================================
    // SELECCIONAR HORA ACTUAL
    // ================================================

    const botones =
        document.querySelectorAll(
            "#horariosDisponibles button"
        );


    botones.forEach(
        boton => {

            if (
                boton.dataset.hora ===
                formatearHora(
                    reserva.horaInicio
                )
            ) {

                boton.classList.remove(
                    "btn-outline-success"
                );

                boton.classList.add(
                    "btn-success"
                );

                editarHora.value =
                    boton.dataset.hora;

            }

        }
    );


    // ================================================
    // MOSTRAR MODAL
    // ================================================

    modalEditar.show();

};


// =====================================================
// CAMBIAR FECHA EN MODAL
// =====================================================

if (editarFecha) {

    editarFecha.addEventListener(
        "change",
        async () => {

            await mostrarHorariosDisponibles(
                editarFecha.value
            );

        }
    );

}


// =====================================================
// GUARDAR CAMBIOS
// =====================================================

if (guardarCambios) {

    guardarCambios.addEventListener(
        "click",
        async () => {

            if (
                !reservaSeleccionada
            ) {

                return;

            }


            const usuario =
                obtenerUsuarioActual();


            if (
                !usuario ||
                !usuario.id
            ) {

                return;

            }


            // =========================================
            // DATOS
            // =========================================

            const nuevaFecha =
                editarFecha.value;


            const nuevaHora =
                editarHora.value;


            const duracion =
                Number(
                    reservaSeleccionada.duracion
                );


            // =========================================
            // VALIDAR
            // =========================================

            if (
                !nuevaFecha ||
                !nuevaHora
            ) {

                Swal.fire({
                    icon: "warning",
                    title: "Datos incompletos",
                    text:
                        "Selecciona una fecha y un horario disponible."
                });

                return;

            }


            // =========================================
            // REQUEST
            // =========================================

            const request = {

                canchaId:
                    Number(
                        reservaSeleccionada.canchaId
                    ),

                fecha:
                    nuevaFecha,

                horaInicio:
                    nuevaHora.length === 5
                        ? `${nuevaHora}:00`
                        : nuevaHora,

                duracion:
                    duracion

            };


            console.log(
                "Actualizando reserva:",
                request
            );


            // =========================================
            // DESACTIVAR BOTÓN
            // =========================================

            guardarCambios.disabled =
                true;


            guardarCambios.textContent =
                "Guardando...";


            try {

                // =====================================
                // PUT AL BACKEND
                // =====================================

                const reservaActualizada =
                    await apiFetch(
                        `/api/reservas/${reservaSeleccionada.id}?usuarioId=${usuario.id}`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(
                                    request
                                )
                        }
                    );


                console.log(
                    "Reserva actualizada:",
                    reservaActualizada
                );


                // =====================================
                // CERRAR MODAL
                // =====================================

                modalEditar.hide();


                reservaSeleccionada =
                    null;


                // =====================================
                // RECARGAR
                // =====================================

                await mostrarReservas();


                // =====================================
                // MENSAJE
                // =====================================

                Swal.fire({
                    icon: "success",
                    title: "Reserva actualizada",
                    text:
                        "La reserva fue actualizada correctamente.",
                    timer: 2000,
                    showConfirmButton: false
                });


            } catch (error) {

                console.error(
                    "Error actualizando:",
                    error
                );


                Swal.fire({
                    icon: "error",
                    title: "No se pudo actualizar",
                    text:
                        error.message
                });


            } finally {

                guardarCambios.disabled =
                    false;

                guardarCambios.textContent =
                    "Guardar cambios";

            }

        }
    );

}


// =====================================================
// CANCELAR RESERVA
// =====================================================

const cancelarReserva = async (
    id
) => {

    const usuario =
        obtenerUsuarioActual();


    if (
        !usuario ||
        !usuario.id
    ) {

        window.location.href =
            "./inicio-sesion.html";

        return;

    }


    // ================================================
    // OBTENER DETALLE
    // ================================================

    const reserva =
        await obtenerDetalleReserva(
            id
        );


    if (!reserva) {

        return;

    }


    // ================================================
    // VALIDAR ESTADO
    // ================================================

    if (
        reserva.estado ===
        "CANCELADA"
    ) {

        Swal.fire({
            icon: "warning",
            title: "Reserva cancelada",
            text:
                "Esta reserva ya está cancelada."
        });

        return;

    }


    // ================================================
    // CONFIRMAR
    // ================================================

    const resultado =
        await Swal.fire({

            title:
                "¿Cancelar reserva?",

            text:
                `Vas a cancelar la reserva de ${reserva.nombreCancha}.`,

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonText:
                "Sí, cancelar",

            cancelButtonText:
                "No",

            confirmButtonColor:
                "#d33"

        });


    if (
        !resultado.isConfirmed
    ) {

        return;

    }


    try {

        // =============================================
        // PATCH AL BACKEND
        // =============================================

        await apiFetch(
            `/api/reservas/${id}/cancelar?usuarioId=${usuario.id}`,
            {
                method: "PATCH"
            }
        );


        // =============================================
        // RECARGAR
        // =============================================

        await mostrarReservas();


        // =============================================
        // MENSAJE
        // =============================================

        Swal.fire({
            icon: "success",
            title: "Reserva cancelada",
            text:
                "La reserva fue cancelada correctamente.",
            timer: 2000,
            showConfirmButton: false
        });


    } catch (error) {

        console.error(
            "Error cancelando:",
            error
        );


        Swal.fire({
            icon: "error",
            title: "No se pudo cancelar",
            text:
                error.message
        });

    }

};


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =============================================
        // COMPROBAR USUARIO
        // =============================================

        const usuario =
            obtenerUsuarioActual();


        if (
            !usuario ||
            !usuario.id
        ) {

            window.location.href =
                "./inicio-sesion.html";

            return;

        }


        // =============================================
        // CARGAR RESERVAS
        // =============================================

        await mostrarReservas();

    }
);

