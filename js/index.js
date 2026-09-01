document.addEventListener("DOMContentLoaded", () => {

    const botonSesion = document.getElementById("botonSesion");

    const usuarioGuardado = localStorage.getItem("currentUser");

    if (usuarioGuardado && botonSesion) {
        botonSesion.textContent = "Mi perfil";
        botonSesion.href = "html/perfil.html";
    }

});

const preloaderVisto = localStorage.getItem("preloaderVisto");

if (!preloaderVisto) {
    localStorage.setItem("preloaderVisto", "true");
    window.location.href = "./html/preloader.html";
}

const usuario = JSON.parse(localStorage.getItem("usuarios"));

const userDropdown = document.querySelector(".userDropdown");
const userMenu = document.querySelector(".userMenu");

if (usuario) {

    userDropdown.innerHTML = `Hola, ${usuario[0].nombre}`;

    userMenu.innerHTML = `
        <li>
            <a class="dropdown-item" href="./html/perfil.html">
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
    
        cerrarSesion.addEventListener("click", (e) => {
            e.preventDefault();
    
            // Validación antes de cerrar sesión
            const estaLogueado =
                localStorage.getItem("isLoggedIn") === "true";
    
            if (estaLogueado) {
                localStorage.removeItem("isLoggedIn")
                localStorage.removeItem("usuarios")
                window.location.href = "./index.html";
            }
        });
    }



} else {

    userDropdown.textContent = "Entrar";

    userMenu.innerHTML = `
        <li>
            <a class="dropdown-item" href="./html/inicio-sesion.html">
                Iniciar sesión
            </a>
        </li>

        <li>
            <a class="dropdown-item" href="./html/registro.html">
                Registrarse
            </a>
        </li>
    `;

}

