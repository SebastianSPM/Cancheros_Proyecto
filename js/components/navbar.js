import { apiFetch } from "../api/api.js";

// =====================================================
// CARGAR NAVBAR
// =====================================================

async function cargarNavbar() {

    const userDropdown =
        document.querySelector(".userDropdown");

    const userMenu =
        document.querySelector(".userMenu");

    // El navbar todavía no existe
    if (!userDropdown || !userMenu) {
        return false;
    }

    try {

        const usuario =
            await apiFetch("/api/perfil");

        // =================================================
        // USUARIO AUTENTICADO
        // =================================================

        if (usuario) {

            userDropdown.textContent =
                `Hola, ${usuario.nombre}`;

            userMenu.innerHTML = `
                <li>
                    <a
                        class="dropdown-item"
                        href="${ruta("usuario", "perfil.html")}"
                    >
                        Mi perfil
                    </a>
                </li>

                <li>
                    <a
                        class="dropdown-item"
                        href="${ruta("usuario", "mis-reservas.html")}"
                    >
                        Mis reservas
                    </a>
                </li>

                <li>
                    <hr class="dropdown-divider">
                </li>

                <li>
                    <button
                        type="button"
                        class="cerrarSesion dropdown-item"
                    >
                        Cerrar sesión
                    </button>
                </li>
            `;

            const cerrarSesion =
                userMenu.querySelector(".cerrarSesion");

            if (cerrarSesion) {

                cerrarSesion.addEventListener(
                    "click",
                    async (e) => {

                        e.preventDefault();

                        try {

                            await apiFetch("/auth/logout", {
                                method: "POST"
                            });

                            window.location.href =
                                rutaInicio();

                        } catch (error) {

                            console.error(
                                "Error al cerrar sesión:",
                                error
                            );
                        }
                    }
                );
            }

        }

        // =================================================
        // USUARIO NO AUTENTICADO
        // =================================================

        else {

            userDropdown.textContent =
                "Entrar";

            userMenu.innerHTML = `
                <li>
                    <a
                        class="dropdown-item"
                        href="${ruta("auth", "inicio-sesion.html")}"
                    >
                        Iniciar sesión
                    </a>
                </li>

                <li>
                    <a
                        class="dropdown-item"
                        href="${ruta("auth", "registro.html")}"
                    >
                        Registrarse
                    </a>
                </li>
            `;
        }

        return true;

    } catch (error) {

    userDropdown.textContent = "Entrar";

    userMenu.innerHTML = `
        <li>
            <a
                class="dropdown-item"
                href="${ruta("auth", "inicio-sesion.html")}"
            >
                Iniciar sesión
            </a>
        </li>

        <li>
            <a
                class="dropdown-item"
                href="${ruta("auth", "registro.html")}"
            >
                Registrarse
            </a>
        </li>
    `;

    return true;
}
}


// =====================================================
// ESPERAR A QUE EXISTA EL NAVBAR
// =====================================================

async function iniciarNavbar() {

    // Intentar cargarlo
    const cargado =
        await cargarNavbar();

    // Si ya existe, terminamos
    if (cargado) {
        return;
    }

    // Si todavía no existe,
    // esperamos a que aparezca
    const observer =
        new MutationObserver(async () => {

            const elementosNavbar =
                document.querySelector(".userDropdown") &&
                document.querySelector(".userMenu");

            if (!elementosNavbar) {
                return;
            }

            observer.disconnect();

            await cargarNavbar();
        });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}


// =====================================================
// INICIAR
// =====================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarNavbar
    );

} else {

    iniciarNavbar();
}


// =====================================================
// RUTAS
// =====================================================

function ruta(seccion, pagina) {

    return window.location.pathname.includes("/pages/")
        ? `../${seccion}/${pagina}`
        : `./pages/${seccion}/${pagina}`;
}


function rutaInicio() {

    return window.location.pathname.includes("/pages/")
        ? "../../index.html"
        : "./index.html";
}