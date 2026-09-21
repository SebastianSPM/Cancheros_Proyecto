document.addEventListener("DOMContentLoaded", () => {

    const preloaderVisto = localStorage.getItem("preloaderVisto");

    if (!preloaderVisto) {
        localStorage.setItem("preloaderVisto", "true");
        window.location.href = "./pages/preloader.html";
    }
});





