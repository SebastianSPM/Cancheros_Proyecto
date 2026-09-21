import { apiFetch } from "../api/api.js";


// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

const contenedor =
    document.getElementById("contenidoUsuarios");


// =========================================================
// OBTENER USUARIOS
// =========================================================

const obtenerUsuarios = async () => {

    try {

        return await apiFetch("/api/usuarios");

    } catch (error) {

        console.error(
            "Error al obtener usuarios:",
            error
        );

        throw error;
    }
};


// =========================================================
// OBTENER DETALLE DE USUARIO
// =========================================================

const obtenerUsuarioPorId = async (id) => {

    return await apiFetch(
        `/api/usuarios/${id}`
    );
};


// =========================================================
// ELIMINAR USUARIO
// =========================================================

const eliminarUsuario = async (id) => {

    const resultado =
        await Swal.fire({

            title: "¿Eliminar usuario?",

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
        });


    if (!resultado.isConfirmed) {
        return;
    }


    try {

        await apiFetch(
            `/api/usuarios/${id}`,
            {
                method: "DELETE"
            }
        );


        await Swal.fire({

            icon: "success",

            title: "Usuario eliminado",

            text:
                "El usuario fue eliminado correctamente.",

            timer: 1500,

            showConfirmButton: false
        });


        renderizarUsuarios();

    } catch (error) {

        console.error(
            "Error al eliminar usuario:",
            error
        );

        Swal.fire({

            icon: "error",

            title: "No se pudo eliminar",

            text:
                error.message ||
                "Ocurrió un error al eliminar el usuario."
        });
    }
};


// =========================================================
// EDITAR USUARIO
// =========================================================

const editarUsuario = async (id) => {

    try {

        const usuario =
            await obtenerUsuarioPorId(id);


        const resultado =
            await Swal.fire({

                title: "Editar usuario",

                html: `

                    <input
                        type="text"
                        id="editarNombre"
                        class="swal2-input"
                        placeholder="Nombre"
                        value="${usuario.nombre || ""}"
                    >

                    <input
                        type="text"
                        id="editarApellido"
                        class="swal2-input"
                        placeholder="Apellido"
                        value="${usuario.apellido || ""}"
                    >

                    <input
                        type="email"
                        id="editarEmail"
                        class="swal2-input"
                        placeholder="Correo"
                        value="${usuario.email || ""}"
                    >

                    <input
                        type="tel"
                        id="editarTelefono"
                        class="swal2-input"
                        placeholder="Teléfono"
                        value="${usuario.telefono || ""}"
                    >

                    <select
                        id="editarRol"
                        class="swal2-select"
                    >
                        <option
                            value="CLIENTE"
                            ${usuario.rol === "CLIENTE" ? "selected" : ""}
                        >
                            CLIENTE
                        </option>

                        <option
                            value="ADMIN"
                            ${usuario.rol === "ADMIN" ? "selected" : ""}
                        >
                            ADMIN
                        </option>
                    </select>

                `,

                showCancelButton: true,

                confirmButtonText:
                    "Guardar cambios",

                cancelButtonText:
                    "Cancelar",

                focusConfirm: false,

                preConfirm: () => {

                    const nombre =
                        document
                            .getElementById("editarNombre")
                            .value
                            .trim();

                    const apellido =
                        document
                            .getElementById("editarApellido")
                            .value
                            .trim();

                    const email =
                        document
                            .getElementById("editarEmail")
                            .value
                            .trim();

                    const telefono =
                        document
                            .getElementById("editarTelefono")
                            .value
                            .trim();

                    const rol =
                        document
                            .getElementById("editarRol")
                            .value;


                    if (
                        !nombre ||
                        !apellido ||
                        !email
                    ) {

                        Swal.showValidationMessage(
                            "Completa los campos obligatorios."
                        );

                        return false;
                    }


                    return {
                        nombre,
                        apellido,
                        email,
                        telefono,
                        rol
                    };
                }
            });


        if (!resultado.isConfirmed) {
            return;
        }


        const datos =
            resultado.value;


        await apiFetch(
            `/api/usuarios/${id}`,
            {
                method: "PUT",

                body: JSON.stringify({

                    nombre: datos.nombre,

                    apellido: datos.apellido,

                    email: datos.email,

                    telefono: datos.telefono,

                    rol: datos.rol

                })
            }
        );


        await Swal.fire({

            icon: "success",

            title: "Usuario actualizado",

            text:
                "Los datos del usuario fueron actualizados correctamente.",

            timer: 1500,

            showConfirmButton: false
        });


        renderizarUsuarios();

    } catch (error) {

        console.error(
            "Error al editar usuario:",
            error
        );

        Swal.fire({

            icon: "error",

            title: "No se pudo actualizar",

            text:
                error.message ||
                "Ocurrió un error al actualizar el usuario."
        });
    }
};


// =========================================================
// RENDERIZAR USUARIOS
// =========================================================

const renderizarUsuarios = async () => {

    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="text-center py-4">

            <div
                class="spinner-border"
                role="status"
            >
                <span class="visually-hidden">
                    Cargando...
                </span>
            </div>

            <p class="mt-2 mb-0">
                Cargando usuarios...
            </p>

        </div>
    `;


    try {

        const usuarios =
            await obtenerUsuarios();


        if (usuarios.length === 0) {

            contenedor.innerHTML = `
                <div class="text-center py-5">

                    <i
                        class="bi bi-people"
                        style="font-size: 3rem;"
                    ></i>

                    <h5 class="mt-3">
                        No hay usuarios registrados
                    </h5>

                    <p class="text-muted mb-0">
                        Actualmente no existen usuarios en el sistema.
                    </p>

                </div>
            `;

            return;
        }


        const totalUsuarios =
            usuarios.length;

        const totalAdmins =
            usuarios.filter(
                usuario =>
                    usuario.rol === "ADMIN"
            ).length;

        const totalClientes =
            usuarios.filter(
                usuario =>
                    usuario.rol === "CLIENTE"
            ).length;


        contenedor.innerHTML = `

            <!-- RESUMEN -->

            <div class="row g-3 mb-4">

                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-people-fill"
                                style="font-size: 2rem;"
                            ></i>

                            <div>

                                <h6>
                                    Total de usuarios
                                </h6>

                                <h3>
                                    ${totalUsuarios}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-person-fill-gear"
                                style="font-size: 2rem;"
                            ></i>

                            <div>

                                <h6>
                                    Administradores
                                </h6>

                                <h3>
                                    ${totalAdmins}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-12 col-md-4">

                    <div class="card resumen-card">

                        <div class="card-body">

                            <i
                                class="bi bi-person-fill"
                                style="font-size: 2rem;"
                            ></i>

                            <div>

                                <h6>
                                    Clientes
                                </h6>

                                <h3>
                                    ${totalClientes}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- TABLA -->

            <div class="table-responsive tabla-contenedor">

                <table class="table align-middle mb-0">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Nombre</th>

                            <th>Correo</th>

                            <th>Teléfono</th>

                            <th>Rol</th>

                            <th>Fecha de registro</th>

                            <th>Acciones</th>

                        </tr>

                    </thead>

                    <tbody id="tablaUsuariosAdmin"></tbody>

                </table>

            </div>
        `;


        const tabla =
            document.getElementById(
                "tablaUsuariosAdmin"
            );


        usuarios.forEach(usuario => {

            const fila =
                document.createElement("tr");


            let fechaRegistro = "-";


            if (usuario.fechaCreacion) {

                fechaRegistro =
                    new Date(
                        usuario.fechaCreacion
                    ).toLocaleDateString(
                        "es-CO"
                    );
            }


            fila.innerHTML = `

                <td>
                    ${usuario.id}
                </td>

                <td>
                    ${usuario.nombre || ""}
                    ${usuario.apellido || ""}
                </td>

                <td>
                    ${usuario.email || "-"}
                </td>

                <td>
                    ${usuario.telefono || "-"}
                </td>

                <td>

                    <span
                        class="badge ${
                            usuario.rol === "ADMIN"
                                ? "badge-usuario-admin"
                                : "badge-usuario-cliente"
                        }"
                    >
                        ${usuario.rol}
                    </span>

                </td>

                <td>
                    ${fechaRegistro}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-warning btn-editar-usuario"
                        data-id="${usuario.id}"
                    >
                        <i class="bi bi-pencil-square"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-eliminar-usuario"
                        data-id="${usuario.id}"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </td>

            `;


            tabla.appendChild(fila);
        });


        agregarEventosUsuarios();


    } catch (error) {

        console.error(
            "Error al renderizar usuarios:",
            error
        );

        contenedor.innerHTML = `
            <div class="alert alert-danger">

                <i
                    class="bi bi-exclamation-triangle-fill"
                ></i>

                No se pudieron cargar los usuarios.

            </div>
        `;
    }
};


// =========================================================
// EVENTOS
// =========================================================

const agregarEventosUsuarios = () => {

    const botonesEditar =
        document.querySelectorAll(
            ".btn-editar-usuario"
        );

    const botonesEliminar =
        document.querySelectorAll(
            ".btn-eliminar-usuario"
        );


    botonesEditar.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                editarUsuario(
                    boton.dataset.id
                );

            }
        );

    });


    botonesEliminar.forEach(boton => {

        boton.addEventListener(
            "click",
            () => {

                eliminarUsuario(
                    boton.dataset.id
                );

            }
        );

    });

};


// =========================================================
// CARGAR USUARIOS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    renderizarUsuarios
);