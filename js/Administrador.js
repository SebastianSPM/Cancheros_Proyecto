import { correoAdmin } from "./inicio-sesion.js"
import { claveAdmin } from "./inicio-sesion.js";

//const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"))
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const formCancha = document.getElementById("formCancha");
const tablaCanchas = document.getElementById("tablaCanchas");
const salirbtn = document.getElementById("salirbtn");

salirbtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser")
    window.location.href = "./inicio-sesion.html"
})

if(currentUser.email != correoAdmin && currentUser.password != claveAdmin){
    window.location.href = "./inicio-sesion.html"
}

//Si intentan regresar a una pestaña anterior sin estar logueado lo devuelve al inicio sesión
window.addEventListener("pageshow", (event) => {

    if (event.persisted) {
        window.location.reload();
    }

});

//Se obtienen las canchas creadas por el administrador
const obtenerCanchas = () => {
    return JSON.parse(localStorage.getItem("canchas")) || [];
};

//creando cancha
function nuevaCancha() {

    const modal = document.getElementById("agregarCancha");
    const imagenesContainer = document.getElementById("imagenesContainer");

    // Quitar estado de edición
    modal.removeAttribute("data-id-editar");

    // Limpiar formulario
    formCancha.reset();

    // Limpiar imágenes anteriores
    imagenesContainer
        .querySelectorAll(".imagen-box")
        .forEach(imagen => imagen.remove());

    // Limpiar input de archivos
    document.getElementById("imagenCancha").value = "";
}

const agregarCancha = async (
    nombreCancha,
    precio,
    disponible,
    imagenCancha,
    ubicacion,
    descripcion,
    forSelectTipo
) => {

    const canchas = obtenerCanchas();

    const modal = document.getElementById("agregarCancha");
    const idEditar = modal.dataset.idEditar;

    const imagenes = Array.from(
        document.querySelectorAll("#imagenesContainer .imagen-box img")
    ).map(imagen => imagen.src);

    // Si existe un id, estamos editando
    if (idEditar !== undefined) {

        const cancha = canchas.find(
            cancha => cancha.id === Number(idEditar)
        );

        if (!cancha) {
            return;
        }

        cancha.nombreCancha = nombreCancha.value;
        cancha.precio = precio.value;
        cancha.ubicacion = ubicacion.value;
        cancha.descripcion = descripcion.value;
        cancha.tipo = forSelectTipo.value;
        cancha.disponible = disponible.value === "true";
        cancha.imagen = imagenes;

    } else {

        // Si no existe id, estamos creando
        const nuevoId = canchas.length > 0
            ? Math.max(...canchas.map(cancha => cancha.id)) + 1
            : 1;

        const otraCancha = {
            id: nuevoId,
            disponible: disponible.value === "true",
            descripcion: descripcion.value,
            nombreCancha: nombreCancha.value,
            tipo: forSelectTipo.value,
            precio: precio.value,
            ubicacion: ubicacion.value,
            imagen: imagenes
        };

        canchas.push(otraCancha);
    }

    guardarCanchas(canchas);
    renderizar();

    // Después de guardar, vuelve a estado "nueva cancha"
    modal.removeAttribute("data-id-editar");
};

const guardarCanchas = (canchas) => {
    localStorage.setItem("canchas", JSON.stringify(canchas));
};

//Si no hay canchas se muestra mensaje
const mostrarMensajeSinCancha = () => {
    tablaCanchas.innerHTML = `
        <tr id="sinCanchas">
            <td colspan="8" id="mensajeSinCanchas" colspan="7" class="mensaje-sin-canchas">
                No hay canchas agregadas todavía.
            </td>
        </tr>
    `
}

const renderizar = () => {
    const canchas = obtenerCanchas();
    
    tablaCanchas.innerHTML = "";

    document.getElementById("totalCanchas").textContent = canchas.length;

    document.getElementById("canchasDisponibles").textContent = canchas.filter(cancha => cancha.disponible === true).length

    document.getElementById("canchasNoDisponibles").textContent = canchas.filter(cancha => cancha.disponible === false).length;

    if (canchas.length === 0) {
        mostrarMensajeSinCancha();
        return;
    }

    canchas.forEach(cancha => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cancha.id}</td>
            <td>${cancha.disponible ? "Si" : "No"}</td>
            <td>${cancha.descripcion}</td>
            <td>${cancha.nombreCancha}</td>
            <td>${cancha.tipo}</td>
            <td>$${cancha.precio}</td>
            <td>${cancha.ubicacion}</td>
            <td>
                <img class="imagenPanel" src="${cancha.imagen[0]}" alt="${cancha.nombreCancha}" width="60" height="60" />
            </td>
            <td>
                <i class="bi bi-pencil-square"  data-id="${cancha.id}"></i>
            </td>
            <td>
                <i class="trash-logo bi bi-trash fs-3" data-id="${cancha.id}"></i>
            </td>
        `;

        tablaCanchas.appendChild(fila);
    })
}

const eliminarCancha = (id) => {

    //Eliminar la cancha desde json sin db
    Swal.fire({
        title: "¿Eliminar cancha?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33"
    }).then((resultado) => {

        if (!resultado.isConfirmed) {
            return;
        }

        const canchas = obtenerCanchas();
        const nuevasCanchas = canchas.filter(
            cancha => cancha.id !== id
        );

        guardarCanchas(nuevasCanchas);

        renderizar();

        Swal.fire({
            title: "Cancha eliminada",
            icon: "success"
        });
    });
};

const modalPrincipal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("agregarCancha")
);

const modalImagenes = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalImagenes")
);


// Gestiona el evento del modal para las imagenes
document.getElementById("gestionarImagenes").addEventListener("click", () => {

    modalPrincipal.hide();

});

document.getElementById("modalImagenes").addEventListener("hidden.bs.modal", () => {

    modalPrincipal.show();

});


// Editar la cancha
const editarCancha = (id) => {

    const canchas = obtenerCanchas();

    const cancha = canchas.find(cancha => cancha.id === id);

    if (!cancha) {
        return;
    }

    // Indica que estamos editando esta cancha
    document.getElementById("agregarCancha").dataset.idEditar = id;

    const imagenesContainer = document.getElementById("imagenesContainer");

    document.getElementById("nombreCancha").value = cancha.nombreCancha;
    document.getElementById("precio").value = cancha.precio;
    document.getElementById("ubicacion").value = cancha.ubicacion;
    document.getElementById("descripcion").value = cancha.descripcion;
    document.getElementById("form-select-tipo").value = cancha.tipo;

    document.querySelector(
        `input[name="disponible"][value="${cancha.disponible}"]`
    ).checked = true;

    imagenesContainer
        .querySelectorAll(".imagen-box")
        .forEach(imagen => imagen.remove());

    cancha.imagen.forEach(imagen => {
        imagenesContainer.insertAdjacentHTML("afterbegin", `
            <div class="imagen-box">
                <img src="${imagen}" alt="">
                <button type="button">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `);
    });
};


// Sirve para agregar las imagenes
document.getElementById("imagenCancha").addEventListener("change", (event) => {

    Array.from(event.target.files).forEach(archivo => {

        const lector = new FileReader();

        lector.onload = () => {

            document.getElementById("imagenesContainer").insertAdjacentHTML("afterbegin", `
                <div class="imagen-box">

                    <img src="${lector.result}" alt="">

                    <button type="button">
                        <i class="bi bi-trash"></i>
                    </button>

                </div>
            `);

        };

        lector.readAsDataURL(archivo);

    });

});

//Renderizar las canchas desde que recarga la página
document.addEventListener("DOMContentLoaded", () => {
    
    renderizar();
});

tablaCanchas.addEventListener("click", (event) => {

    const botonEliminar = event.target.closest(".trash-logo");

    if (!botonEliminar) {
        return;
    }

    const idEliminar = Number(botonEliminar.dataset.id);

    eliminarCancha(idEliminar);
});

tablaCanchas.addEventListener("click", (event) => {
    const botonEditar = event.target.closest(".bi-pencil-square")
    const modal = document.getElementById("agregarCancha");

    if(!botonEditar){
        return;
    }

    const idEditar = Number(botonEditar.dataset.id);

    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(modal);
    editarCancha(idEditar)
    modalBootstrap.show();
    
})

document.getElementById("imagenesContainer").addEventListener("click", (event) => {

    const botonEliminar = event.target.closest(".imagen-box button");

    if (!botonEliminar) {
        return;
    }

    botonEliminar.closest(".imagen-box").remove();

});

//Validaciones para que el usuario no coloque datos incorrectos o vacíos
const validarFormulario = (nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, forSelectTipo) => {
    
    if(!validarNombreCancha(nombreCancha)){
        Swal.fire({
            title: "El campo del nombre esta vacío.",
            text: "Debes ingresar el nombre de la cancha.",
            icon: "error"
        });
        return false;
    }
    
    if(!validarPrecioCancha(precio)){
        Swal.fire({
            title: "Precio inválido",
            text: "El precio debe contener solamente números.",
            icon: "error"
        });
        return false
    }

    if(!validarNumero(precio)){
        Swal.fire({
            title: "El precio es obligatorio.",
            text: "Debes colocar un valor en el campo.",
            icon: "error"
        });
        return false
    }

    if(!validarDisponibleCancha(disponible)){
        Swal.fire({
            title: "Campo obligatorio.",
            text: "Selecciona uno de los dos estados de la cancha.",
            icon: "error"
        });
        return false
    }

    if(!validarImagenCancha(imagenCancha)){
        Swal.fire({
            title: "Las fotos son requeridas.",
            text: "Debes seleccionar al menos una foto.",
            icon: "error"
        });
        return false
    }

    if(!validarUbicacionCancha(ubicacion)){
        Swal.fire({
            title: "La ubicación es obligatoria.",
            text: "Debes colocar una ubicación en el campo.",
            icon: "error"
        });
        return false
    }

    if(!validarDescripcionCancha(descripcion)){
        Swal.fire({
            title: "La descripcion es obligatoria.",
            text: "Debes colocar una descripción.",
            icon: "error"
        });
        return false
    }

    if(!validarTipo(forSelectTipo)){
        Swal.fire({
            title: "El tipo es obligatorio.",
            text: "Debes elegir el tipo.",
            icon: "error"
        });
        return false
    }
    return true
}

const validarNombreCancha = (nombreCancha) => {
    return nombreCancha.value.trim() !== "";
}

const validarPrecioCancha = (precio) => {
    return precio.value.trim() !== "";
}

const validarNumero = (precio) => {
    return !isNaN(precio.value)
}

const validarDisponibleCancha = (disponible) => {
    return !disponible !== null;
}

const validarImagenCancha = (imagenCancha) => {
    return imagenCancha.files.length > 0;
};

const validarUbicacionCancha = (ubicacion) => {
    return ubicacion.value.trim() !== ""
}

const validarDescripcionCancha = (descripcion) => {
    return descripcion.value.trim() !== ""
}

const validarTipo = (forSelectTipo) => {
    console.log(forSelectTipo.value);
    return forSelectTipo.value !== ""
}

const convertirImagen = (archivo) => {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(reader.error);
        };

        reader.readAsDataURL(archivo);
    });
};

formCancha.addEventListener("submit", async (event) => {

    event.preventDefault();
    
    const nombreCancha = document.getElementById("nombreCancha");
    const precio = document.getElementById("precio");
    const disponible = document.querySelector('input[name="disponible"]:checked');
    const imagenCancha = document.getElementById("imagenCancha");
    const ubicacion = document.getElementById("ubicacion");
    const descripcion = document.getElementById("descripcion");
    const sinCanchas = document.getElementById("sinCanchas");
    const modal = document.getElementById("agregarCancha");
    const forSelectTipo = document.getElementById("form-select-tipo");
    const estabaEditando = modal.hasAttribute("data-id-editar");
    
    if(!validarFormulario(nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, forSelectTipo)){
        return;
    }

    if (sinCanchas) {
        sinCanchas.remove();
    }
    
    await agregarCancha(nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, forSelectTipo);
    
    document.activeElement.blur();

    formCancha.reset();

    const modalBootstrap = bootstrap.Modal.getInstance(modal);
    modalBootstrap.hide();

    Swal.fire({
        title: estabaEditando ? "Cancha actualizada" : "Cancha agregada",
        icon: "success"
    });
})

document.getElementById("btnAgregarCancha").addEventListener("click", () => {
    nuevaCancha();
});
