// Función para manejar la pantalla de carga
function handleLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Ocultar la pantalla de carga cuando la página esté completamente cargada
    window.addEventListener('load', function() {
        // Pequeño retraso para asegurar que todo esté renderizado
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
            // Habilitar el scroll después de que la pantalla de carga desaparezca
            document.body.style.overflow = 'auto';
        }, 500);
    });
    
    // Deshabilitar el scroll mientras se muestra la pantalla de carga
    document.body.style.overflow = 'hidden';
}

// Inicializar AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la pantalla de carga
    handleLoadingScreen();

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
    // Botón de whatsapp
    const whatsappBtn = document.querySelector('.whatsapp-btn');

    // Mostrar/Esconder los botones al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { 
            backToTopButton.classList.add('visible');
            if (whatsappBtn) {
                whatsappBtn.classList.add('visible');
            }
        } else {
            backToTopButton.classList.remove('visible');
            if (whatsappBtn) {
                whatsappBtn.classList.remove('visible');
            }
        }
    });

    // Ir al inicio cuando el botón se activa
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Animación para el botón de WhatsApp
    if (whatsappBtn) {
        whatsappBtn.addEventListener('mouseenter', () => {
            whatsappBtn.style.animation = 'pulse 1s infinite';
        });
        
        whatsappBtn.addEventListener('mouseleave', () => {
            whatsappBtn.style.animation = 'none';
        });
    }

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

// Funcionalidad para el formulario de newsletter
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('mc-embedded-subscribe-form');
    const successMessage = document.getElementById('newsletter-success');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            // Validar el email antes de enviar
            const emailInput = document.getElementById('mce-EMAIL');
            const email = emailInput.value.trim();
            
            if (!isValidEmail(email)) {
                event.preventDefault();
                emailInput.style.borderColor = 'var(--rojo-logo)';
                return false;
            }
            
            // Mostrar mensaje de éxito después de enviar
            // Nota: En producción, esto se manejará por la respuesta de Mailchimp
            setTimeout(() => {
                if (successMessage) {
                    newsletterForm.style.opacity = '0';
                    setTimeout(() => {
                        newsletterForm.style.display = 'none';
                        successMessage.style.display = 'flex';
                    }, 300);
                }
            }, 1000);
        });
        
        // Restaurar estilo al escribir
        const emailInput = document.getElementById('mce-EMAIL');
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        }
    }
    
    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
