function cargarCanchasAdmin() {

    const canchas = JSON.parse(
        localStorage.getItem("canchas")
    ) || [];
    
    const contenedor = document.getElementById("containerMain");
    
    canchas.forEach(cancha => {
        contenedor.innerHTML += `
            <div class="col-lg-4 col-md-6 d-flex">
                <div class="cancha-card w-100">
                    <div class="card-img-wrapper">
                    <img
                        src="${cancha.imagen}"
                        alt="${cancha.nombreCancha}"
                    />

                    <span class="badge-rating"
                        ><i class="fa-solid fa-star"></i> 4.7 (89+)</span
                    >
                    </div>
                    <div class="card-body-custom">
                    <div class="card-header-info">
                        <h5 class="cancha-title">${cancha.nombreCancha}</h5>
                        <span class="badge-tipo">Fútbol 11</span>
                    </div>
                    <div class="cancha-location">
                        <i class="fa-solid fa-location-dot"></i> ${cancha.ubicacion}
                    </div>
                    <div class="amenities-list">
                        <span class="badge-amenity"
                        ><i class="fa-solid fa-trophy"></i> Graderías</span
                        >
                        <span class="badge-amenity"
                        ><i class="fa-solid fa-square-parking"></i> Parqueadero</span
                        >
                        <span class="badge-amenity"
                        ><i class="fa-solid fa-shield"></i> Camerinos VIP</span
                        >
                    </div>
                    <div class="card-footer-custom">
                        <div>
                        <span class="price-label">Desde</span>
                        <div class="price-value">$${cancha.precio} <span>/hr</span></div>
                        </div>
                        <button class="btn btn-reservar">Reservar</button>
                    </div>
                    </div>
                </div>
            </div>
            
        `;
    });
}

document.addEventListener("DOMContentLoaded", function () {
    cargarCanchasAdmin();
});