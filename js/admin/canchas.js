import { apiFetch } from "../api/api.js";

let imagenesSeleccionadas = [];
let imagenesExistentes = [];

// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

const formCancha = document.getElementById("formCancha");
const tablaCanchas = document.getElementById("tablaCanchas");
const modalElement = document.getElementById("agregarCancha");
const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);
const modalImagenesElement = document.getElementById("modalImagenes");

const modalImagenesBootstrap =bootstrap.Modal.getOrCreateInstance(modalImagenesElement);

// =========================================================
// MODAL DE IMÁGENES
// =========================================================

const gestionarImagenes =
    document.getElementById(
        "gestionarImagenes"
    );

const btnListoImagenes =
    document.getElementById(
        "btnListoImagenes"
    );

const btnCerrarImagenes =
    document.getElementById(
        "btnCerrarImagenes"
    );

const btnCerrarImagenesX =
    document.getElementById(
        "btnCerrarImagenesX"
    );


// =========================================================
// ABRIR MODAL DE IMÁGENES
// =========================================================

gestionarImagenes?.addEventListener(
    "click",
    () => {

        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {

                modalImagenesBootstrap.show();

            },
            { once: true }
        );

        modalBootstrap.hide();
    }
);


// =========================================================
// VOLVER AL MODAL DE CANCHA
// =========================================================

const volverModalCancha = () => {

    modalImagenesElement.addEventListener(
        "hidden.bs.modal",
        () => {

            modalBootstrap.show();

        },
        { once: true }
    );

    modalImagenesBootstrap.hide();
};


// =========================================================
// LISTO
// =========================================================

btnListoImagenes?.addEventListener(
    "click",
    volverModalCancha
);


// =========================================================
// CERRAR
// =========================================================

btnCerrarImagenes?.addEventListener(
    "click",
    volverModalCancha
);

btnCerrarImagenesX?.addEventListener(
    "click",
    volverModalCancha
);


// =========================================================
// OBTENER CANCHAS
// =========================================================
const obtenerCanchasBackend = async () => {

    try {

        const respuesta = await apiFetch("/api/canchas");

        return respuesta.content;

    } catch (error) {

        console.error(
            "Error al obtener canchas:",
            error
        );

        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudieron cargar las canchas del servidor."
        });

        return [];
    }
};



// =========================================================
// RENDERIZAR TABLA
// =========================================================

const renderizar = async () => {

    tablaCanchas.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">
                Cargando canchas...
            </td>
        </tr>
    `;

    const canchas = await obtenerCanchasBackend();

    tablaCanchas.innerHTML = "";

    const totalEl =
        document.getElementById("totalCanchas");

    const disponiblesEl =
        document.getElementById("canchasDisponibles");

    const noDisponiblesEl =
        document.getElementById("canchasNoDisponibles");


    if (totalEl) {
        totalEl.textContent = canchas.length;
    }

    if (disponiblesEl) {
        console.log(canchas);
        
        disponiblesEl.textContent =
            canchas.filter(
                cancha => cancha.disponible === true
            ).length;
    }

    if (noDisponiblesEl) {
        noDisponiblesEl.textContent =
            canchas.filter(
                cancha => cancha.disponible === false
            ).length;
    }


    if (canchas.length === 0) {

        tablaCanchas.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="mensaje-sin-canchas text-center py-4"
                >
                    No hay canchas registradas en el servidor.
                </td>
            </tr>
        `;

        return;
    }


    canchas.forEach(cancha => {

        const fila = document.createElement("tr");

        const imagenes =
            Array.isArray(cancha.imagenes) &&
            cancha.imagenes.length > 0
                ? cancha.imagenes
                : cancha.imagenUrl
                    ? [cancha.imagenUrl]
                    : ["../../assets/images/canchas/cancha11.jpg"];

        fila.innerHTML = `
            <td>${cancha.id}</td>

            <td>
                ${cancha.disponible ? "Sí" : "No"}
            </td>

            <td>
                ${cancha.descripcion || "Sin descripción"}
            </td>

            <td>
                ${cancha.nombreCancha}
            </td>

            <td>
                ${cancha.tipo}
            </td>

            <td>
                $${Number(
                    cancha.precioPorHora
                ).toLocaleString("es-CO")}
            </td>

            <td>
                ${cancha.ubicacion}
            </td>

            <td>
                <div class="d-flex gap-2 flex-wrap">

                    ${imagenes.map(imagen => `
                        <img
                            class="imagenPanel"
                            src="${imagen}"
                            alt="${cancha.nombreCancha}"
                            width="60"
                            height="60"
                            style="
                                object-fit: cover;
                                border-radius: 4px;
                            "
                            onerror="this.src='../../assets/images/image.png'"
                        >
                    `).join("")}

                </div>
            </td>

            <td>
                <i
                    class="bi bi-pencil-square fs-5 text-warning cursor-pointer"
                    data-id="${cancha.id}"
                    style="cursor: pointer"
                ></i>
            </td>

            <td>
                <i
                    class="trash-logo bi bi-trash fs-5 text-danger cursor-pointer"
                    data-id="${cancha.id}"
                    style="cursor: pointer"
                ></i>
            </td>
        `;

        tablaCanchas.appendChild(fila);
    });
};


// =========================================================
// PREPARAR NUEVA CANCHA
// =========================================================

function nuevaCancha() {

    modalElement.removeAttribute(
        "data-id-editar"
    );

    formCancha.reset();

    imagenesSeleccionadas = [];
    imagenesExistentes = [];

    renderizarImagenes();

    document.getElementById(
        "imagenCancha"
    ).value = "";
}


// =========================================================
// GUARDAR CANCHA
// POST / PUT
// =========================================================

const guardarCanchaBackend =
    async (
        payload,
        idEditar,
        archivos
    ) => {

        try {

            let cancha;


            // =========================================
            // CREAR
            // =========================================

            if (!idEditar) {

                cancha = await apiFetch(
                    "/api/canchas",
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            }


            // =========================================
            // EDITAR
            // =========================================

            else {

                cancha = await apiFetch(
                    `/api/canchas/${idEditar}`,
                    {
                        method: "PUT",
                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );
            }


            // =========================================
            // SUBIR IMÁGENES
            // =========================================

            if (
                archivos &&
                archivos.length > 0
            ) {

                const formData =
                    new FormData();

                archivos.forEach(
                    archivo => {

                        formData.append(
                            "imagenes",
                            archivo
                        );
                    }
                );


                cancha = await apiFetch(
                    `/api/canchas/${cancha.id}/imagenes`,
                    {
                        method: "POST",
                        body: formData
                    }
                );
            }


            return cancha;


        } catch (error) {

            console.error(
                "Error al guardar:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Error al guardar",
                text:
                    error.message ||
                    "No se pudo guardar la cancha."
            });

            return null;
        }
    };


// =========================================================
// ELIMINAR CANCHA
// =========================================================

const eliminarCancha = (id) => {

    Swal.fire({

        title: "¿Eliminar cancha?",

        text:
            "Esta acción no se puede deshacer.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
            "Sí, eliminar",

        cancelButtonText:
            "Cancelar",

        confirmButtonColor:
            "#d33"

    }).then(async resultado => {

        if (!resultado.isConfirmed) {
            return;
        }

        try {

            await apiFetch(
                `/api/canchas/${id}`,
                {
                    method: "DELETE"
                }
            );

            await Swal.fire({
                title: "Cancha eliminada",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            renderizar();

        } catch (error) {

            console.error(
                "Fallo al eliminar:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "No se pudo eliminar",
                text:
                    error.message ||
                    "Ocurrió un error en el servidor."
            });
        }
    });
};


// =========================================================
// EDITAR CANCHA
// =========================================================

const editarCancha = async (id) => {

    try {

        const cancha =
            await apiFetch(
                `/api/canchas/${id}`
            );


        modalElement.dataset.idEditar = id;

        document.getElementById(
            "nombreCancha"
        ).value = cancha.nombreCancha;

        document.getElementById(
            "precio"
        ).value = cancha.precioPorHora;

        document.getElementById(
            "ubicacion"
        ).value = cancha.ubicacion;

        document.getElementById(
            "descripcion"
        ).value = cancha.descripcion;

        document.getElementById(
            "form-select-tipo"
        ).value = cancha.tipo;


        const radioDisp =
            document.querySelector(
                `input[name="disponible"][value="${cancha.disponible}"]`
            );

        if (radioDisp) {
            radioDisp.checked = true;
        }


        imagenesSeleccionadas = [];

        imagenesExistentes =
            Array.isArray(cancha.imagenes)
                ? [...cancha.imagenes]
                : cancha.imagenUrl
                    ? [cancha.imagenUrl]
                    : [];

        renderizarImagenes();


        modalBootstrap.show();

    } catch (error) {

        console.error(
            "Error al obtener cancha:",
            error
        );

        Swal.fire({
            icon: "error",
            title: "Error",
            text:
                "No se pudieron obtener los datos de la cancha seleccionada."
        });
    }
};


// =========================================================
// SUBMIT DEL FORMULARIO
// =========================================================

formCancha.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const nombreCancha =
            document
                .getElementById("nombreCancha")
                .value
                .trim();

        const precioPorHora =
            document
                .getElementById("precio")
                .value
                .trim();

        const disponible =
            document.querySelector(
                'input[name="disponible"]:checked'
            )?.value === "true";

        const ubicacion =
            document
                .getElementById("ubicacion")
                .value
                .trim();

        const descripcion =
            document
                .getElementById("descripcion")
                .value
                .trim();

        const tipo =
            document
                .getElementById("form-select-tipo")
                .value;

        const idEditar =
            modalElement.dataset.idEditar;


        if (
            !nombreCancha ||
            !precioPorHora ||
            !ubicacion ||
            !tipo
        ) {

            Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text:
                    "Por favor diligencia los campos obligatorios."
            });

            return;
        }


        const payload = {

            nombreCancha,

            precioPorHora:
                parseFloat(precioPorHora),

            disponible,

            ubicacion,

            descripcion,

            tipo,

            // Se mantienen temporalmente
            // hasta que definamos cómo se calcularán
            // realmente estos valores.
            rating: 4.8,

            totalResenas: 100,
        };

        const canchaGuardada =
            await guardarCanchaBackend(
                payload,
                idEditar,
                imagenesSeleccionadas
            );

        if (canchaGuardada) {

            formCancha.reset();

            modalBootstrap.hide();

            modalElement.removeAttribute(
                "data-id-editar"
            );

            imagenesSeleccionadas = [];
            imagenesExistentes = [];

            renderizarImagenes();

            await renderizar();

            Swal.fire({
                icon: "success",
                title:
                    idEditar
                        ? "Cancha actualizada"
                        : "Cancha agregada con éxito",
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
);


// =========================================================
// EVENTOS DE TABLA
// =========================================================

tablaCanchas.addEventListener(
    "click",
    event => {

        const btnEliminar =
            event.target.closest(
                ".trash-logo"
            );

        const btnEditar =
            event.target.closest(
                ".bi-pencil-square"
            );


        if (btnEliminar) {

            eliminarCancha(
                btnEliminar.dataset.id
            );

        } else if (btnEditar) {

            editarCancha(
                btnEditar.dataset.id
            );
        }
    }
);


// =========================================================
// IMÁGENES
// =========================================================

const inputImagen =
    document.getElementById("imagenCancha");

const imagenesContainer =
    document.getElementById(
        "imagenesContainer"
    );


// =========================================================
// RENDERIZAR PREVISUALIZACIONES
// =========================================================

const renderizarImagenes = () => {

    imagenesContainer
        .querySelectorAll(".imagen-box")
        .forEach(imagen => {
            imagen.remove();
        });


    // =============================================
    // IMÁGENES EXISTENTES
    // =============================================

    imagenesExistentes.forEach(url => {

        const caja =
            document.createElement("div");

        caja.className = "imagen-box";

        caja.innerHTML = `
            <img
                src="${url}"
                alt=""
            >
        `;

        imagenesContainer
            .appendChild(caja);
    });


    // =============================================
    // IMÁGENES NUEVAS
    // =============================================

    imagenesSeleccionadas.forEach(
        (archivo, index) => {

            const lector =
                new FileReader();

            lector.onload = () => {

                const caja =
                    document.createElement(
                        "div"
                    );

                caja.className =
                    "imagen-box";

                caja.innerHTML = `
                    <img
                        src="${lector.result}"
                        alt="${archivo.name}"
                    >

                    <button
                        type="button"
                        data-index="${index}"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                `;

                imagenesContainer
                    .appendChild(caja);
            };

            lector.readAsDataURL(
                archivo
            );
        }
    );
};


// =========================================================
// SELECCIONAR IMÁGENES
// =========================================================

inputImagen.addEventListener(
    "change",
    event => {

        const archivos =
            Array.from(
                event.target.files
            );

        const totalActual =
            imagenesExistentes.length +
            imagenesSeleccionadas.length;

        const espacioDisponible =
            3 - totalActual;

        if (espacioDisponible <= 0) {

            Swal.fire({
                icon: "warning",
                title: "Límite alcanzado",
                text:
                    "Una cancha puede tener máximo 3 imágenes."
            });

            inputImagen.value = "";

            return;
        }


        const nuevosArchivos =
            archivos.slice(
                0,
                espacioDisponible
            );


        imagenesSeleccionadas.push(
            ...nuevosArchivos
        );


        if (
            archivos.length >
            espacioDisponible
        ) {

            Swal.fire({
                icon: "info",
                title: "Máximo 3 imágenes",
                text:
                    "Solo se agregaron las imágenes permitidas."
            });
        }


        // Permitimos volver a seleccionar
        // los mismos archivos si se desea.
        inputImagen.value = "";

        renderizarImagenes();
    }
);


// =========================================================
// ELIMINAR IMAGEN NUEVA
// =========================================================

imagenesContainer.addEventListener(
    "click",
    event => {

        const boton =
            event.target.closest(
                ".imagen-box button"
            );

        if (!boton) {
            return;
        }

        const index =
            Number(
                boton.dataset.index
            );

        imagenesSeleccionadas.splice(
            index,
            1
        );

        renderizarImagenes();
    }
);


// =========================================================
// NUEVA CANCHA
// =========================================================

document
    .getElementById("btnAgregarCancha")
    ?.addEventListener(
        "click",
        nuevaCancha
    );


// =========================================================
// CARGAR CANCHAS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    renderizar
);