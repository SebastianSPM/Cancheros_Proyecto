const API_URL = "http://localhost:8081/api/canchas";

const contenedor = document.getElementById("containerMain");
const conteoEl = document.getElementById("conteo");
const formSelectUbicacion = document.getElementById("form-select-ubicacion");
const formSelectTipo = document.getElementById("form-select-tipo");
const precioCancha = document.getElementById("precio-cancha");
const resetContainer = document.getElementById("reset");

const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));
let todasLasCanchas = [];

function mostrarSkeletons() {
    if (!contenedor) return;
    contenedor.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        contenedor.innerHTML += `
            <div class="col-lg-4 col-md-6">
                <div class="cancha-card">
                    <div class="card-img-wrapper placeholder col-12" style="height: 200px;"></div>
                    <div class="card-body-custom placeholder-glow">
                        <h5 class="placeholder col-7"></h5>
                        <span class="placeholder col-2"></span>
                        <div class="mt-2"><i class="placeholder col-5"></i></div>
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-secondary disabled placeholder col-6"></button>
                            <button class="btn btn-secondary disabled placeholder col-6"></button>
                        </div>
                    </div>
                </div>
            </div>`;
    }
}

function pintarTarjetas(lista) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (conteoEl) conteoEl.textContent = `Mostrando ${lista.length} resultados`;

    if (lista.length === 0) {
        contenedor.style.minHeight = "350px";
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="fw-bold text-muted">No hay canchas disponibles con esos criterios</h3>
            </div>`;
        return;
    }

    lista.forEach(cancha => {
        const imagenUrl = cancha.imagenUrl || "../assets/images/canchas/cancha11.jpg";
        const rating = cancha.rating || 4.8;
        const resenas = cancha.totalResenas || 100;

        contenedor.innerHTML += `
            <div class="col-lg-4 col-md-6">
                <div class="cancha-card">
                    <div class="card-img-wrapper">
                        <img src="${imagenUrl}" alt="${cancha.nombreCancha}" onerror="this.src='../assets/images/image.png'" />
                        <span class="badge-rating"><i class="fa-solid fa-star"></i> ${rating} (${resenas}+)</span>
                    </div>
                    <div class="card-body-custom">
                        <div class="card-header-info">
                            <h5 class="cancha-title">${cancha.nombreCancha}</h5>
                            <span class="badge-tipo">${cancha.tipo}</span>
                        </div>
                        <div class="cancha-location">
                            <i class="fa-solid fa-location-dot"></i> ${cancha.ubicacion}
                        </div>
                        <div class="amenities-list">
                            <span class="badge-amenity"><i class="fa-solid fa-mug-hot"></i> Cafetería</span>
                            <span class="badge-amenity"><i class="fa-solid fa-wifi"></i> Wi-Fi</span>
                            <span class="badge-amenity"><i class="fa-solid fa-square-parking"></i> Parking</span>
                        </div>
                        <div class="card-footer-custom flex-column align-items-stretch gap-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="price-label">Desde</span>
                                <div class="price-value">$${Number(cancha.precioPorHora).toLocaleString("es-CO")} <span>/hr</span></div>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-light btn-sm w-50 fw-semibold" 
                                    data-bs-toggle="modal"
                                    data-bs-target="#canchaModal"
                                    data-cancha-id="${cancha.id}">
                                    Ver Detalle
                                </button>
                                <button class="reserva btn btn-reservar btn-sm w-50 text-center"
                                    data-cancha-id="${cancha.id}">
                                    Reservar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

async function obtenerCanchas() {
    mostrarSkeletons();
    try {
        const respuesta = await axios.get(API_URL);
        todasLasCanchas = respuesta.data;
        pintarTarjetas(todasLasCanchas);
    } catch (error) {
        console.error("Error al consultar catálogo:", error);
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger d-inline-block">
                        No fue posible conectar con el servidor para obtener las canchas.
                    </div>
                </div>`;
        }
    }
}

function filtrarCancha() {
    let resultado = [...todasLasCanchas];

    if (formSelectUbicacion && formSelectUbicacion.value !== "Selecciona localidad") {
        resultado = resultado.filter(c => {
            if (!c.ubicacion) return false;
            const localidad = c.ubicacion.split(",")[0].trim().toLowerCase();
            return localidad === formSelectUbicacion.value.trim().toLowerCase();
        });
    }

    if (formSelectTipo && formSelectTipo.value !== "Modalidad") {
        resultado = resultado.filter(c => c.tipo === formSelectTipo.value);
    }

    if (precioCancha && precioCancha.value !== "") {
        resultado = resultado.filter(c => Number(c.precioPorHora) <= Number(precioCancha.value));
    }

    pintarTarjetas(resultado);
}

const modalCanchas = () => {
    const canchaModal = document.getElementById("canchaModal");
    if (!canchaModal) return;

    canchaModal.addEventListener("shown.bs.modal", (event) => {
        const boton = event.relatedTarget;
        const idCancha = boton.dataset.canchaId;
        const cancha = todasLasCanchas.find(c => String(c.id) === String(idCancha));

        if (!cancha) return;

        const foto = cancha.imagenUrl || "../assets/images/image.png";

        const modalImg1 = document.getElementById("modalImagen");
        const modalImg2 = document.getElementById("modalImagen2");

        if (modalImg1) {
            modalImg1.src = foto;
            modalImg1.alt = cancha.nombreCancha;
        }
        if (modalImg2) {
            modalImg2.src = foto;
        }

        document.getElementById("modalNombre").textContent = cancha.nombreCancha;
        document.getElementById("modalUbicacion").textContent = cancha.ubicacion;
        document.getElementById("modalPrecio").textContent = `$${Number(cancha.precioPorHora).toLocaleString("es-CO")} /hr`;

        const btnReservarModal = canchaModal.querySelector(".reserva");
        if (btnReservarModal) btnReservarModal.dataset.canchaId = idCancha;
    });
};

function irReservar() {
    document.addEventListener("click", (event) => {
        const boton = event.target.closest(".reserva");
        if (!boton) return;

        if (!isLoggedIn) {
            window.location.href = "./inicio-sesion.html";
        } else {
            window.location.href = `./reservas.html?id=${boton.dataset.canchaId}`;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    obtenerCanchas();
    modalCanchas();
    irReservar();

    if (formSelectUbicacion) formSelectUbicacion.addEventListener("change", filtrarCancha);
    if (formSelectTipo) formSelectTipo.addEventListener("change", filtrarCancha);
    if (precioCancha) precioCancha.addEventListener("input", filtrarCancha);
});