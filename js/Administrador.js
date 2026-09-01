
const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"))
const formCancha = document.getElementById("formCancha");
const tablaCanchas = document.getElementById("tablaCanchas");
const salirbtn = document.getElementById("salirbtn");
const agregarCanchaBtn = document.getElementById("agregarCancha")

salirbtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn")
    window.location.href = "./inicio-sesion.html"
})

//Válidar si el usuario esta activo
if(!isLoggedIn){
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


const agregarCancha = async (nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, cerrarVentana, mensajeSinCanchas) => {
    const canchas = obtenerCanchas();
    const archivoImagen = imagenCancha.files[0];
    const imagen = await convertirImagen(archivoImagen);

    const nuevoId = canchas.length > 0
        ? Math.max(...canchas.map(cancha => cancha.id)) + 1
        : 1
    ;
    
    const otraCancha = {
        id:nuevoId,
        disponible: disponible.value,
        descripcion: descripcion.value,
        nombreCancha: nombreCancha.value,
        precio: precio.value,
        ubicacion: ubicacion.value,
        imagen: imagen
    }

    canchas.push(otraCancha)
    guardarCanchas(canchas);
    renderizar();

    localStorage.setItem("canchas", JSON.stringify(canchas))

}

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
            <td>$${cancha.precio}</td>
            <td>${cancha.ubicacion}</td>
            <td>
                <img class="imagenPanel" src="${cancha.imagen}" alt="${cancha.nombreCancha}" width="60" height="60" />
            </td>
            <td><i class="trash-logo bi bi-trash fs-3" data-id="${cancha.id}"></i></td>
        `;

        tablaCanchas.appendChild(fila);
    })
}

const eliminarCancha = (id) => {

    //Eliminar cancha dese json aún no es con base de datos
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

//Renderizar las canchas desde que recarga la página
document.addEventListener("DOMContentLoaded", () => {
    renderizar();
});

tablaCanchas.addEventListener("click", (event) => {

    const botonEliminar = event.target.closest(".trash-logo");

    if (!botonEliminar) {
        return;
    }

    const id = Number(botonEliminar.dataset.id);

    eliminarCancha(id);
});

//Validaciones para que el usuario no coloque datos incorrectos o vacíos
const validarFormulario = (nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion) => {
    
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
    const cerrarVentana = document.getElementById("cerrarVentana");
    const sinCanchas = document.getElementById("sinCanchas");
    const modal = document.getElementById("agregarCancha");


    
    
    if(!validarFormulario(nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, cerrarVentana)){
        return;
    }

    if (sinCanchas) {
        sinCanchas.remove();
    }
    
    await agregarCancha(nombreCancha, precio, disponible, imagenCancha, ubicacion, descripcion, cerrarVentana);
    
    document.activeElement.blur();

    formCancha.reset();

    const modalBootstrap = bootstrap.Modal.getInstance(modal);
    modalBootstrap.hide();

    Swal.fire({
        title: "Cancha agregada",
        icon: "success"
    });
})
