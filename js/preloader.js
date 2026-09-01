document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("preloader-canvas");
    const ctx = canvas.getContext("2d");

    const preloader = document.getElementById("preloader");
    const progressBar = document.querySelector(".preloader-progress");
    const progressBall = document.querySelector(".preloader-ball");

    let width;
    let height;

    let particles = [];

    let progress = 0;


    /* =========================================
       CONFIGURAR CANVAS
       ========================================= */

    function resizeCanvas() {

        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

    }

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();


    /* =========================================
       PARTÍCULAS
       ========================================= */

    class Particle {

        constructor() {
            this.reset();
        }


        reset() {

            this.x = Math.random() * width;

            this.y = Math.random() * height;

            this.radius = Math.random() * 3.5 + 2.5;

            this.color =
                Math.random() > 0.3
                    ? "rgba(0, 230, 118, "
                    : "rgba(255, 255, 255, ";

            this.alpha = Math.random() * 0.7 + 0.3;

            this.speedX = (Math.random() - 0.5) * 1.5;

            this.speedY = (Math.random() - 0.5) * 1.5;

        }


        update() {

            this.x += this.speedX;

            this.y += this.speedY;


            if (
                this.x < 0 ||
                this.x > width ||
                this.y < 0 ||
                this.y > height
            ) {

                this.reset();

            }

        }


        draw() {

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `${this.color}${this.alpha})`;

            ctx.fill();

        }

    }


    /* =========================================
       CREAR PARTÍCULAS
       ========================================= */

    for (let i = 0; i < 160; i++) {

        particles.push(
            new Particle()
        );

    }


    /* =========================================
       ANIMACIÓN
       ========================================= */

    function animate() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        particles.forEach((particle) => {

            particle.update();

            particle.draw();

        });


        requestAnimationFrame(animate);

    }


    animate();


    /* =========================================
       AVANZAR PROGRESO
       ========================================= */

    function advanceProgress() {

        if (progress < 100) {

            progress += 10;


            if (progress > 100) {
                progress = 100;
            }


            progressBar.style.width =
                `${progress}%`;


            progressBall.style.left =
                `${progress}%`;


            /* Cuando llega al 100% */

            if (progress === 100) {

                setTimeout(() => {

                    preloader.classList.add("hidden");
                    window.location.href = "../index.html";

                }, 500);

            }

        }

    }


    /* =========================================
       TECLA ESPACIO
       ========================================= */

    window.addEventListener("keydown", async (e) => {

        if (e.code === "Space") {

            e.preventDefault();

            await advanceProgress();

        }

    })


    /* =========================================
       CLIC
       ========================================= */

    window.addEventListener("click", () => {

        advanceProgress();

    });

});