import { todasLasCanchas } from "./catalogo.js";

// ===============================
// OBTENER ID DE LA CANCHA
// ===============================

const parametros = new URLSearchParams(window.location.search);

const idCancha = Number(parametros.get("id"));


// ===============================
// BUSCAR CANCHA
// ===============================

const obtenerCancha = () => {

    return todasLasCanchas.find(
        cancha => String(cancha.id) === String(idCancha)
    );
};


// ===============================
// MOSTRAR CANCHA
// ===============================

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


    document.getElementById("nombreCancha").textContent =
        cancha.nombreCancha;


    document.getElementById("ubicacionCancha").textContent =
        cancha.ubicacion;


    document.getElementById("descripcionCancha").textContent =
        cancha.descripcion;


    document.getElementById("precioCancha").textContent =
        Number(cancha.precio).toLocaleString("es-CO");


    document.getElementById("imagenCancha").src =
        cancha.imagen;


    document.getElementById("imagenCancha").alt =
        cancha.nombreCancha;


    actualizarTotal();

};


// ===============================
// CALCULAR TOTAL
// ===============================

const actualizarTotal = () => {

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

    const duracion =
        Number(
            document.getElementById("duracion").value
        );

    const precio =
        Number(cancha.precio);

    const total =
        precio * duracion;


    document.getElementById("totalReserva").textContent =
        total.toLocaleString("es-CO");

};


// ===============================
// CAMBIAR DURACIÓN
// ===============================

document
    .getElementById("duracion")
    .addEventListener(
        "change",
        actualizarTotal
    );


// ===============================
// FECHA MÍNIMA
// ===============================

const fechaReserva =
    document.getElementById("fechaReserva");

const hoy =
    new Date().toISOString().split("T")[0];

fechaReserva.min = hoy;


// ===============================
// CONFIRMAR RESERVA
// ===============================

document
    .getElementById("formReserva")
    .addEventListener("submit", function (event) {

        event.preventDefault();

        const cancha =
            obtenerCancha();

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


        const nombre =
            document.getElementById("nombreCliente").value.trim();

        const email =
            document.getElementById("emailCliente").value.trim();

        const telefono =
            document.getElementById("telefonoCliente").value.trim();

        const fecha =
            document.getElementById("fechaReserva").value;

        const hora =
            document.getElementById("horaReserva").value;

        const duracion =
            Number(
                document.getElementById("duracion").value
            );


        const total =
            Number(cancha.precio) * duracion;


        // ===============================
        // OBJETO RESERVA
        // ===============================

        const nuevaReserva = {

            id: Date.now(),

            canchaId: cancha.id,

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


        // ===============================
        // GUARDAR RESERVA
        // ===============================

        const reservas =
            JSON.parse(
                localStorage.getItem("reservas")
            ) || [];


        reservas.push(nuevaReserva);


        localStorage.setItem(
            "reservas",
            JSON.stringify(reservas)
        );


        alert(
            "Reserva realizada correctamente."
        );


        console.log(
            "Reserva creada:",
            nuevaReserva
        );


        // Redireccionar

        window.location.href =
            "./canchas.html";

    });


// ===============================
// INICIAR
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    mostrarCancha
);