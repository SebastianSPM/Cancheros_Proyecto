document.addEventListener("DOMContentLoaded", () => {
    const botonLogin = document.querySelector(".login-btn");
    if (!botonLogin) {
        return;
    }
    const estaLogueado =   // aqui pregunta si hay una sesión iniciada
        localStorage.getItem("isLoggedIn") === "true";
    if (estaLogueado) {  //si la respuesta si entonces manda a mi perfil
        botonLogin.textContent = "Mi perfil";
        botonLogin.href = "./perfil.html";
    } else {
        botonLogin.textContent = "Entrar"; //si no manda a entrar y pagina de inicio-sesion
        botonLogin.href = "./inicio-sesion.html";
    }
});