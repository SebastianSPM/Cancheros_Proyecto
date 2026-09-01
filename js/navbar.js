document.addEventListener("DOMContentLoaded", () => {
    
    console.log("HOLA");
    
    const estaLogueado = localStorage.getItem("isLoggedIn") === "true";

    const usuario = JSON.parse(localStorage.getItem("usuarios"));

    const userDropdown = document.querySelector(".userDropdown");
    const userMenu = document.querySelector(".userMenu");

    if (!userDropdown || !userMenu) {
        return;
    }
    
    if (estaLogueado) {

        userDropdown.textContent = `Hola, ${usuario[0].nombre}`;

        userMenu.innerHTML = `
            <li>
                <a class="dropdown-item" href="./perfil.html">
                    Mi perfil
                </a>
            </li>

            <li>
                <button type="button" class="cerrarSesion dropdown-item">
                    Cerrar sesión
                </button>
            </li>
        `;

        if(userMenu){

            const cerrarSesion = document.querySelector(".cerrarSesion");
            console.log(cerrarSesion);
            
    
            cerrarSesion.addEventListener("click", (e) => {
                e.preventDefault();
    
                // Validación antes de cerrar sesión
                const estaLogueado =
                    localStorage.getItem("isLoggedIn") === "true";
    
                if (estaLogueado) {
                    localStorage.removeItem("isLoggedIn")
                    localStorage.removeItem("usuarios")
                    window.location.href = "../index.html";
                }
            });
        }

    } else {

        userDropdown.textContent = "Entrar";

        userMenu.innerHTML = `
            <li>
                <a class="dropdown-item" href="./inicio-sesion.html">
                    Iniciar sesión
                </a>
            </li>

            <li>
                <a class="dropdown-item" href="./registro.html">
                    Registrarse
                </a>
            </li>
        `;
    }

});
