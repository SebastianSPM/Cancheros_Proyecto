
const formCancha = document.getElementById("formCancha");


formCancha.addEventListener("submit", (event) => {

    const nombreCancha = document.getElementById("nombreCancha");
    const precio = document.getElementById("precio");
    const disponible = document.querySelector('input[name="disponible"]:checked');
    const imagenCancha = document.getElementById("imagenCancha");
    const ubicacion = document.getElementById("ubicacion");
    const descripcion = document.getElementById("descripcion");
    const cerrarVentana = document.getElementById("cerrarVentana");
    const ConReservas = document.getElementById("tablaReservas");
    const mensajeSinReserva = document.getElementById("mensajeSinReservas");

    event.preventDefault();
    
    if(nombreCancha.value.trim() === ""){
        Swal.fire({
            title: "El campo del nombre esta vacío.",
            text: "Debes ingresar el nombre de la cancha.",
            icon: "error"
        });
        return;
    }

    if(precio.value.trim() === ""){
        Swal.fire({
            title: "El precio es obligatorio.",
            text: "Debes colocar un valor en el campo.",
            icon: "error"
        });
        return;
    }

    if (isNaN(precio.value)) {
        Swal.fire({
            title: "Precio inválido",
            text: "El precio debe contener solamente números.",
            icon: "error"
        });
        return;
    }

    if(!disponible){
        Swal.fire({
            title: "Campo obligatorio.",
            text: "Selecciona uno de los dos estados de la cancha.",
            icon: "error"
        });
        return;
    }

    if(imagenCancha.files.length === 0){
        Swal.fire({
            title: "Las fotos son requeridas.",
            text: "Debes seleccionar al menos una foto.",
            icon: "error"
        });
        return;
    }

    if(ubicacion.value.trim() === ""){
        Swal.fire({
            title: "La ubicación es obligatoria.",
            text: "Debes colocar una ubicación en el campo.",
            icon: "error"
        });
        return;
    }

    if(descripcion.value.trim() === ""){
        Swal.fire({
            title: "La descripcion es obligatoria.",
            text: "Debes colocar una descripción.",
            icon: "error"
        });
        return;
    }

    document.activeElement.blur();
    const modal = document.getElementById("agregarCancha");

    modal.addEventListener("hidden.bs.modal", () => {
        Swal.fire({
            title: "Cancha agregada",
            icon: "success"
        });
    }, { once: true });

    const archivoImagen = imagenCancha.files[0];

    const url = URL.createObjectURL(archivoImagen);

    mensajeSinReserva.style.display = "none"
    ConReservas.innerHTML += `
        <tr>
            <td>001</td>
            <td>${disponible.value ? "Si" : "No"}</td>
            <td>${descripcion.value}</td>
            <td>${nombreCancha.value}</td>
            <td>${precio.value}</td>
            <td>${ubicacion.value}</td>
            <td>
                <img src="${url}" alt="${nombreCancha.value}" width="60" height="60" />
            </td>
        </tr>
    `

    document.getElementById("cerrarVentana").click()

    nombreCancha.value = ""
    precio.value = "";
    disponible.forEach(radio => radio.checked = false);
    imagenCancha.value = "";
    ubicacion.value = "";
    descripcion.value = "";

})


/*





*/

