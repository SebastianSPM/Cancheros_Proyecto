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
