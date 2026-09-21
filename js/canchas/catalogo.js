import { apiFetch } from "../api/api.js";

const contenedor = document.getElementById("containerMain");
const conteoEl = document.getElementById("conteo");
const formSelectUbicacion = document.getElementById("form-select-ubicacion");
const formSelectTipo = document.getElementById("form-select-tipo");
const precioCancha = document.getElementById("precio-cancha");
const resetContainer = document.getElementById("reset");
const paginacionCanchas = document.getElementById("paginacionCanchas");
const btnResetFiltros = document.getElementById("btnResetFiltros");

let todasLasCanchas = [];
let filtrosActuales = {
    ubicacion: "",
    tipo: "",
    precioMax: ""
};
const cargarImagenConPlaceholder = (imagen, placeholder, url, alt) => {

    if (!imagen || !placeholder) return;

    // Mostrar placeholder
    placeholder.classList.remove("d-none");

    // Ocultar imagen
    imagen.classList.add("d-none");

    imagen.alt = alt;

    // Cuando la imagen termine de cargar
    imagen.onload = () => {
        placeholder.classList.add("d-none");
        imagen.classList.remove("d-none");
    };

    // Si la imagen falla
    imagen.onerror = () => {
        imagen.src = "../assets/images/image.png";
    };

    // Asignar URL
    imagen.src = url;
};

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

function obtenerImagenes(cancha) {
    if (Array.isArray(cancha.imagenes) && cancha.imagenes.length > 0) {
        return cancha.imagenes;
    }

    if (cancha.imagenUrl) {
        return [cancha.imagenUrl];
    }

    return ["./../../assets/images/canchas/cancha11.jpg"];
}
function pintarTarjetas(lista, totalElementos = null) {

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (conteoEl) {
        conteoEl.textContent =
            totalElementos !== null
                ? `Mostrando ${lista.length} de ${totalElementos} resultados`
                : `Mostrando ${lista.length} resultados`;
    }

    if (lista.length === 0) {

        contenedor.style.minHeight = "350px";

        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="fw-bold text-white">
                    No hay canchas disponibles con esos criterios
                </h3>
            </div>
        `;

        return;
    }

    lista.forEach(cancha => {

        const imagenes = obtenerImagenes(cancha);

        const rating = cancha.rating || 4.8;
        const resenas = cancha.totalResenas || 100;

        const carouselId = `carouselCancha${cancha.id}`;

        const slides = imagenes.map((imagen, index) => `
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <img
                    src="${imagen}"
                    class="d-block w-100"
                    alt="${cancha.nombreCancha}"
                    style="height: 200px; object-fit: cover;"
                    onerror="this.onerror=null; this.src='./../../assets/images/image.png';"
                />
            </div>
        `).join("");

        contenedor.innerHTML += `
            <div class="col-lg-4 col-md-6">

                <div class="cancha-card">

                    <div class="card-img-wrapper">

                        <div
                            id="${carouselId}"
                            class="carousel slide"
                            data-bs-ride="false"
                        >

                            <div class="carousel-inner">
                                ${slides}
                            </div>

                        </div>

                        <span class="badge-rating">
                            <i class="fa-solid fa-star"></i>
                            ${rating} (${resenas}+)
                        </span>

                    </div>

                    <div class="card-body-custom">

                        <div class="card-header-info">

                            <h5 class="cancha-title">
                                ${cancha.nombreCancha}
                            </h5>

                            <span class="badge-tipo">
                                ${cancha.tipo}
                            </span>

                        </div>

                        <div class="cancha-location">

                            <i class="fa-solid fa-location-dot"></i>
                            ${cancha.ubicacion}

                        </div>

                        <div class="amenities-list">

                            <span class="badge-amenity">
                                <i class="fa-solid fa-mug-hot"></i>
                                Cafetería
                            </span>

                            <span class="badge-amenity">
                                <i class="fa-solid fa-wifi"></i>
                                Wi-Fi
                            </span>

                            <span class="badge-amenity">
                                <i class="fa-solid fa-square-parking"></i>
                                Parking
                            </span>

                        </div>

                        <div class="card-footer-custom flex-column align-items-stretch gap-2">

                            <div class="d-flex justify-content-between align-items-center">

                                <span class="price-label">
                                    Desde
                                </span>

                                <div class="price-value">
                                    $${Number(cancha.precioPorHora).toLocaleString("es-CO")}
                                    <span>/hr</span>
                                </div>

                            </div>

                            <div class="d-flex gap-2">

                                <button
                                    class="btn btn-outline-light btn-sm w-50 fw-semibold"
                                    data-bs-toggle="modal"
                                    data-bs-target="#canchaModal"
                                    data-cancha-id="${cancha.id}"
                                >
                                    Ver Detalle
                                </button>

                                <button
                                    class="reserva btn btn-reservar btn-sm w-50 text-center"
                                    data-cancha-id="${cancha.id}"
                                >
                                    Reservar
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;
    });
}


function crearPaginacion(data) {

    if (!paginacionCanchas) return;

    paginacionCanchas.innerHTML = "";

    const paginaActual = data.number;
    const totalPaginas = data.totalPages;

    // Previous
    paginacionCanchas.innerHTML += `
        <li class="page-item ${data.first ? "disabled" : ""}">
            <a
                href="#"
                class="atras page-link"
                data-page="${paginaActual - 1}"
            >
                Atrás
            </a>
        </li>
    `;

    // Números
    for (let i = 0; i < totalPaginas; i++) {

        paginacionCanchas.innerHTML += `
            <li class="page-item ${i === paginaActual ? "active" : ""}">
                <a
                    href="#"
                    class="page-link"
                    data-page="${i}"
                    ${i === paginaActual
                        ? 'aria-current="page"'
                        : ""}
                >
                    ${i + 1}
                </a>
            </li>
        `;
    }

    // Next
    paginacionCanchas.innerHTML += `
        <li class="page-item ${data.last ? "disabled" : ""}">
            <a
                href="#"
                class="siguiente page-link"
                data-page="${paginaActual + 1}"
            >
                Siguiente
            </a>
        </li>
    `;
}

if (paginacionCanchas) {

    paginacionCanchas.addEventListener("click", (event) => {

        event.preventDefault();

        const enlace = event.target.closest(".page-link");

        if (!enlace) return;

        const item = enlace.closest(".page-item");

        if (item.classList.contains("disabled")) {
            return;
        }

        const pagina = Number(enlace.dataset.page);

        obtenerCanchas(pagina);
    });
}


async function obtenerCanchas(pagina = 0) {

    mostrarSkeletons();

    try {

        const parametros = new URLSearchParams({
            page: pagina,
            size: 6
        });

        if (filtrosActuales.ubicacion) {
            parametros.append(
                "ubicacion",
                filtrosActuales.ubicacion
            );
        }

        if (filtrosActuales.tipo) {
            parametros.append(
                "tipo",
                filtrosActuales.tipo
            );
        }

        if (filtrosActuales.precioMax) {
            parametros.append(
                "precioMax",
                filtrosActuales.precioMax
            );
        }

        const respuesta = await apiFetch(
            `/api/canchas?${parametros.toString()}`
        );

        todasLasCanchas = respuesta.content;

        pintarTarjetas(
            todasLasCanchas,
            respuesta.totalElements
        );

        crearPaginacion(respuesta);

    } catch (error) {

        console.error(
            "Error al obtener las canchas:",
            error
        );

        contenedor.innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar las canchas.
            </div>
        `;
    }
}

async function resetearFiltros() {

    filtrosActuales = {
        ubicacion: "",
        tipo: "",
        precioMax: ""
    };

    if (formSelectUbicacion) {
        formSelectUbicacion.value = "Selecciona localidad";
    }

    if (formSelectTipo) {
        formSelectTipo.value = "Modalidad";
    }

    if (precioCancha) {
        precioCancha.value = "";
    }

    await obtenerCanchas(0);
}

async function filtrarCancha() {

    filtrosActuales.ubicacion =
        formSelectUbicacion &&
        formSelectUbicacion.value !== "Selecciona localidad"
            ? formSelectUbicacion.value.trim()
            : "";

    filtrosActuales.tipo =
        formSelectTipo &&
        formSelectTipo.value !== "Modalidad"
            ? formSelectTipo.value.trim()
            : "";

    filtrosActuales.precioMax =
        precioCancha &&
        precioCancha.value !== ""
            ? precioCancha.value
            : "";

    // Cuando cambia un filtro, volvemos a la primera página
    await obtenerCanchas(0);
}

const modalCanchas = () => {

    const canchaModal = document.getElementById("canchaModal");

    if (!canchaModal) return;

    canchaModal.addEventListener("shown.bs.modal", (event) => {

        const boton = event.relatedTarget;
        const idCancha = boton.dataset.canchaId;

        const cancha = todasLasCanchas.find(
            c => String(c.id) === String(idCancha)
        );

        if (!cancha) return;

        const imagenes = obtenerImagenes(cancha);

        const foto1 = imagenes[0] || "../assets/images/image.png";
        const foto2 = imagenes[1] || foto1;
        const foto3 = imagenes[2] || foto1;

        const modalImg1 = document.getElementById("modalImagen");
        const modalImg2 = document.getElementById("modalImagen2");
        const modalImg3 = document.getElementById("modalImagen3");

        const placeholder1 = document.getElementById("placeholderImagen1");
        const placeholder2 = document.getElementById("placeholderImagen2");
        const placeholder3 = document.getElementById("placeholderImagen3");

        cargarImagenConPlaceholder(
            modalImg1,
            placeholder1,
            foto1,
            cancha.nombreCancha
        );

        cargarImagenConPlaceholder(
            modalImg2,
            placeholder2,
            foto2,
            cancha.nombreCancha
        );

        cargarImagenConPlaceholder(
            modalImg3,
            placeholder3,
            foto3,
            cancha.nombreCancha
        );

        document.getElementById("modalNombre").textContent =
            cancha.nombreCancha;

        document.getElementById("modalUbicacion").textContent =
            cancha.ubicacion;

        document.getElementById("modalPrecio").textContent =
            `$${Number(cancha.precioPorHora).toLocaleString("es-CO")} /hr`;

        const btnReservarModal = canchaModal.querySelector(".reserva");

        if (btnReservarModal) {
            btnReservarModal.dataset.canchaId = idCancha;
        }
    });
};

async function irReservar() {

    document.addEventListener("click", async (event) => {

        const boton = event.target.closest(".reserva");

        if (!boton) {
            return;
        }

        // Evitar doble clic
        if (boton.disabled) {
            return;
        }

        boton.disabled = true;

        try {

            // Comprobar sesión
            await apiFetch("/api/perfil");

            // Usuario autenticado
            window.location.href =
                `./reservas.html?id=${boton.dataset.canchaId}`;

        } catch (error) {

            await Swal.fire({
                icon: "info",
                title: "Inicia sesión",
                text: "Debes iniciar sesión para realizar una reserva.",
                confirmButtonText: "Iniciar sesión"
            });

            window.location.href =
                "../auth/inicio-sesion.html";

        } finally {

            setTimeout(() => {
                boton.disabled = false;
            }, 3000);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    if (resetContainer) {
        resetContainer.innerHTML = `
            <button
                type="button"
                id="btnResetFiltros"
                class="btn btn-outline-secondary"
            >
                <i class="bi bi-arrow-counterclockwise"></i>
                Restablecer filtros
            </button>
        `;

        const btnResetFiltros =
            document.getElementById("btnResetFiltros");

        btnResetFiltros.addEventListener(
            "click",
            resetearFiltros
        );
    }

    obtenerCanchas();
    modalCanchas();
    irReservar();

    if (formSelectUbicacion) {
        formSelectUbicacion.addEventListener(
            "change",
            filtrarCancha
        );
    }

    if (formSelectTipo) {
        formSelectTipo.addEventListener(
            "change",
            filtrarCancha
        );
    }

    if (precioCancha) {
        precioCancha.addEventListener(
            "input",
            filtrarCancha
        );
    }
});