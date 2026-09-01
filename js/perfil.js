window.addEventListener("pageshow", (event) => {

    if (event.persisted) {
        window.location.reload();
    }

});

document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("currentUser"); // obtener el usuario que inició sesión

    if (!usuarioGuardado) {  // si no existe un usuario regresar al login
        window.location.href = "inicio-sesion.html";
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);   // convertir el texto guardado en un objeto


    const avatar = document.querySelector(".avatar");  // que no se borre la foto subida al recargar la pagina
if (usuario.fotoPerfil) {
    avatar.innerHTML = `
        <img src="${usuario.fotoPerfil}" alt="Foto de perfil">
    `;
}

    document.getElementById("nombreUsuario").textContent =   // mostrar los datos del usuario
        `${usuario.nombre} ${usuario.apellido}`;

    document.getElementById("correoUsuario").textContent =
        usuario.email;

    document.getElementById("telefonoUsuario").textContent =
        usuario.telefono;

        mostrarHistorialReservas();


const botonEditarDatos = document.getElementById("editarDatos");   //fncionalidad de editar datos de contacto

botonEditarDatos.addEventListener("click", () => {
    const usuarioGuardado = localStorage.getItem("currentUser");
    if (!usuarioGuardado) {
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    Swal.fire({
        title: "Editar datos",
        html: `
            <input 
                type="text" 
                id="nuevoNombre" 
                class="swal2-input"
                placeholder="Nombre"
                value="${usuario.nombre}"
            >

            <input 
                type="text" 
                id="nuevoApellido" 
                class="swal2-input"
                placeholder="Apellido"
                value="${usuario.apellido}"
            >

            <input 
                type="tel" 
                id="nuevoTelefono" 
                class="swal2-input"
                placeholder="Número de contacto"
                value="${usuario.telefono}"
            >
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar cambios",
        cancelButtonText: "Cancelar",
        focusConfirm: false,

        preConfirm: () => {
            const nombre = document.getElementById("nuevoNombre").value.trim();
            const apellido = document.getElementById("nuevoApellido").value.trim();
            const telefono = document.getElementById("nuevoTelefono").value.trim();

            if (!nombre || !apellido || !telefono) {
                Swal.showValidationMessage(
                    "Completa todos los campos."
                );
                return false;
            }
            return {
                nombre,
                apellido,
                telefono
            };
        }

    }).then((resultado) => {

        if (!resultado.isConfirmed) {
            return;
        }

        const nuevosDatos = resultado.value;

        usuario.nombre = nuevosDatos.nombre; // para actualizar usuario actual
        usuario.apellido = nuevosDatos.apellido;
        usuario.telefono = nuevosDatos.telefono;

        
        localStorage.setItem( // para actualizar currentUser
            "currentUser",
            JSON.stringify(usuario)
        );

       
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];  // actualizar también el usuario dentro de "usuarios"

        const indiceUsuario = usuarios.findIndex(user => user.id === usuario.id
        );

        if (indiceUsuario !== -1) {
            usuarios[indiceUsuario] = usuario;
            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );
        }


        document.getElementById("nombreUsuario").textContent = `${usuario.nombre} ${usuario.apellido}`; // actualizar información visible
        document.getElementById("telefonoUsuario").textContent = usuario.telefono;

        Swal.fire({
            icon: "success",
            title: "Datos actualizados",
            text: "Tus datos se actualizaron correctamente.",
        });
    });
});




const botonEditarFoto = document.getElementById("editarFoto");  //editar foto de perfil
const inputFoto = document.getElementById("inputFoto");
botonEditarFoto.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", () => {
    const archivo = inputFoto.files[0];
    if (!archivo) {
        return;
    }

    if (!archivo.type.startsWith("image/")) {   //esto para verificar que si sea una imagen
        Swal.fire({
            icon: "error",
            title: "Archivo no válido",
            text: "Por favor selecciona una imagen."
        });
        return;
    }

    const lector = new FileReader();
    lector.onload = () => {
        const imagen = lector.result;

        // para mostrar la imagen en el perfil
        avatar.innerHTML = ` 
            <img src="${imagen}" alt="Foto de perfil">
        `;

        const usuarioGuardado = // obtener el usuario actual
            localStorage.getItem("currentUser");

        if (!usuarioGuardado) {
            return;
        }
        const usuario = JSON.parse(usuarioGuardado);
        
        usuario.fotoPerfil = imagen; // guardar foto en el usuario
        localStorage.setItem(
            "currentUser",
            JSON.stringify(usuario)
        );

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];  // actualizar también en usuarios
        const indiceUsuario = usuarios.findIndex(
            user => user.id === usuario.id
        );

        if (indiceUsuario !== -1) {
            usuarios[indiceUsuario].fotoPerfil = imagen;
            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );
        }
        Swal.fire({
            icon: "success",
            title: "¡Foto actualizada!",
            text: "Tu foto de perfil se actualizó correctamente."
        });
    };
    lector.readAsDataURL(archivo);
});



const botonCambiarPassword =    //cambiar contraseña
    document.getElementById("cambiarPassword");
botonCambiarPassword.addEventListener("click", () => {
    const usuarioGuardado =
        localStorage.getItem("currentUser");
    if (!usuarioGuardado) {
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    Swal.fire({
        title: "Cambiar contraseña",
        html: `
            <input 
                type="password"
                id="passwordActual"
                class="swal2-input"
                placeholder="Contraseña actual"
            >

            <input 
                type="password"
                id="nuevaPassword"
                class="swal2-input"
                placeholder="Nueva contraseña"
            >

            <input 
                type="password"
                id="confirmarPassword"
                class="swal2-input"
                placeholder="Confirmar nueva contraseña"
            >
        `,
        showCancelButton: true,
        confirmButtonText: "Guardar contraseña",
        cancelButtonText: "Cancelar",
        focusConfirm: false,

        preConfirm: () => {
            const passwordActual =
                document.getElementById("passwordActual").value;
            const nuevaPassword =
                document.getElementById("nuevaPassword").value;
            const confirmarPassword =
                document.getElementById("confirmarPassword").value;
            if (!passwordActual || !nuevaPassword || !confirmarPassword) {
                Swal.showValidationMessage(
                    "Completa todos los campos."
                );
                return false;
            }

            if (passwordActual !== usuario.password) {
                Swal.showValidationMessage(
                    "La contraseña actual es incorrecta."
                );
                return false;
            }

            const passwordRegex =
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

            if (!passwordRegex.test(nuevaPassword)) {
                Swal.showValidationMessage(
                    "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial."
                );
                return false;
            }

            if (nuevaPassword !== confirmarPassword) {
                Swal.showValidationMessage(
                    "Las nuevas contraseñas no coinciden."
                );
                return false;
            }

            if (nuevaPassword === passwordActual) {
                Swal.showValidationMessage(
                    "La nueva contraseña debe ser diferente a la actual."
                );
                return false;
            }
            return nuevaPassword;
        }

    }).then((resultado) => {
        if (!resultado.isConfirmed) {
            return;
        }
        const nuevaPassword = resultado.value;
        usuario.password = nuevaPassword; // actualizar contraseña del usuario actual
        localStorage.setItem(
            "currentUser",
            JSON.stringify(usuario)
        );
  
        const usuarios =     // actualizar contraseña dentro de usuarios
            JSON.parse(localStorage.getItem("usuarios")) || [];
        const indiceUsuario = usuarios.findIndex(
            user => user.id === usuario.id
        );

        if (indiceUsuario !== -1) {
            usuarios[indiceUsuario].password =
                nuevaPassword;
            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );
        }

        Swal.fire({
            icon: "success",
            title: "Contraseña actualizada",
            text: "Tu contraseña se cambió correctamente."
        });
    });
});


        const botonCerrarSesion = document.getElementById("cerrarSesion");   //para que cuando el usuario cierre sesion vuelva a mostrar Entrar
botonCerrarSesion.addEventListener("click", () => {    
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "../index.html";
});
});

const mostrarHistorialReservas = () => {    //historial de reservas por usuario
    const usuarioGuardado = localStorage.getItem("currentUser"); // Obtener usuario actual
    if (!usuarioGuardado) {
        return;
    }
    const usuario = JSON.parse(usuarioGuardado);
  
    const reservas =     // obtener todas las reservas
        JSON.parse(localStorage.getItem("reservas")) || [];

    
    const historial = // Buscar el elemento donde mostrar las reservas
        document.getElementById("historialReservas");
    
    const misReservas = reservas.filter( // filtro de solamente las reservas del usuario actual
        reserva => reserva.email === usuario.email
    );

    historial.innerHTML = ""; // limpiar la tabla
    if (misReservas.length === 0) {  // si no tiene reservas
        historial.innerHTML = `
            <tr>
                <td colspan="5">
                    No tienes reservas registradas.
                </td>
            </tr>
        `;
        return;
    }

    misReservas.forEach(reserva => {   // mostrar cada reserva
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${reserva.fecha}</td>
            <td>${reserva.hora}</td>
            <td>${reserva.nombreCancha}</td>
            <td>$${Number(reserva.total).toLocaleString("es-CO")}</td>
            <td>
                <span class="estado-reserva">
                    Confirmada
                </span>
            </td>
        `;
        historial.appendChild(fila);
    });
};