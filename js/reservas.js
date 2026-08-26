import { todasLasCanchas } from "./catalogo.js";


// =====================================================
// OBTENER ID DE LA CANCHA DESDE LA URL
// =====================================================

const parametros = new URLSearchParams(window.location.search);

const idCancha = Number(parametros.get("id"));


// =====================================================
// OBTENER RESERVAS
// =====================================================

const obtenerReservas = () => {

    return JSON.parse(
        localStorage.getItem("reservas")
    ) || [];

};


// =====================================================
// OBTENER CANCHA
// =====================================================

const obtenerCancha = () => {

    return todasLasCanchas.find(
        cancha => Number(cancha.id) === idCancha
    );

};


// =====================================================
// CONVERTIR HORA A MINUTOS
// =====================================================

const convertirHoraAMinutos = (hora) => {

    const [horas, minutos] =
        hora.split(":").map(Number);

    return (horas * 60) + minutos;

};


// =====================================================
// CALCULAR HORA FINAL
// =====================================================

const calcularHoraFinal = (horaInicio, duracion) => {

    const minutosInicio =
        convertirHoraAMinutos(horaInicio);

    return minutosInicio + (duracion * 60);

};


// =====================================================
// VERIFICAR SI EL HORARIO ESTÁ OCUPADO
// =====================================================

const horarioEstaOcupado = (
    canchaId,
    fecha,
    hora,
    duracion
) => {

    const reservas = obtenerReservas();

    const nuevaHoraInicio =
        convertirHoraAMinutos(hora);

    const nuevaHoraFinal =
        calcularHoraFinal(
            hora,
            duracion
        );


    return reservas.some(reserva => {

        // -----------------------------------------
        // 1. Verificar misma cancha
        // -----------------------------------------

        if (
            Number(reserva.canchaId) !==
            Number(canchaId)
        ) {

            return false;

        }


        // -----------------------------------------
        // 2. Verificar misma fecha
        // -----------------------------------------

        if (
            reserva.fecha !== fecha
        ) {

            return false;

        }


        // -----------------------------------------
        // 3. Hora de inicio de la reserva existente
        // -----------------------------------------

        const reservaHoraInicio =
            convertirHoraAMinutos(
                reserva.hora
            );


        // -----------------------------------------
        // 4. Hora final de la reserva existente
        // -----------------------------------------

        const reservaHoraFinal =
            calcularHoraFinal(
                reserva.hora,
                Number(reserva.duracion)
            );


        // -----------------------------------------
        // 5. COMPROBAR CRUCE DE HORARIOS
        // -----------------------------------------

        return (
            nuevaHoraInicio < reservaHoraFinal &&
            nuevaHoraFinal > reservaHoraInicio
        );

    });

};


// =====================================================
// CARGAR HORARIOS DISPONIBLES
// =====================================================

const cargarHorarios = () => {

    const fecha =
        document.getElementById("fechaReserva").value;

    const horaSelect =
        document.getElementById("horaReserva");

    const duracion =
        Number(
            document.getElementById("duracion").value
        );

    let cancha =
        obtenerCancha();


    // -----------------------------------------
    // Limpiar horarios
    // -----------------------------------------

    horaSelect.innerHTML = `
        <option value="">
            Selecciona una hora
        </option>
    `;


    if (!fecha || !cancha || !duracion) {

        return;

    }


    // -----------------------------------------
    // HORARIO DE LA CANCHA
    // 08:00 hasta 22:00
    // -----------------------------------------

    const horaInicio = 8;
    const horaFin = 22;

   

    // =====================================================
    // RECORRER HORARIOS
    // =====================================================
    for (
        let hora = horaInicio;
        hora < horaFin;
        hora++
    ) {

        const horaTexto =
            `${String(hora).padStart(2, "0")}:00`;


        const horaFinal =
            hora + duracion;


        // -----------------------------------------
        // No permitir superar las 22:00
        // -----------------------------------------

        if (horaFinal > horaFin) {

            continue;

        }


        // -----------------------------------------
        // Verificar disponibilidad
        // -----------------------------------------

        const ocupado =
            horarioEstaOcupado(
                cancha.id,
                fecha,
                horaTexto,
                duracion
            );


        // -----------------------------------------
        // Crear opción
        // -----------------------------------------

        const option =
            document.createElement("option");


        option.value =
            horaTexto;


        if (ocupado) {

            option.textContent =
                `${horaTexto} - 🔴 Ocupado`;

            option.disabled = true;

        } else {

            option.textContent =
                `${horaTexto} - 🟢 Disponible`;

            option.disabled = false;

        }


        horaSelect.appendChild(option);

    }

};


// =====================================================
// FECHA
// =====================================================

const fechaReserva =
    document.getElementById("fechaReserva");


// Obtener fecha actual correctamente
const hoy =
    new Date().toISOString().split("T")[0];


fechaReserva.min = hoy;


// Cuando cambia la fecha
fechaReserva.addEventListener(
    "change",
    () => {

        cargarHorarios();

    }
);


// =====================================================
// DURACIÓN
// =====================================================

const duracionInput =
    document.getElementById("duracion");


duracionInput.addEventListener(
    "change",
    () => {

        actualizarTotal();

        cargarHorarios();

    }
);


// =====================================================
// MOSTRAR CANCHA
// =====================================================

const mostrarCancha = () => {
    
    const cancha = obtenerCancha();
    
    if (!cancha) {

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se a encontrado la cancha",
        }).then(() => {
            window.location.href = "./canchas.html";
        })

        return;
    }


    document.getElementById(
        "nombreCancha"
    ).textContent =
        cancha.nombreCancha;


    document.getElementById(
        "ubicacionCancha"
    ).textContent =
        cancha.ubicacion;


    document.getElementById(
        "descripcionCancha"
    ).textContent =
        cancha.descripcion;


    document.getElementById(
        "precioCancha"
    ).textContent =
        Number(
            cancha.precio
        ).toLocaleString("es-CO");


    document.getElementById(
        "imagenCancha"
    ).src =
        cancha.imagen;


    document.getElementById(
        "imagenCancha"
    ).alt =
        cancha.nombreCancha;


    actualizarTotal();

};


// =====================================================
// CALCULAR TOTAL
// =====================================================

const actualizarTotal = () => {

    const cancha =
        obtenerCancha();


    if (!cancha) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se a encontrado la cancha",
        })
        return;
    }


    const duracion =
        Number(
            document.getElementById(
                "duracion"
            ).value
        );


    const precio =
        Number(cancha.precio);


    const total =
        precio * duracion;


    document.getElementById(
        "totalReserva"
    ).textContent =
        total.toLocaleString("es-CO");

};


// =====================================================
// CONFIRMAR RESERVA
// =====================================================

document
    .getElementById("formReserva")
    .addEventListener(
        "submit",
        function (event) {

        event.preventDefault();

            // -----------------------------------------
            // Obtener cancha
            // -----------------------------------------

            const cancha =
                obtenerCancha();


            if (!cancha) {

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No se a encontrado la cancha",
            })
            return;
        }


            // -----------------------------------------
            // Obtener datos
            // -----------------------------------------

            const nombre =
                document
                    .getElementById(
                        "nombreCliente"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "emailCliente"
                    )
                    .value
                    .trim();


            const telefono =
                document
                    .getElementById(
                        "telefonoCliente"
                    )
                    .value
                    .trim();


            const fecha =
                document
                    .getElementById(
                        "fechaReserva"
                    )
                    .value;


            const hora =
                document
                    .getElementById(
                        "horaReserva"
                    )
                    .value;


            const duracion =
                Number(
                    document
                        .getElementById(
                            "duracion"
                        )
                        .value
                );


            // -----------------------------------------
            // Validar fecha
            // -----------------------------------------

            if (!fecha) {

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Debes seleccionar una fecha.",
                })

                return;
            }
            


            // -----------------------------------------
            // Validar hora
            // -----------------------------------------

            if (!hora) {

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Debes seleccionar una hora disponible.",
                })

                return;
            }


            // =================================================
            // VALIDACIÓN FINAL DE DISPONIBILIDAD
            // =================================================
            //
            // Esto es MUY importante.
            //
            // Aunque el usuario vea la hora como disponible,
            // otra reserva pudo haberse creado antes.
            //
            // Por eso verificamos nuevamente antes de guardar.
            // =================================================

            const ocupado =
                horarioEstaOcupado(
                    cancha.id,
                    fecha,
                    hora,
                    duracion
                );

            if (ocupado) {

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "⚠️ Esta cancha ya está ocupada en ese horario.",
                })

                cargarHorarios();
                return;
            }


            // -----------------------------------------
            // Calcular total
            // -----------------------------------------

            const total =
                Number(cancha.precio) *
                duracion;


            // -----------------------------------------
            // Crear reserva
            // -----------------------------------------

            const nuevaReserva = {

                id: Date.now(),

                canchaId:
                    cancha.id,

                nombreCancha:
                    cancha.nombreCancha,

                cliente:
                    nombre,

                email:
                    email,

                telefono:
                    telefono,

                fecha:
                    fecha,

                hora:
                    hora,

                duracion:
                    duracion,

                precioHora:
                    Number(cancha.precio),

                total:
                    total

            };


            // -----------------------------------------
            // Obtener reservas
            // -----------------------------------------

            const reservas =
                obtenerReservas();


            // -----------------------------------------
            // Guardar reserva
            // -----------------------------------------

            reservas.push(
                nuevaReserva
            );


            localStorage.setItem(
                "reservas",
                JSON.stringify(reservas)
            );


            // -----------------------------------------
            // Mensaje
            // -----------------------------------------

            if (ocupado) {

                Swal.fire({
                    icon: "good",
                    title: "Exito",
                    text: "Reserva realizada correctamente.",
                })
            }


            // -----------------------------------------
            // Regresar
            // -----------------------------------------

            window.location.href =
                "./canchas.html";
        }
    );


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        mostrarCancha();

        cargarHorarios();

    }
);