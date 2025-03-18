// Inicializar AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling para el navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Botón para ir al inicio
    const backToTopButton = document.getElementById('back-to-top');

    // Mostrar/Esconder el botón para ir al inicio
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { 
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Ir al inicio cuando el botón se activa
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Cambiar estilo del navbar al hacer scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            // Aquí puedes añadir validaciones del lado del cliente si lo deseas
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.</div>';
            messageDiv.style.display = 'block';
            
            // Para evitar que el formulario se envíe dos veces, puedes comentar esta línea
            // event.preventDefault();
        });
    }

    // Animación para las tarjetas de servicios
    const servicioItems = document.querySelectorAll('.servicio-item');
    servicioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('.servicio-icon').style.transform = 'rotateY(360deg)';
        });
    });

    // Galería de imágenes (lightbox simple)
    const cardImages = document.querySelectorAll('.card-image');
    cardImages.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.querySelector('img').src;
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <img src="${imgSrc}" alt="Imagen ampliada">
                </div>
            `;
            document.body.appendChild(lightbox);
            
            // Cerrar lightbox
            lightbox.querySelector('.close-lightbox').addEventListener('click', () => {
                document.body.removeChild(lightbox);
            });
            
            // Cerrar al hacer clic fuera de la imagen
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    document.body.removeChild(lightbox);
                }
            });
        });
    });
});