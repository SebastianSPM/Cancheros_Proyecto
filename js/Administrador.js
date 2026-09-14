import { correoAdmin, claveAdmin } from "./inicio-sesion.js";

const API_CANCHAS_URL = "http://localhost:8081/api/canchas";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const formCancha = document.getElementById("formCancha");
const tablaCanchas = document.getElementById("tablaCanchas");
const salirbtn = document.getElementById("salirbtn");
const modalElement = document.getElementById("agregarCancha");
const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modalElement);

if (salirbtn) {
    salirbtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "./inicio-sesion.html";
    });
}

if (!currentUser || currentUser.email !== correoAdmin || currentUser.password !== claveAdmin) {
    window.location.href = "./inicio-sesion.html";
}

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

// GET: Obtener todas las canchas desde el backend
const obtenerCanchasBackend = async () => {
    try {
        const respuesta = await axios.get(API_CANCHAS_URL);
        return respuesta.data;
    } catch (error) {
        console.error("Error al obtener canchas:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudieron cargar las canchas del servidor."
        });
        return [];
    }
};

// Renderizar tabla del panel
const renderizar = async () => {
    tablaCanchas.innerHTML = `<tr><td colspan="10" class="text-center py-4">Cargando canchas...</td></tr>`;

    const canchas = await obtenerCanchasBackend();
    tablaCanchas.innerHTML = "";

    const totalEl = document.getElementById("totalCanchas");
    const disponiblesEl = document.getElementById("canchasDisponibles");
    const noDisponiblesEl = document.getElementById("canchasNoDisponibles");

    if (totalEl) totalEl.textContent = canchas.length;
    if (disponiblesEl) disponiblesEl.textContent = canchas.filter(c => c.disponible === true).length;
    if (noDisponiblesEl) noDisponiblesEl.textContent = canchas.filter(c => c.disponible === false).length;

    if (canchas.length === 0) {
        tablaCanchas.innerHTML = `
            <tr id="sinCanchas">
                <td colspan="10" class="mensaje-sin-canchas text-center py-4">
                    No hay canchas registradas en el servidor.
                </td>
            </tr>
        `;
        return;
    }

    canchas.forEach(cancha => {
        const fila = document.createElement("tr");
        const fotoUrl = cancha.imagenUrl || "../assets/images/canchas/cancha11.jpg";

        fila.innerHTML = `
            <td>${cancha.id}</td>
            <td>${cancha.disponible ? "Sí" : "No"}</td>
            <td>${cancha.descripcion || "Sin descripción"}</td>
            <td>${cancha.nombreCancha}</td>
            <td>${cancha.tipo}</td>
            <td>$${Number(cancha.precioPorHora).toLocaleString("es-CO")}</td>
            <td>${cancha.ubicacion}</td>
            <td>
                <img class="imagenPanel" src="${fotoUrl}" alt="${cancha.nombreCancha}" width="60" height="60" style="object-fit:cover; border-radius: 4px;" onerror="this.src='../assets/images/image.png'"/>
            </td>
            <td>
                <i class="bi bi-pencil-square fs-5 text-warning cursor-pointer" data-id="${cancha.id}" style="cursor:pointer"></i>
            </td>
            <td>
                <i class="trash-logo bi bi-trash fs-5 text-danger cursor-pointer" data-id="${cancha.id}" style="cursor:pointer"></i>
            </td>
        `;
        tablaCanchas.appendChild(fila);
    });
};

function nuevaCancha() {
    modalElement.removeAttribute("data-id-editar");
    formCancha.reset();
    document.querySelectorAll("#imagenesContainer .imagen-box").forEach(img => img.remove());
    document.getElementById("imagenCancha").value = "";
}

// Guardar cancha (POST / PUT)
const guardarCanchaBackend = async (payload, idEditar) => {
    try {
        if (idEditar) {
            await axios.put(`${API_CANCHAS_URL}/${idEditar}`, payload);
        } else {
            await axios.post(API_CANCHAS_URL, payload);
        }
        return true;
    } catch (error) {
        console.error("Error al guardar:", error);
        Swal.fire({
            icon: "error",
            title: "Error al guardar",
            text: error.response?.data?.message || "No se pudo sincronizar la cancha con el servidor."
        });
        return false;
    }
};

// Eliminar cancha (DELETE)
const eliminarCancha = (id) => {
    Swal.fire({
        title: "¿Eliminar cancha?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33"
    }).then((resultado) => {
        if (!resultado.isConfirmed) return;

        axios.delete(`${API_CANCHAS_URL}/${id}`)
            .then(() => {
                Swal.fire({
                    title: "Cancha eliminada",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                renderizar();
            })
            .catch((error) => {
                console.error("Fallo al eliminar:", error);
                Swal.fire({
                    icon: "error",
                    title: "No se pudo eliminar",
                    text: error.response?.data?.message || "Ocurrió un error en el servidor."
                });
            });
    });
};

// Cargar datos en el modal para editar (GET by ID)
const editarCancha = async (id) => {
    try {
        const respuesta = await axios.get(`${API_CANCHAS_URL}/${id}`);
        const cancha = respuesta.data;

        modalElement.dataset.idEditar = id;

        document.getElementById("nombreCancha").value = cancha.nombreCancha;
        document.getElementById("precio").value = cancha.precioPorHora;
        document.getElementById("ubicacion").value = cancha.ubicacion;
        document.getElementById("descripcion").value = cancha.descripcion;
        document.getElementById("form-select-tipo").value = cancha.tipo;

        const radioDisp = document.querySelector(`input[name="disponible"][value="${cancha.disponible}"]`);
        if (radioDisp) radioDisp.checked = true;

        const imagenesContainer = document.getElementById("imagenesContainer");
        imagenesContainer.querySelectorAll(".imagen-box").forEach(img => img.remove());

        if (cancha.imagenUrl) {
            imagenesContainer.insertAdjacentHTML("afterbegin", `
                <div class="imagen-box">
                    <img src="${cancha.imagenUrl}" alt="">
                    <button type="button"><i class="bi bi-trash"></i></button>
                </div>
            `);
        }

        modalBootstrap.show();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron obtener los datos de la cancha seleccionada."
        });
    }
};

formCancha.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombreCancha = document.getElementById("nombreCancha").value.trim();
    const precioPorHora = document.getElementById("precio").value.trim();
    const disponible = document.querySelector('input[name="disponible"]:checked')?.value === "true";
    const ubicacion = document.getElementById("ubicacion").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const tipo = document.getElementById("form-select-tipo").value;
    const idEditar = modalElement.dataset.idEditar;

    const primeraImagen = document.querySelector("#imagenesContainer .imagen-box img")?.src || "../assets/images/canchas/cancha11.jpg";

    if (!nombreCancha || !precioPorHora || !ubicacion || !tipo) {
        Swal.fire({
            icon: "error",
            title: "Campos incompletos",
            text: "Por favor diligencia los campos obligatorios."
        });
        return;
    }

    // Estructura exacta que espera CanchaDTO.java
    const payload = {
        nombreCancha,
        precioPorHora: parseFloat(precioPorHora),
        disponible,
        ubicacion,
        descripcion,
        tipo,
        rating: 4.8,
        totalResenas: 100,
        imagenUrl: primeraImagen
    };

    const guardadoExitoso = await guardarCanchaBackend(payload, idEditar);

    if (guardadoExitoso) {
        formCancha.reset();
        modalBootstrap.hide();
        modalElement.removeAttribute("data-id-editar");
        renderizar();

        Swal.fire({
            icon: "success",
            title: idEditar ? "Cancha actualizada" : "Cancha agregada con éxito",
            timer: 1500,
            showConfirmButton: false
        });
    }
});

tablaCanchas.addEventListener("click", (event) => {
    const btnEliminar = event.target.closest(".trash-logo");
    const btnEditar = event.target.closest(".bi-pencil-square");

    if (btnEliminar) {
        eliminarCancha(btnEliminar.dataset.id);
    } else if (btnEditar) {
        editarCancha(btnEditar.dataset.id);
    }
});

document.getElementById("imagenCancha").addEventListener("change", (event) => {
    Array.from(event.target.files).forEach(archivo => {
        const lector = new FileReader();
        lector.onload = () => {
            document.getElementById("imagenesContainer").insertAdjacentHTML("afterbegin", `
                <div class="imagen-box">
                    <img src="${lector.result}" alt="">
                    <button type="button"><i class="bi bi-trash"></i></button>
                </div>
            `);
        };
        lector.readAsDataURL(archivo);
    });
});

document.getElementById("imagenesContainer").addEventListener("click", (event) => {
    const boton = event.target.closest(".imagen-box button");
    if (boton) boton.closest(".imagen-box").remove();
});

document.getElementById("btnAgregarCancha")?.addEventListener("click", nuevaCancha);
document.addEventListener("DOMContentLoaded", renderizar);