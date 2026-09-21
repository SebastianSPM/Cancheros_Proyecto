import { apiFetch } from "../api/api.js";

// Oculta la página mientras se verifica la sesión
document.body.style.visibility = "hidden";

async function verificarSesion() {
    try {
        await apiFetch("/api/perfil");

        // Usuario autenticado → mostrar página
        document.body.style.visibility = "visible";

    } catch (error) {
        // Usuario no autenticado → ir inmediatamente al login
        window.location.replace("../auth/inicio-sesion.html");
    }
}

verificarSesion();


// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

const contenedor =
    document.getElementById("contenidoReservas");


// =========================================================
// OBTENER TODAS LAS RESERVAS
// =========================================================

const obtenerReservasAdmin = async () => {

    try {

        return await apiFetch(
            "/api/reservas/admin"
        );

    } catch (error) {

        console.error(
            "Error al obtener reservas:",
            error
        );

        throw error;
    }
};


// =========================================================
// FORMATEAR FECHA
// =========================================================

const formatearFecha = (fecha) => {

    if (!fecha) {
        return "-";
    }

    const [anio, mes, dia] =
        fecha.split("-");

    return `${dia}/${mes}/${anio}`;
};


// =========================================================
// FORMATEAR HORA
// =========================================================

const formatearHora = (hora) => {

    if (!hora) {
        return "-";
    }

    return hora.substring(0, 5);
};


// =========================================================
// FORMATEAR DINERO
// =========================================================

const formatearPrecio = (valor) => {

    return Number(valor || 0)
        .toLocaleString("es-CO");
};


// =========================================================
// ESTADO
// =========================================================

const obtenerClaseEstado = (estado) => {

    switch (estado) {

        case "CONFIRMADA":
            return "badge-estado-confirmada";

        case "CANCELADA":
            return "badge-estado-cancelada";

        default:
            return "badge-estado-default";
    }
};


// =========================================================
// RENDERIZAR RESERVAS
// =========================================================

const renderizarReservas = async () => {

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="text-center py-4">
            <div
                class="spinner-border"
                role="status"
            >
                <span class="visually-hidden">
                    Cargando...
                </span>
            </div>

            <p class="mt-2 mb-0">
                Cargando reservas...
            </p>
        </div>
    `;


    try {

        const reservas =
            await obtenerReservasAdmin();


        if (reservas.length === 0) {

            contenedor.innerHTML = `
                <div class="text-center py-5">

                    <i
                        class="bi bi-calendar-x"
                        style="font-size: 3rem;"
                    ></i>

                    <h5 class="mt-3">
                        No hay reservas registradas
                    </h5>

                    <p class="text-muted mb-0">
                        Actualmente no existen reservas en el sistema.
                    </p>

                </div>
            `;

            return;
        }


        // =====================================================
        // RESUMEN
        // =====================================================

        const totalReservas =
            reservas.length;

        const reservasConfirmadas =
            reservas.filter(
                reserva =>
                    reserva.estado === "CONFIRMADA"
            ).length;

        const reservasCanceladas =
            reservas.filter(
                reserva =>
                    reserva.estado === "CANCELADA"
            ).length;


        contenedor.innerHTML = `

            <!-- RESUMEN -->

            <div class="row g-3 mb-4">

                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-calendar-check-fill"
                                style="font-size: 2rem;"
                            ></i>

                            <div>
                                <h6>Total de reservas</h6>
                                <h3>${totalReservas}</h3>
                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-check-circle-fill"
                                style="font-size: 2rem;"
                            ></i>

                            <div>
                                <h6>Confirmadas</h6>
                                <h3>${reservasConfirmadas}</h3>
                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-x-circle-fill"
                                style="font-size: 2rem;"
                            ></i>

                            <div>
                                <h6>Canceladas</h6>
                                <h3>${reservasCanceladas}</h3>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- TABLA -->

            <div class="table-responsive tabla-contenedor">

                <table class="table align-middle mb-0">

                    <thead>

                        <tr>
                            <th>Referencia</th>
                            <th>Cliente</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Cancha</th>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Duración</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>

                    </thead>

                    <tbody id="tablaReservasAdmin"></tbody>

                </table>

            </div>
        `;


        const tabla =
            document.getElementById(
                "tablaReservasAdmin"
            );


        reservas.forEach(reserva => {

            const fila =
                document.createElement("tr");


            const puedeCancelar =
                reserva.estado !== "CANCELADA";


            fila.innerHTML = `

                <td>
                    ${reserva.id}
                </td>

                <td>
                    ${reserva.nombreCompleto || "-"}
                </td>

                <td>
                    ${reserva.correo || "-"}
                </td>

                <td>
                    ${reserva.telefono || "-"}
                </td>

                <td>
                    ${reserva.nombreCancha || "-"}
                </td>

                <td>
                    ${formatearFecha(reserva.fecha)}
                </td>

                <td>
                    ${formatearHora(reserva.horaInicio)}
                    -
                    ${formatearHora(reserva.horaFin)}
                </td>

                <td>
                    ${reserva.duracion || 0} h
                </td>

                <td>
                    $${formatearPrecio(reserva.total)}
                </td>

                <td>

                    <span
                        class="badge ${obtenerClaseEstado(reserva.estado)}"
                    >
                        ${reserva.estado}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary btn-ver-reserva"
                        data-id="${reserva.id}"
                    >
                        <i class="bi bi-eye"></i>
                    </button>

                    ${
                        puedeCancelar
                            ? `
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger btn-cancelar-reserva"
                                    data-id="${reserva.id}"
                                >
                                    <i class="bi bi-x-circle"></i>
                                </button>
                            `
                            : ""
                    }

                </td>
            `;

            tabla.appendChild(fila);
        });


        agregarEventosReservas();


    } catch (error) {

        contenedor.innerHTML = `
            <div class="alert alert-danger">

                <i class="bi bi-exclamation-triangle-fill"></i>

                No se pudieron cargar las reservas.

            </div>
        `;
    }
};


// =========================================================
// VER DETALLE
// =========================================================

const verReserva = async (id) => {

    try {

        const reserva =
            await apiFetch(
                `/api/reservas/admin/${id}`
            );


        Swal.fire({

            title: "Detalle de reserva",

            html: `
                <div class="text-start">

                    <p>
                        <strong>Referencia:</strong>
                        ${reserva.id}
                    </p>

                    <p>
                        <strong>Cliente:</strong>
                        ${reserva.nombreCompleto}
                    </p>

                    <p>
                        <strong>Correo:</strong>
                        ${reserva.correo}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>
                        ${reserva.telefono || "-"}
                    </p>

                    <hr>

                    <p>
                        <strong>Cancha:</strong>
                        ${reserva.nombreCancha}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${formatearFecha(reserva.fecha)}
                    </p>

                    <p>
                        <strong>Horario:</strong>
                        ${formatearHora(reserva.horaInicio)}
                        -
                        ${formatearHora(reserva.horaFin)}
                    </p>

                    <p>
                        <strong>Duración:</strong>
                        ${reserva.duracion} hora(s)
                    </p>

                    <p>
                        <strong>Precio por hora:</strong>
                        $${formatearPrecio(reserva.precioHora)}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        $${formatearPrecio(reserva.total)}
                    </p>

                    <p>
                        <strong>Estado:</strong>
                        ${reserva.estado}
                    </p>

                </div>
            `,

            confirmButtonText: "Cerrar"

        });

    } catch (error) {

        console.error(
            "Error al obtener detalle:",
            error
        );

        Swal.fire({
            icon: "error",
            title: "Error",
            text:
                error.message ||
                "No se pudo obtener el detalle de la reserva."
        });
    }
};


// =========================================================
// CANCELAR RESERVA
// =========================================================

const cancelarReserva = async (id) => {

    const resultado =
        await Swal.fire({

            title: "¿Cancelar reserva?",

            text:
                "Esta acción cambiará el estado de la reserva a CANCELADA.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText:
                "Sí, cancelar",

            cancelButtonText:
                "No",

            confirmButtonColor:
                "#d33"
        });


    if (!resultado.isConfirmed) {
        return;
    }


    try {

        await apiFetch(
            `/api/reservas/admin/${id}/cancelar`,
            {
                method: "PATCH"
            }
        );


        await Swal.fire({

            icon: "success",

            title: "Reserva cancelada",

            text:
                "La reserva fue cancelada correctamente.",

            timer: 1500,

            showConfirmButton: false
        });


        renderizarReservas();


    } catch (error) {

        console.error(
            "Error al cancelar reserva:",
            error
        );

        Swal.fire({

            icon: "error",

            title: "No se pudo cancelar",

            text:
                error.message ||
                "Ocurrió un error al cancelar la reserva."
        });
    }
};


// =========================================================
// EVENTOS
// =========================================================

const agregarEventosReservas = () => {

    const botonesVer =
        document.querySelectorAll(
            ".btn-ver-reserva"
        );

    const botonesCancelar =
        document.querySelectorAll(
            ".btn-cancelar-reserva"
        );


    botonesVer.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {
                verReserva(
                    boton.dataset.id
                );
            }
        );

    });


    botonesCancelar.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {
                cancelarReserva(
                    boton.dataset.id
                );
            }
        );

    });

};


// =========================================================
// CARGAR RESERVAS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    renderizarReservas
);