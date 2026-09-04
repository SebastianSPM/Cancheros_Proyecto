document.addEventListener("DOMContentLoaded", () => {
    
    const estaLogueado = localStorage.getItem("isLoggedIn") === "true";

    const usuario = JSON.parse(localStorage.getItem("usuarios"));

    const userDropdown = document.querySelector(".userDropdown");
    const userMenu = document.querySelector(".userMenu");

    if (!userDropdown || !userMenu) {
        return;
    }
    
   if (estaLogueado) {

        userDropdown.textContent = `Hola, ${usuario[0].nombre}`;
        console.log();
        

        userMenu.innerHTML = `
            <li>
                <a class="dropdown-item" href="${ruta("perfil.html")}">
                    Mi perfil
                </a>
            </li>

            <li>
                <a class="dropdown-item" href="${ruta("mis-reservas.html")}">
                    Mis reservas
                </a>
            </li>

            <li><hr class="dropdown-divider"></li>

            <li>
                <button type="button" class="cerrarSesion dropdown-item">
                    Cerrar sesión
                </button>
            </li>
        `;

        if(userMenu){
            
            const cerrarSesion = document.querySelector(".cerrarSesion");
            
    
            cerrarSesion.addEventListener("click", (e) => {
                e.preventDefault();
    
                // Validación antes de cerrar sesión
                const estaLogueado =
                    localStorage.getItem("isLoggedIn") === "true";
    
                if (estaLogueado) {
                    localStorage.removeItem("isLoggedIn")
                    localStorage.removeItem("currentUser")
                    window.location.href = "../index.html";
                }
            });
        }

    } else {

        userDropdown.textContent = "Entrar";

        userMenu.innerHTML = `
            <li>
                <a class="dropdown-item" href="${ruta("./inicio-sesion.html")}">
                    Iniciar sesión
                </a>
            </li>

            <li>
                <a class="dropdown-item" href="${ruta("./registro.html")}">
                    Registrarse
                </a>
            </li>
        `;
    }

});

function ruta(pagina) {
    return window.location.pathname.includes("/html/")
        ? `./${pagina}`
        : `./html/${pagina}`;
}
