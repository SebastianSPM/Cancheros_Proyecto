const API_CONTACTOS_URL = 'http://localhost:8081/api/contactos';
const formulario = document.getElementById("formContacto");
formulario.addEventListener("submit", validarFormulario);
async function validarFormulario(event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    if (nombre === "" && correo === "" && telefono === "" && mensaje === "") {
        Swal.fire({
            icon: "error",
            title: "Campos vacíos.",
            text: "Por favor completa los campos antes de enviar.",
        });
        return;
    }
    if (!validarNombre(nombre)) return;
    if (!validarCorreo(correo)) return;
    if (!validarTelefono(telefono)) return;
    if (!validarMensaje(mensaje)) return;
    const nuevoContacto = {
        nombre: nombre,
        email: correo, 
        telefono: telefono,
        mensaje: mensaje
    };
    Swal.fire({
        title: 'Enviando mensaje...',
        text: 'Conectando con el servidor...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    try {
        const response = await axios.post(API_CONTACTOS_URL, nuevoContacto);
        Swal.fire({
            title: "Mensaje enviado.",
            text: "Tu mensaje se envió correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
            allowOutsideClick: true
        }).then(() => {
            formulario.reset();
        });
    } catch (error) {
        if (error.response) {
            Swal.fire({
                icon: "warning",
                title: "Revisa tus datos",
                text: "El servidor rechazó el mensaje. Código: " + error.response.status
            });
            console.error("Error del servidor:", error.response.data);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error de red",
                text: "No se pudo conectar con el servidor Spring Boot. Verifica tu conexión."
            });
            console.error("Error de red:", error.message);
        }
    }
}
function validarNombre(nombre) {
    if (nombre === "") {
        Swal.fire({ icon: "error", title: "El nombre es requerido", text: "Debes ingresar tu nombre antes de continuar." });
        return false;
    }
    if (nombre.length < 3) {
        Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre debe tener al menos 3 caracteres." });
        return false;
    }
    return true;
}
function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(correo)) {
        Swal.fire({ icon: "error", title: "Correo electrónico inválido", text: "Ingresa un correo electrónico válido." });
        return false;
    }
    return true;
}
function validarTelefono(telefono) {
    if(telefono === ""){
        Swal.fire({ icon: "error", title: "Teléfono requerido", text: "Debes ingresar un número de teléfono." });
        return false;
    }
    const regex = /^[0-9]{10}$/;
    if (!regex.test(telefono)) {
        Swal.fire({ icon: "error", title: "Teléfono es inválido.", text: "El teléfono debe contener únicamente números y tener exactamente 10 dígitos." });
        return false;
    }
    return true;
}
function validarMensaje(mensaje) {
    if(mensaje === ""){
        Swal.fire({ icon: "error", title: "Mensaje es requerido.", text: "Debes escribir un mensaje." });
        return false;
    }
    if(mensaje.length < 10){
        Swal.fire({ icon: "error", title: "Mensaje muy corto.", text: "El mensaje debe tener al menos 10 caracteres." });
        return false;
    }
    return true;
}