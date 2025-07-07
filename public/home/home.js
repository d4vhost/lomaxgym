// ===== HOME LOGIC SIN EFECTO PARALLAX =====

// Configuración del Intersection Observer para animaciones
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Crear el observer para animaciones de entrada
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Una vez visible, no necesitamos seguir observando
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Gestión del tema oscuro/claro
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Aplicar tema guardado
        this.applyTheme(this.currentTheme);
        
        // Event listener para el botón de toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Detectar preferencia del sistema
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                this.currentTheme = 'dark';
                this.applyTheme('dark');
            }
        }

        // Escuchar cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Animación del botón
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'scale(1)';
            }, 150);
        }

        // Mostrar notificación
        mostrarNotificacion(
            `Modo ${this.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
            'info'
        );
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        this.currentTheme = theme;
    }
}

// Función para mejorar el rendimiento del scroll con throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Función para detectar cuando la navegación debe cambiar de estilo
function handleNavigationScroll() {
    const nav = document.querySelector('nav');
    const scrolled = window.pageYOffset;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (scrolled > 100) {
        if (currentTheme === 'dark') {
            nav.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        nav.style.boxShadow = '0 2px 20px var(--shadow-light)';
    } else {
        if (currentTheme === 'dark') {
            nav.style.background = 'rgba(0, 0, 0, 0.8)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.8)';
        }
        nav.style.boxShadow = 'none';
    }
}

// Función para animar contadores
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Función para suavizar el scroll a secciones
function smoothScrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        const navHeight = document.querySelector('nav').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Función para precargar imágenes
function preloadImages() {
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        const imageLoader = new Image();
        imageLoader.src = img.src;
    });
}

// ===== FUNCIONES ORIGINALES DE LOMAX =====

// Función para mostrar saludo personalizado
function mostrarSaludo(nombre) {
    const saludos = [
        `¡Hola de nuevo, ${nombre}! ¿Listo para entrenar? 💪`,
        `${nombre}, sigue dándolo todo. Tu esfuerzo vale la pena.`,
        `¡Bienvenido otra vez, ${nombre}! A por un nuevo reto.`,
        `¡Excelente día para entrenar, ${nombre}! 🔥`,
        `${nombre}, cada día eres más fuerte. ¡Sigamos! 💯`,
        `¡Hora de brillar, ${nombre}! Tu momento es ahora 🌟`,
        `${nombre}, hoy es perfecto para superar tus límites 🚀`
    ];
    const aleatorio = saludos[Math.floor(Math.random() * saludos.length)];
    
    const bienvenidaEl = document.getElementById("bienvenida");
    if (bienvenidaEl) {
        // Animación de cambio de texto
        bienvenidaEl.style.opacity = '0';
        bienvenidaEl.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            bienvenidaEl.textContent = aleatorio;
            bienvenidaEl.style.opacity = '1';
            bienvenidaEl.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Función para cargar resumen del día
async function cargarResumenDelDia(userId) {
    try {
        await cargarResumenRutina(userId);
        await cargarResumenNutricion(userId);
        await cargarDiasActivo(userId);
    } catch (error) {
        console.error("Error al cargar resumen del día:", error);
    }
}

// Función para cargar resumen de rutina
async function cargarResumenRutina(userId) {
    const hoy = new Date();
    const diaHoy = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];
    const descripcionRutina = document.getElementById("descripcion-rutina");

    if (!descripcionRutina) return;

    try {
        if (diaHoy === "Sábado" || diaHoy === "Domingo") {
            descripcionRutina.textContent = "Día de descanso 🛌 - Disfruta tu tiempo libre";
            return;
        }

        // Verificar si el usuario tiene guía
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guiaUsuario = guias.find(g => g.idUsuario === userId);
        
        if (!guiaUsuario) {
            descripcionRutina.textContent = "Completa tu perfil para ver tu rutina";
            return;
        }

        // Cargar rutinas desde JSON para obtener descripción
        const data = await fetch("../data/rutinas-entrenamiento.json").then(r => r.json());
        const objetivo = guiaUsuario.objetivo;
        
        let rutina = data.rutinas[objetivo] || data.rutinas["Ganar masa muscular"];
        const ejerciciosHoy = rutina.dias.find(d => d.dia === diaHoy);
        
        if (ejerciciosHoy) {
            descripcionRutina.textContent = `${ejerciciosHoy.grupoMuscular} - ${ejerciciosHoy.ejercicios.length} ejercicios`;
        } else {
            descripcionRutina.textContent = "No hay rutina programada para hoy";
        }

    } catch (error) {
        console.error("Error al cargar resumen de rutina:", error);
        descripcionRutina.textContent = "Error al cargar rutina";
    }
}

// Función para cargar resumen de nutrición
async function cargarResumenNutricion(userId) {
    const descripcionNutricion = document.getElementById("descripcion-nutricion");

    if (!descripcionNutricion) return;

    try {
        // Verificar membresía
        const membresias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias").then(r => r.json());
        const miembro = membresias.find(m => m.idUsuario === userId);
        const tipoMembresia = miembro?.tipoMembresia?.nombre || "Básico";

        if (tipoMembresia === "Básico") {
            descripcionNutricion.textContent = "Actualiza tu plan para acceder";
            return;
        }

        const hoy = new Date();
        const diaHoy = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];

        if (diaHoy === "Sábado" || diaHoy === "Domingo") {
            descripcionNutricion.textContent = "Día libre - Disfruta con moderación ☕";
            return;
        }

        // Verificar si tiene guía nutricional
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guiaUsuario = guias.find(g => g.idUsuario === userId);
        
        if (!guiaUsuario) {
            descripcionNutricion.textContent = "Completa tu perfil nutricional";
            return;
        }

        descripcionNutricion.textContent = `Plan ${tipoMembresia} - Desayuno, almuerzo y merienda`;

    } catch (error) {
        console.error("Error al cargar resumen de nutrición:", error);
        descripcionNutricion.textContent = "Error al cargar plan nutricional";
    }
}

// Función para calcular días activo
async function cargarDiasActivo(userId) {
    const diasEl = document.getElementById("dias-activo");
    if (!diasEl) return;

    try {
        const usuarios = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/UsuariosApi").then(r => r.json());
        const usuario = usuarios.find(u => u.idUsuario === userId);
        
        if (usuario && usuario.fechaRegistro) {
            const fechaRegistro = new Date(usuario.fechaRegistro);
            const hoy = new Date();
            const diffTime = Math.abs(hoy - fechaRegistro);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Animar el contador
            animateCounter(diasEl, diffDays, 1500);
        } else {
            diasEl.textContent = "1";
        }
    } catch (error) {
        console.error("Error al cargar días activo:", error);
        diasEl.textContent = "0";
    }
}

// Función para cargar frase motivacional
function cargarFraseMotivacional() {
    const frases = [
        "¡Cada día es una nueva oportunidad para ser mejor!",
        "El éxito no se logra solo con cualidades especiales. Es sobre todo un trabajo de constancia.",
        "Tu único límite eres tú mismo. ¡Rómpelo!",
        "No se trata de ser perfecto, se trata de ser mejor que ayer.",
        "El dolor que sientes hoy será la fuerza que sentirás mañana.",
        "Cada repetición te acerca más a tu objetivo.",
        "La disciplina es elegir entre lo que quieres ahora y lo que quieres más.",
        "No dejes que lo que no puedes hacer interfiera con lo que sí puedes hacer.",
        "El cuerpo logra lo que la mente cree posible.",
        "Champions train, losers complain. ¿Qué eliges ser hoy?"
    ];

    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    const fraseEl = document.getElementById("frase-dia");
    
    if (fraseEl) {
        fraseEl.textContent = fraseAleatoria;
    }
}

// Función para configurar event listeners del menú
function setupMenuEventListeners() {
    const userProfile = document.getElementById("user-profile");
    const userDropdown = document.getElementById("user-dropdown");

    if (userProfile && userDropdown) {
        userProfile.addEventListener("click", function (e) {
            userDropdown.classList.toggle("active");
            e.stopPropagation();
            
            // Animación del avatar
            const avatar = userProfile.querySelector('.user-avatar');
            if (avatar) {
                avatar.style.transform = "scale(0.95)";
                setTimeout(() => {
                    avatar.style.transform = "scale(1)";
                }, 100);
            }
        });

        document.addEventListener("click", function (e) {
            if (!userProfile.contains(e.target)) {
                userDropdown.classList.remove("active");
            }
        });

        // Cerrar dropdown con Escape
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
                userDropdown.classList.remove("active");
            }
        });
    }
}

// Función para mostrar notificación temporal
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 1rem 1.5rem; border-radius: 12px; color: white;
        font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transform: translateX(400px); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Colores según tipo
    const colores = {
        'info': 'linear-gradient(135deg, #007AFF 0%, #5856d6 100%)',
        'success': 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
        'warning': 'linear-gradient(135deg, #ff9500 0%, #ffcc02 100%)',
        'error': 'linear-gradient(135deg, #ff3b30 0%, #ff6961 100%)'
    };
    
    notificacion.style.background = colores[tipo] || colores.info;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.style.transform = 'translateX(400px)';
        notificacion.style.opacity = '0';
        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.remove();
            }
        }, 400);
    }, 4000);
}

// Función para manejar errores de conexión
function manejarErrorConexion(error) {
    console.error("Error de conexión:", error);
    mostrarNotificacion("Error de conexión con el servidor", "error");
}

// Función principal de inicialización
async function init() {
    // Inicializar gestor de temas
    new ThemeManager();
    
    // Observar todos los elementos con clases de animación
    const animatedElements = document.querySelectorAll(
        '.fade-in-up, .fade-in-left, .fade-in-right, .scale-in'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Configurar solo el scroll de navegación (SIN PARALLAX)
    const throttledNavScroll = throttle(handleNavigationScroll, 16);
    window.addEventListener('scroll', throttledNavScroll);

    // Añadir efecto de hover mejorado a las cards
    const accesoCards = document.querySelectorAll('.acceso-card');
    accesoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Mejorar la navegación con indicación visual
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            // Añadir clase active al link clickeado
            this.classList.add('active');
        });
    });

    // Añadir efectos al botón CTA
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.boxShadow = '0 10px 30px rgba(0, 122, 255, 0.4)';
        });
        
        ctaButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-1px) scale(1)';
            this.style.boxShadow = '0 8px 25px rgba(0, 122, 255, 0.3)';
        });
    }

    // Precargar imágenes para mejor UX
    preloadImages();

    // Event listeners del menú
    setupMenuEventListeners();

    // ===== LÓGICA ORIGINAL DE LOMAX =====
    const userId = parseInt(sessionStorage.getItem("usuarioId"));
    const nombre = sessionStorage.getItem("usuarioNombre");

    if (!userId || !nombre) {
        window.location.href = "../login/login.html";
        return;
    }

    try {
        const usuarios = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/UsuariosApi").then(r => r.json());
        const usuarioActual = usuarios.find(u => u.idUsuario === userId);
        if (usuarioActual) {
            console.log("Datos actualizados del usuario desde API:", usuarioActual);
        }
    } catch (error) {
        console.error("Error al obtener datos actualizados del usuario:", error);
        manejarErrorConexion(error);
    }

    document.getElementById("bienvenida").textContent = `Bienvenido a LoMax, ${nombre}`;

    try {
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const tieneGuia = guias.some(g => g.idUsuario === userId);

        if (!tieneGuia) {
            // TODOS deben completar el modal, sin importar el plan
            // Usar la función global del modal
            if (typeof mostrarModalNutricional === 'function') {
                mostrarModalNutricional(userId, nombre, async (resultado) => {
                    // Callback que se ejecuta después de guardar la guía
                    mostrarSaludo(nombre);
                    await cargarResumenDelDia(userId);
                });
            } else {
                mostrarSaludo(nombre);
                await cargarResumenDelDia(userId);
            }
        } else {
            // Si ya tiene guía, mostrar contenido
            mostrarSaludo(nombre);
            await cargarResumenDelDia(userId);
        }

    } catch (e) {
        console.error("Error al cargar guía:", e);
        manejarErrorConexion(e);
    }

    // Cargar frase motivacional
    cargarFraseMotivacional();

    // Añadir clase loaded al body para transiciones de entrada
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Función para limpiar event listeners cuando sea necesario
function cleanup() {
    window.removeEventListener('scroll', handleNavigationScroll);
    observer.disconnect();
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', init);

// Manejo del estado de la página al cargar/salir
window.addEventListener('beforeunload', cleanup);

// Event listener para manejar errores de red globalmente
window.addEventListener('unhandledrejection', event => {
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
        manejarErrorConexion(event.reason);
        event.preventDefault();
    }
});

// Prevenir comportamientos por defecto en ciertos casos
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Mejorar accesibilidad con navegación por teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
});

// Exportar funciones para uso externo si es necesario
window.LoMaxApp = {
    smoothScrollToSection,
    animateCounter,
    mostrarNotificacion,
    init,
    cleanup
};