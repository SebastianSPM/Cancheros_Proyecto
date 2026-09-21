import { apiFetch } from "../api/api.js";
// =====================================================
// OBTENER ID DE LA CANCHA DESDE LA URL
// =====================================================

const parametros = new URLSearchParams(window.location.search);
const idCancha = parametros.get("id");

// =====================================================
// VALIDAR SESIÓN
// =====================================================

const verificarSesion = async () => {

    try {

        const usuario = await apiFetch("/api/perfil");

        if (!usuario || !usuario.id) {
            throw new Error("Sesión no válida");
        }

        return usuario;

    } catch (error) {

        await Swal.fire({
            icon: "info",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para realizar una reserva.",
            confirmButtonText: "Iniciar sesión"
        });

        window.location.href = "../auth/inicio-sesion.html";

        return null;
    }
};

// =====================================================
// OBTENER USUARIO ACTUAL
// =====================================================

const obtenerUsuarioActual = async () => {

    try {

        const usuario = await apiFetch("/api/perfil");

        return usuario;

    } catch (error) {

        console.error("Error obteniendo usuario:", error);

        return null;
    }
};

// =====================================================
// OBTENER CANCHA
// =====================================================

const obtenerCancha = async () => {

    if (!idCancha) {
        return null;
    }

    try {

        const cancha = await apiFetch(`/api/canchas/${idCancha}`);

        return cancha;

    } catch (error) {

        console.error("Error obteniendo cancha:", error);

        return null;
    }
};

// =====================================================
// FORMATEAR HORA
// =====================================================

const formatearHora = (hora) => {
  if (!hora) {
    return "";
  }

  return hora.substring(0, 5);
};

// =====================================================
// FECHA ACTUAL
// =====================================================

const obtenerFechaHoy = () => {
  const ahora = new Date();

  const año = ahora.getFullYear();

  const mes = String(ahora.getMonth() + 1).padStart(2, "0");

  const dia = String(ahora.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

// =====================================================
// MOSTRAR CANCHA
// =====================================================

const mostrarCancha = async () => {
  const cancha = await obtenerCancha();

  if (!cancha) {
    Swal.fire({
      icon: "error",
      title: "Cancha no encontrada",
      text: "No se encontró la cancha seleccionada.",
    }).then(() => {
      window.location.href = "./canchas.html";
    });

    return;
  }

  // Nombre

  document.getElementById("nombreCancha").textContent = cancha.nombreCancha;

  // Ubicación

  document.getElementById("ubicacionCancha").textContent = cancha.ubicacion;

  // Descripción

  document.getElementById("descripcionCancha").textContent = cancha.descripcion;

  // Precio

  const precio = Number(cancha.precio ?? cancha.precioPorHora ?? 0);

  document.getElementById("precioCancha").textContent =
    precio.toLocaleString("es-CO");

  // Imagen

  let imagen = "";

  if (Array.isArray(cancha.imagen)) {
    imagen = cancha.imagen[0];
  } else if (cancha.imagenUrl) {
    imagen = cancha.imagenUrl;
  }

  document.getElementById("imagenCancha").src = imagen;

  document.getElementById("imagenCancha").alt = cancha.nombreCancha;

  actualizarTotal();
};

// =====================================================
// CALCULAR TOTAL
// =====================================================

const actualizarTotal = async () => {
  const cancha = await obtenerCancha();

  if (!cancha) {
    return;
  }

  const duracion = Number(document.getElementById("duracion").value);

  const precio = Number(cancha.precio ?? cancha.precioPorHora ?? 0);

  const total = precio * duracion;

  document.getElementById("totalReserva").textContent =
    total.toLocaleString("es-CO");
};

// =====================================================
// CARGAR DISPONIBILIDAD DESDE EL BACKEND
// =====================================================

const cargarHorarios = async () => {
  const fecha = document.getElementById("fechaReserva").value;

  const horaSelect = document.getElementById("horaReserva");

  // Limpiar

  horaSelect.innerHTML = `
        <option value="">
            Selecciona una hora
        </option>
    `;

  // Validaciones

  if (!fecha || !idCancha) {
    return;
  }

  try {
    // =================================================
    // CONSULTAR BACKEND
    // =================================================

    const horarios = await apiFetch(
      `/api/reservas/disponibilidad?canchaId=${idCancha}&fecha=${fecha}`,
    );

    console.log("Horarios recibidos:", horarios);

    // =================================================
    // MOSTRAR HORARIOS
    // =================================================

    horarios.forEach((horario) => {
      const option = document.createElement("option");

      const horaInicio = formatearHora(horario.horaInicio);

      const horaFin = formatearHora(horario.horaFin);

      option.value = horaInicio;

      // -----------------------------------------
      // DISPONIBLE
      // -----------------------------------------

      if (horario.disponible) {
        option.textContent = `${horaInicio} - ${horaFin} - 🟢 Disponible`;

        option.disabled = false;
      }

      // -----------------------------------------
      // NO DISPONIBLE
      // -----------------------------------------
      else {
        option.textContent = `${horaInicio} - ${horaFin} - 🔴 No disponible`;

        option.disabled = true;
      }

      horaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error consultando disponibilidad:", error);

    Swal.fire({
      icon: "error",
      title: "Error de disponibilidad",
      text: error.message,
    });
  }
};

// =====================================================
// FECHA
// =====================================================

const fechaReserva = document.getElementById("fechaReserva");

if (fechaReserva) {
  fechaReserva.min = obtenerFechaHoy();

  fechaReserva.addEventListener("change", () => {
    cargarHorarios();
  });
}

// =====================================================
// DURACIÓN
// =====================================================

const duracionInput = document.getElementById("duracion");

if (duracionInput) {
  duracionInput.addEventListener("change", () => {
    actualizarTotal();

    cargarHorarios();
  });
}

// =====================================================
// CAMBIO DE HORA
// =====================================================

const horaReserva = document.getElementById("horaReserva");

if (horaReserva) {
  horaReserva.addEventListener("change", () => {
    console.log("Hora seleccionada:", horaReserva.value);
  });
}

// =====================================================
// CONFIRMAR RESERVA
// =====================================================

const formReserva = document.getElementById("formReserva");

if (formReserva) {
  formReserva.addEventListener("submit", async function (event) {
    event.preventDefault();

    // =============================================
    // USUARIO
    // =============================================

    const usuario = await obtenerUsuarioActual();

    if (!usuario || !usuario.id) {

        Swal.fire({
            icon: "warning",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para realizar una reserva.",
            confirmButtonText: "Iniciar sesión"
        }).then(() => {

            window.location.href =
                "../auth/inicio-sesion.html";

        });

        return;
    }

    // =============================================
    // CANCHA
    // =============================================

    const cancha = await obtenerCancha();

    if (!cancha) {
      Swal.fire({
        icon: "error",
        title: "Cancha no encontrada",
        text: "No se encontró la cancha seleccionada.",
      });

      return;
    }

    // =============================================
    // DATOS
    // =============================================

    const fecha = document.getElementById("fechaReserva").value;

    const hora = document.getElementById("horaReserva").value;

    const duracion = Number(document.getElementById("duracion").value);

    // =============================================
    // VALIDAR FECHA
    // =============================================

    if (!fecha) {
      Swal.fire({
        icon: "warning",
        title: "Fecha requerida",
        text: "Debes seleccionar una fecha.",
      });

      return;
    }

    // =============================================
    // VALIDAR HORA
    // =============================================

    if (!hora) {
      Swal.fire({
        icon: "warning",
        title: "Hora requerida",
        text: "Debes seleccionar una hora disponible.",
      });

      return;
    }

    // =============================================
    // VALIDAR DURACIÓN
    // =============================================

    if (!duracion || duracion < 1 || duracion > 3) {
      Swal.fire({
        icon: "warning",
        title: "Duración inválida",
        text: "La duración debe ser de 1, 2 o 3 horas.",
      });

      return;
    }

    // =============================================
    // CONVERTIR HORA PARA JAVA
    // =============================================

    const horaInicio = hora.length === 5 ? `${hora}:00` : hora;

    // =============================================
    // REQUEST
    // =============================================

    const request = {
      canchaId: Number(cancha.id),

      fecha: fecha,

      horaInicio: horaInicio,

      duracion: duracion,
    };

    console.log("Enviando reserva:", request);

    // =============================================
    // DESACTIVAR BOTÓN
    // =============================================

    const botonSubmit = formReserva.querySelector('button[type="submit"]');

    if (botonSubmit) {
      botonSubmit.disabled = true;

      botonSubmit.dataset.textoOriginal = botonSubmit.textContent;

      botonSubmit.textContent = "Procesando...";
    }

    try {
      // =========================================
      // POST AL BACKEND
      // =========================================

      const reserva = await apiFetch("/api/reservas", {
          method: "POST",
          body: JSON.stringify(request),
      });

      // =========================================
      // ÉXITO
      // =========================================

      Swal.fire({
        icon: "success",
        title: "¡Reserva realizada!",
        text: `Tu reserva para ${cancha.nombreCancha} fue creada correctamente.`,
        confirmButtonText: "Ver mis reservas",
      }).then(() => {
        window.location.href = "./../usuario/mis-reservas.html";
      });
    } catch (error) {
      console.error("Error creando reserva:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo realizar la reserva",
        text: error.message,
      });
    } finally {
      if (botonSubmit) {
        botonSubmit.disabled = false;

        botonSubmit.textContent =
          botonSubmit.dataset.textoOriginal || "Confirmar reserva";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {

    const usuario = await verificarSesion();

    if (!usuario) {
        return;
    }

    await mostrarCancha();
});