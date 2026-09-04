
// =====================================================
// MIS RESERVAS
// =====================================================


// =====================================================
// OBTENER RESERVAS DEL LOCAL STORAGE
// =====================================================

const obtenerReservas = () => {

    return JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

};


// =====================================================
// OBTENER USUARIO ACTUAL
// =====================================================

const obtenerUsuarioActual = () => {

    return JSON.parse(
        localStorage.getItem("currentUser")
    );

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

const modalEditar =
    new bootstrap.Modal(modalElement);


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
// OBTENER FECHA Y HORA ACTUAL
// =====================================================

const obtenerFechaHoraActual = () => {

    return new Date();

};


// =====================================================
// OBTENER FECHA ACTUAL YYYY-MM-DD
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
// CONVERTIR HORA A MINUTOS
// =====================================================

const convertirHoraAMinutos = (
    hora
) => {

    const [horas, minutos] =
        hora.split(":").map(Number);

    return (
        horas * 60
    ) + minutos;

};


// =====================================================
// CALCULAR HORA FINAL
// =====================================================

const calcularHoraFinal = (
    horaInicio,
    duracion
) => {

    return (
        convertirHoraAMinutos(horaInicio)
        +
        Number(duracion) * 60
    );

};


// =====================================================
// OBTENER RESERVAS DEL USUARIO
// =====================================================

const obtenerReservasDelUsuario = () => {

    const reservas =
        obtenerReservas();

    const usuario =
        obtenerUsuarioActual();


    // Si no hay usuario iniciado
    if (!usuario) {

        window.location.href =
            "inicio-sesion.html";

        return [];

    }


    // Buscar por email
    if (usuario.email) {

        return reservas.filter(
            reserva =>
                reserva.email === usuario.email
        );

    }


    return [];

};


// =====================================================
// OBTENER SOLO RESERVAS FUTURAS
// =====================================================

const obtenerReservasFuturas = () => {

    const reservas =
        obtenerReservasDelUsuario();

    const ahora =
        obtenerFechaHoraActual();


    return reservas.filter(reserva => {

        // Las canceladas no aparecen
        if (
            reserva.estado === "CANCELADA"
        ) {
            return false;
        }


        const fechaHoraReserva =
            convertirFechaHora(
                reserva.fecha,
                reserva.hora
            );


        return fechaHoraReserva > ahora;

    });

};


// =====================================================
// FORMATEAR FECHA
// =====================================================

const formatearFecha = (
    fecha
) => {

    const [
        año,
        mes,
        dia
    ] = fecha.split("-");

    return `${dia}/${mes}/${año}`;

};


// =====================================================
// FORMATEAR PRECIO
// =====================================================

const formatearPrecio = (
    precio
) => {

    return Number(precio)
        .toLocaleString("es-CO");

};


// =====================================================
// VERIFICAR SI UN HORARIO ESTÁ OCUPADO
// =====================================================

const horarioEstaOcupado = (
    reservaActual,
    nuevaFecha,
    nuevaHora
) => {

    const reservas =
        obtenerReservas();


    const nuevaHoraInicio =
        convertirHoraAMinutos(
            nuevaHora
        );


    const nuevaHoraFinal =
        calcularHoraFinal(
            nuevaHora,
            reservaActual.duracion
        );


    return reservas.some(reserva => {


        // ==========================================
        // IGNORAR LA RESERVA QUE ESTAMOS EDITANDO
        // ==========================================

        if (
            Number(reserva.id) ===
            Number(reservaActual.id)
        ) {

            return false;

        }


        // ==========================================
        // LAS CANCELADAS NO BLOQUEAN
        // ==========================================

        if (
            reserva.estado === "CANCELADA"
        ) {

            return false;

        }


        // ==========================================
        // MISMA CANCHA
        // ==========================================

        if (
            Number(reserva.canchaId) !==
            Number(reservaActual.canchaId)
        ) {

            return false;

        }


        // ==========================================
        // MISMA FECHA
        // ==========================================

        if (
            reserva.fecha !==
            nuevaFecha
        ) {

            return false;

        }


        // ==========================================
        // HORA INICIAL DE RESERVA EXISTENTE
        // ==========================================

        const reservaHoraInicio =
            convertirHoraAMinutos(
                reserva.hora
            );


        // ==========================================
        // HORA FINAL DE RESERVA EXISTENTE
        // ==========================================

        const reservaHoraFinal =
            calcularHoraFinal(
                reserva.hora,
                reserva.duracion
            );


        // ==========================================
        // COMPROBAR CRUCE
        // ==========================================

        return (
            nuevaHoraInicio <
            reservaHoraFinal

            &&

            nuevaHoraFinal >
            reservaHoraInicio
        );

    });

};


// =====================================================
// MOSTRAR HORARIOS DISPONIBLES
// =====================================================

const mostrarHorariosDisponibles = (
    fecha
) => {

    horariosDisponibles.innerHTML = "";

    editarHora.value = "";


    // ==========================================
    // VALIDAR FECHA
    // ==========================================

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


    // ==========================================
    // CONFIGURACIÓN DEL HORARIO
    // ==========================================

    const horaInicio = 8;

    const horaFin = 22;

    const duracion =
        Number(
            reservaSeleccionada.duracion
        );


    // ==========================================
    // FECHA Y HORA ACTUAL
    // ==========================================

    const ahora =
        obtenerFechaHoraActual();

    const hoy =
        obtenerFechaHoy();

    const minutosAhora =
        ahora.getHours() * 60
        +
        ahora.getMinutes();


    let cantidadDisponibles = 0;


    // ==========================================
    // RECORRER HORARIOS
    // ==========================================

    for (
        let hora = horaInicio;
        hora < horaFin;
        hora++
    ) {


        const horaTexto =
            `${String(hora).padStart(2, "0")}:00`;


        // ==========================================
        // CALCULAR HORA FINAL
        // ==========================================

        const horaFinal =
            hora + duracion;


        // No permitir terminar después de 22:00

        if (
            horaFinal > horaFin
        ) {

            continue;

        }


        // ==========================================
        // VERIFICAR SI LA HORA YA PASÓ
        // ==========================================

        let horaYaPaso = false;


        if (
            fecha === hoy
        ) {

            const minutosHora =
                hora * 60;


            horaYaPaso =
                minutosHora <
                minutosAhora;

        }


        // ==========================================
        // VERIFICAR SI ESTÁ OCUPADA
        // ==========================================

        const ocupado =
            horarioEstaOcupado(
                reservaSeleccionada,
                fecha,
                horaTexto
            );


        // ==========================================
        // SOLO MOSTRAR DISPONIBLES
        // ==========================================

        if (
            horaYaPaso ||
            ocupado
        ) {

            continue;

        }


        // ==========================================
        // CREAR BOTÓN
        // ==========================================

        const boton =
            document.createElement("button");


        boton.type = "button";

        boton.className =
            "btn btn-outline-success";

        boton.textContent =
            horaTexto;


        boton.dataset.hora =
            horaTexto;


        // ==========================================
        // SELECCIONAR HORARIO
        // ==========================================

        boton.addEventListener(
            "click",
            () => {


                // Quitar selección anterior

                document
                    .querySelectorAll(
                        "#horariosDisponibles button"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "btn-success"
                        );

                        btn.classList.add(
                            "btn-outline-success"
                        );

                    });


                // Marcar botón seleccionado

                boton.classList.remove(
                    "btn-outline-success"
                );

                boton.classList.add(
                    "btn-success"
                );


                // Guardar hora

                editarHora.value =
                    boton.dataset.hora;

            }
        );


        horariosDisponibles.appendChild(
            boton
        );


        cantidadDisponibles++;

    }


    // ==========================================
    // SI NO HAY HORARIOS
    // ==========================================

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

};


// =====================================================
// MOSTRAR RESERVAS
// =====================================================

const mostrarReservas = () => {

    listaReservas.innerHTML = "";


    const reservasFuturas =
        obtenerReservasFuturas();


    // ==========================================
    // NO HAY RESERVAS
    // ==========================================

    if (
        reservasFuturas.length === 0
    ) {

        sinReservas.style.display =
            "block";

        return;

    }


    sinReservas.style.display =
        "none";


    // ==========================================
    // CREAR FILAS
    // ==========================================

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
                    ${reserva.hora}
                </td>

                <td>
                    $${formatearPrecio(
                        reserva.total
                    )}
                </td>

                <td>

                    <span class="badge bg-success">
                        CONFIRMADA
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


    // ==========================================
    // BOTONES EDITAR
    // ==========================================

    document
        .querySelectorAll(".btn-editar")
        .forEach(boton => {

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

        });


    // ==========================================
    // BOTONES CANCELAR
    // ==========================================

    document
        .querySelectorAll(".btn-cancelar")
        .forEach(boton => {

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

        });

};


// =====================================================
// ABRIR EDITAR
// =====================================================

const abrirEditar = (
    id
) => {

    const reservas =
        obtenerReservas();


    const reserva =
        reservas.find(
            reserva =>
                Number(reserva.id) ===
                Number(id)
        );


    if (!reserva) {

        return;

    }


    // ==========================================
    // COMPROBAR QUE SEA DEL USUARIO ACTUAL
    // ==========================================

    const usuario =
        obtenerUsuarioActual();


    if (
        !usuario ||
        reserva.email !== usuario.email
    ) {

        Swal.fire({
            icon: "error",
            title: "Acceso no permitido",
            text: "No puedes modificar esta reserva."
        });

        return;

    }


    // ==========================================
    // COMPROBAR QUE SEA FUTURA
    // ==========================================

    const fechaHoraReserva =
        convertirFechaHora(
            reserva.fecha,
            reserva.hora
        );


    if (
        fechaHoraReserva <=
        obtenerFechaHoraActual()
    ) {

        Swal.fire({
            icon: "warning",
            title: "Reserva no disponible",
            text:
                "La fecha y hora de esta reserva ya pasaron."
        });


        mostrarReservas();

        return;

    }


    // ==========================================
    // GUARDAR RESERVA SELECCIONADA
    // ==========================================

    reservaSeleccionada =
        reserva;


    // ==========================================
    // MOSTRAR CANCHA
    // ==========================================

    editarCancha.value =
        reserva.nombreCancha;


    // ==========================================
    // MOSTRAR FECHA
    // ==========================================

    editarFecha.value =
        reserva.fecha;


    // ==========================================
    // MOSTRAR PRECIO
    // ==========================================

    editarPrecio.value =
        `$${formatearPrecio(
            reserva.total
        )}`;


    // ==========================================
    // FECHA MÍNIMA
    // ==========================================

    editarFecha.min =
        obtenerFechaHoy();


    // ==========================================
    // MOSTRAR HORARIOS
    // ==========================================

    mostrarHorariosDisponibles(
        reserva.fecha
    );


    // ==========================================
    // SELECCIONAR HORARIO ACTUAL
    // ==========================================

    setTimeout(() => {

        const botones =
            document.querySelectorAll(
                "#horariosDisponibles button"
            );


        botones.forEach(boton => {

            if (
                boton.dataset.hora ===
                reserva.hora
            ) {

                boton.classList.remove(
                    "btn-outline-success"
                );

                boton.classList.add(
                    "btn-success"
                );

                editarHora.value =
                    reserva.hora;

            }

        });

    }, 0);


    // ==========================================
    // MOSTRAR MODAL
    // ==========================================

    modalEditar.show();

};


// =====================================================
// CAMBIAR FECHA
// =====================================================

editarFecha.addEventListener(
    "change",
    () => {

        mostrarHorariosDisponibles(
            editarFecha.value
        );

    }
);


// =====================================================
// GUARDAR CAMBIOS
// =====================================================

guardarCambios.addEventListener(
    "click",
    () => {


        if (
            !reservaSeleccionada
        ) {

            return;

        }


        const nuevaFecha =
            editarFecha.value;


        const nuevaHora =
            editarHora.value;


        // ==========================================
        // VALIDAR FECHA Y HORA
        // ==========================================

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


        // ==========================================
        // VALIDAR FECHA Y HORA FUTURA
        // ==========================================

        const nuevaFechaHora =
            convertirFechaHora(
                nuevaFecha,
                nuevaHora
            );


        if (
            nuevaFechaHora <=
            obtenerFechaHoraActual()
        ) {

            Swal.fire({
                icon: "error",
                title: "Fecha u hora inválida",
                text:
                    "No puedes seleccionar una fecha u hora que ya haya pasado."
            });

            return;

        }


        // ==========================================
        // COMPROBAR DISPONIBILIDAD
        // ==========================================

        const ocupado =
            horarioEstaOcupado(
                reservaSeleccionada,
                nuevaFecha,
                nuevaHora
            );


        if (ocupado) {

            Swal.fire({
                icon: "error",
                title: "Horario no disponible",
                text:
                    "La cancha ya está reservada para esa fecha y hora."
            });

            // Volver a mostrar horarios

            mostrarHorariosDisponibles(
                nuevaFecha
            );

            return;

        }


        // ==========================================
        // OBTENER TODAS LAS RESERVAS
        // ==========================================

        const reservas =
            obtenerReservas();


        // ==========================================
        // BUSCAR RESERVA
        // ==========================================

        const indice =
            reservas.findIndex(
                reserva =>
                    Number(reserva.id) ===
                    Number(
                        reservaSeleccionada.id
                    )
            );


        if (
            indice === -1
        ) {

            return;

        }


        // ==========================================
        // ACTUALIZAR SOLO FECHA
        // ==========================================

        reservas[indice].fecha =
            nuevaFecha;


        // ==========================================
        // ACTUALIZAR SOLO HORA
        // ==========================================

        reservas[indice].hora =
            nuevaHora;


        // ==========================================
        // GUARDAR
        // ==========================================

        localStorage.setItem(
            "reservas",
            JSON.stringify(reservas)
        );


        // ==========================================
        // CERRAR MODAL
        // ==========================================

        modalEditar.hide();


        reservaSeleccionada =
            null;


        // ==========================================
        // ACTUALIZAR TABLA
        // ==========================================

        mostrarReservas();


        // ==========================================
        // MENSAJE
        // ==========================================

        Swal.fire({
            icon: "success",
            title: "Reserva actualizada",
            text:
                "La fecha y hora fueron actualizadas correctamente.",
            timer: 2000,
            showConfirmButton: false
        });

    }
);


// =====================================================
// CANCELAR RESERVA
// =====================================================

const cancelarReserva = (
    id
) => {

    const reservas =
        obtenerReservas();


    const reserva =
        reservas.find(
            reserva =>
                Number(reserva.id) ===
                Number(id)
        );


    if (!reserva) {

        return;

    }


    // ==========================================
    // COMPROBAR USUARIO
    // ==========================================

    const usuario =
        obtenerUsuarioActual();


    if (
        !usuario ||
        reserva.email !== usuario.email
    ) {

        Swal.fire({
            icon: "error",
            title: "Acceso no permitido",
            text:
                "No puedes cancelar esta reserva."
        });

        return;

    }


    // ==========================================
    // CONFIRMAR CANCELACIÓN
    // ==========================================

    Swal.fire({

        title: "¿Cancelar reserva?",

        text:
            `Vas a cancelar la reserva de ${reserva.nombreCancha}.`,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
            "Sí, cancelar",

        cancelButtonText:
            "No"

    }).then(resultado => {


        if (
            !resultado.isConfirmed
        ) {

            return;

        }


        // ==========================================
        // BUSCAR RESERVA
        // ==========================================

        const indice =
            reservas.findIndex(
                reserva =>
                    Number(reserva.id) ===
                    Number(id)
            );


        if (
            indice === -1
        ) {

            return;

        }


        // ==========================================
        // CAMBIAR ESTADO
        // ==========================================

        reservas[indice].estado =
            "CANCELADA";


        // ==========================================
        // GUARDAR
        // ==========================================

        localStorage.setItem(
            "reservas",
            JSON.stringify(reservas)
        );


        // ==========================================
        // ACTUALIZAR TABLA
        // ==========================================

        mostrarReservas();


        // ==========================================
        // MENSAJE
        // ==========================================

        Swal.fire({

            icon: "success",

            title: "Reserva cancelada",

            text:
                "La reserva fue cancelada correctamente.",

            timer: 2000,

            showConfirmButton: false

        });

    });

};


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Comprobar sesión

        const usuario =
            obtenerUsuarioActual();


        if (!usuario) {

            window.location.href =
                "inicio-sesion.html";

            return;

        }


        mostrarReservas();

    }
);

