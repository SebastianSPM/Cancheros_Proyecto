const formulario = document.getElementById("formContacto");

formulario.addEventListener("submit", validarFormulario);

function validarFormulario(event) {

    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if(nombre === "" || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(correo) || telefono === "" || telefono === ""){
        Swal.fire({
            icon: "error",
            title: "Algunos campos estan vacíos.",
            text: "Porfavor completa los campos antes de envíar.",
        })
    }

    if (!validarNombre(nombre)) return;

    if (!validarCorreo(correo)) return;

    if (!validarTelefono(telefono)) return;

    if (!validarMensaje(mensaje)) return;

    fetch(formulario.action, {
        method: "POST",
        body: new FormData(formulario),
        headers: {
            "Accept": "application/json"
        }
    }).then(response => {
        if(response.ok){
            Swal.fire({
                title: "Mensaje enviado.",
                text: "Tu mensaje se envió correctamente.",
                icon: "success",
                confirmButtonText:"Aceptar",
                allowOutsideClick: true
            }).then(() => {
                formulario.reset();
            });
        }
    });
}

function validarNombre(nombre) {

    if (nombre === "") {
        Swal.fire({
            icon: "error",
            title: "El nombre es requerido",
            text: "Debes ingresar tu nombre antes de continuar."
        });
        return false;
    }

    if (nombre.length < 3) {
        Swal.fire({
            icon: "error",
            title: "Nombre inválido",
            text: "El nombre debe tener al menos 3 caracteres."
        });
        return false;
    }

    return true;
}

function validarCorreo(correo) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(correo)) {
        Swal.fire({
            icon: "error",
            title: "Correo electrónico inválido",
            text: "Ingresa un correo electrónico válido."
        });
        return false;
    }

    return true;
}


function validarTelefono(telefono) {

    if(telefono === ""){
        Swal.fire({
            icon: "error",
            title: "Teléfono requerido",
            text: "Debes ingresar un número de teléfono."
        });
        return false;
    }

    const regex = /^[0-9]{10}$/;

    if (!regex.test(telefono)) {
        Swal.fire({
            icon: "error",
            title: "Teléfono es inválido.",
            text: "El teléfono debe contener únicamente números y tener exactamente 10 dígitos."
        });
        return false;
    }

    return true;
}

function validarMensaje(mensaje){

    if(mensaje === ""){
        Swal.fire({
            icon: "error",
            title: "Mensaje es requerido.",
            text: "Debes escribir un mensaje."
        });
        return false;
    }

    if(mensaje.length < 10){
        Swal.fire({
            icon: "error",
            title: "Mensaje muy corto.",
            text: "El mensaje debe tener al menos 10 caracteres."
        });
        return false;
    }

    return true;
}