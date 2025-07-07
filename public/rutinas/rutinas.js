// ===== RUTINAS DE PROGRESO LOGIC - SIMPLIFICADO =====

// Gestión del tema oscuro/claro
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                this.currentTheme = 'dark';
                this.applyTheme('dark');
            }
        }

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
        
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'scale(1)';
            }, 150);
        }

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

// Función para manejar el scroll de navegación
function handleNavigationScroll() {
    const nav = document.querySelector('nav');
    const scrolled = window.pageYOffset;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (scrolled > 100) {
        nav.style.background = currentTheme === 'dark' 
            ? 'rgba(28, 28, 30, 0.95)' 
            : 'rgba(248, 249, 250, 0.95)';
        nav.style.boxShadow = '0 2px 20px var(--card-shadow)';
    } else {
        nav.style.background = currentTheme === 'dark' 
            ? 'rgba(28, 28, 30, 0.85)' 
            : 'rgba(248, 249, 250, 0.85)';
        nav.style.boxShadow = 'none';
    }
}

// Función para throttle
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

// Función para mostrar notificación temporal
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 1rem 1.5rem; border-radius: 12px; color: white;
        font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transform: translateX(400px); transition: all 0.4s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const colores = {
        'info': 'linear-gradient(135deg, #007AFF 0%, #5856d6 100%)',
        'success': 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
        'warning': 'linear-gradient(135deg, #ff9500 0%, #ffcc02 100%)',
        'error': 'linear-gradient(135deg, #ff3b30 0%, #ff6961 100%)'
    };
    
    notificacion.style.background = colores[tipo] || colores.info;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
    }, 100);
    
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

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar gestor de temas
    new ThemeManager();
    
    // Configurar scroll de navegación
    const throttledNavScroll = throttle(handleNavigationScroll, 16);
    window.addEventListener('scroll', throttledNavScroll);
    
    const userId = parseInt(sessionStorage.getItem("usuarioId"));
    const nombre = sessionStorage.getItem("usuarioNombre");

    // Verificar autenticación
    if (!userId || !nombre) {
        window.location.href = "../login/login.html";
        return;
    }

    // Actualizar descripción con el nombre del usuario
    document.getElementById("descripcion-usuario").textContent = 
        `Plan de entrenamiento personalizado para ${nombre}`;

    // Cargar datos del usuario y mostrar contenido
    await cargarDatosUsuario(userId);
    await mostrarEstadisticasProgreso(userId);
    await mostrarRutinaDelDia(userId);
    await cargarHistorialEntrenamientos(userId);

    // Event listeners del menú
    setupMenuEventListeners();
});

// Función para configurar event listeners del menú
function setupMenuEventListeners() {
    const userProfile = document.getElementById("user-profile");
    const userDropdown = document.getElementById("user-dropdown");

    if (userProfile && userDropdown) {
        userProfile.addEventListener("click", function (e) {
            userDropdown.classList.toggle("active");
            e.stopPropagation();
            
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

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
                userDropdown.classList.remove("active");
            }
        });
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Función para cargar datos del usuario
async function cargarDatosUsuario(userId) {
    try {
        const usuarios = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/UsuariosApi").then(r => r.json());
        const usuarioActual = usuarios.find(u => u.idUsuario === userId);
        if (usuarioActual) {
            console.log("Datos del usuario cargados:", usuarioActual);
        }
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        mostrarNotificacion("Error al cargar datos del usuario", "error");
    }
}

// Función para mostrar estadísticas de progreso
async function mostrarEstadisticasProgreso(userId) {
    try {
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guiaUsuario = guias.find(g => g.idUsuario === userId);
        
        if (guiaUsuario) {
            document.getElementById("objetivo-usuario").textContent = guiaUsuario.objetivo;
        }

        const stats = obtenerEstadisticasSimuladas();
        
        setTimeout(() => {
            animateCounter(document.getElementById("dias-entrenados"), stats.diasEntrenados, 1500);
        }, 500);
        
        setTimeout(() => {
            animateCounter(document.getElementById("ejercicios-completados"), stats.ejerciciosCompletados, 1800);
        }, 700);
        
        setTimeout(() => {
            animateCounter(document.getElementById("racha-actual"), stats.rachaActual, 1200);
        }, 900);

    } catch (error) {
        console.error("Error al mostrar estadísticas:", error);
        mostrarNotificacion("Error al cargar estadísticas", "error");
    }
}

// Función para obtener estadísticas simuladas
function obtenerEstadisticasSimuladas() {
    return {
        diasEntrenados: Math.floor(Math.random() * 30) + 10,
        ejerciciosCompletados: Math.floor(Math.random() * 200) + 50,
        rachaActual: Math.floor(Math.random() * 10) + 1
    };
}

// Función principal para mostrar rutinas del día
async function mostrarRutinaDelDia(userId) {
    const hoy = new Date();
    const diaHoy = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];
    const contenedorRutinas = document.getElementById("rutinas-diarias");

    if (diaHoy === "Sábado" || diaHoy === "Domingo") {
        contenedorRutinas.innerHTML = `
            <div class="container">
                <div class="mensaje-descanso-rutina">
                    <h3>🛌 Día de descanso</h3>
                    <p>El descanso es parte del entrenamiento. ¡Disfruta tu ${diaHoy}!</p>
                    <div class="consejos-descanso">
                        <h4>💡 Consejos para tu día de descanso:</h4>
                        <ul>
                            <li>🥤 Mantente hidratado</li>
                            <li>🛏️ Duerme al menos 7-8 horas</li>
                            <li>🚶‍♂️ Haz actividad ligera (caminar)</li>
                            <li>🧘‍♀️ Practica estiramientos suaves</li>
                            <li>🧠 Permite que tus músculos se recuperen</li>
                            <li>📚 Revisa tu progreso de la semana</li>
                        </ul>
                    </div>
                </div>
            </div>`;
        return;
    }

    try {
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guiaUsuario = guias.find(g => g.idUsuario === userId);
        
        if (!guiaUsuario) {
            contenedorRutinas.innerHTML = `
                <div class="container">
                    <div class="mensaje-sin-rutina">
                        <h3>⚠️ Completa tu perfil primero</h3>
                        <p>Para mostrarte una rutina personalizada, necesitas completar tu guía nutricional desde la página principal.</p>
                        <a href="../home/home.html" class="btn" style="margin-top: 1rem; display: inline-block;">
                            Completar Perfil
                        </a>
                    </div>
                </div>`;
            return;
        }

        const data = await fetch("../data/rutinas-entrenamiento.json").then(r => r.json());
        
        let rutina = null;
        const objetivo = guiaUsuario.objetivo;
        
        if (data.rutinas[objetivo]) {
            rutina = data.rutinas[objetivo];
            console.log("✅ Rutina encontrada para objetivo:", objetivo);
        } else {
            rutina = data.rutinas["Ganar masa muscular"];
            console.log("⚠️ Usando rutina por defecto para objetivo:", objetivo);
        }

        const ejerciciosHoy = rutina.dias.find(d => d.dia === diaHoy);
        
        if (!ejerciciosHoy) {
            contenedorRutinas.innerHTML = `
                <div class="container">
                    <div class="mensaje-sin-ejercicios">
                        <h3>📋 No hay rutina programada para hoy</h3>
                        <p>Disfruta este ${diaHoy} o haz cardio ligero de 20-30 minutos.</p>
                        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--rutina-white); border-radius: 16px; border: 1px solid var(--rutina-border);">
                            <h4 style="color: var(--rutina-primary); margin-bottom: 0.5rem;">💡 Actividades sugeridas:</h4>
                            <ul style="margin: 0; padding-left: 1.5rem; color: var(--rutina-text-secondary);">
                                <li>Caminar o trotar ligero</li>
                                <li>Ejercicios de flexibilidad</li>
                                <li>Yoga o pilates</li>
                                <li>Actividades recreativas</li>
                            </ul>
                        </div>
                    </div>
                </div>`;
            return;
        }

        mostrarRutinaHTML(ejerciciosHoy, diaHoy, objetivo);

    } catch (error) {
        console.error("Error al cargar rutina del día:", error);
        contenedorRutinas.innerHTML = `
            <div class="container">
                <div class="mensaje-error-rutina">
                    <h3>❌ Error al cargar rutina</h3>
                    <p>Hubo un problema al cargar tu rutina. Por favor, recarga la página o contacta con soporte.</p>
                    <button onclick="window.location.reload()" class="btn" style="margin-top: 1rem;">
                        Recargar Página
                    </button>
                </div>
            </div>`;
        
        mostrarNotificacion("Error al cargar rutina del día", "error");
    }
}

// Función para generar el HTML de la rutina - SIN contenedores extra
function mostrarRutinaHTML(ejerciciosHoy, diaHoy, objetivo) {
    const contenedorRutinas = document.getElementById("rutinas-diarias");
    
    let htmlRutina = `
        <div class="container">
            <div class="rutina-header">
                <h3>💪 Rutina para hoy ${diaHoy}</h3>
                <p class="objetivo-rutina">Objetivo: <span>${objetivo}</span></p>
            </div>
            <div class="grupo-muscular">
                <h4 class="titulo-grupo">${ejerciciosHoy.grupoMuscular}</h4>
                <p class="descripcion-grupo">${ejerciciosHoy.descripcion}</p>
                <div class="ejercicios-container">`;

    ejerciciosHoy.ejercicios.forEach((ejercicio, index) => {
        htmlRutina += `
            <div class="ejercicio-card" data-ejercicio-id="${index}">
                <div class="ejercicio-header">
                    <h5>${ejercicio.nombre}</h5>
                    <span class="orden-ejercicio">#${index + 1}</span>
                </div>
                <div class="ejercicio-detalles">
                    <div class="detalle-item">
                        <span class="etiqueta">Series:</span>
                        <span class="valor">${ejercicio.series}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="etiqueta">Repeticiones:</span>
                        <span class="valor">${ejercicio.repeticiones}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="etiqueta">Descanso:</span>
                        <span class="valor">${ejercicio.descanso || 'A tu ritmo'}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="etiqueta">Peso:</span>
                        <span class="valor">${ejercicio.peso || 'Según capacidad'}</span>
                    </div>
                </div>`;
        
        if (ejercicio.observaciones) {
            htmlRutina += `
                <div class="ejercicio-observaciones">
                    <i class="fas fa-lightbulb"></i>
                    <span>${ejercicio.observaciones}</span>
                </div>`;
        }
        
        htmlRutina += `
                <div class="ejercicio-acciones">
                    <button class="btn-completar" onclick="marcarEjercicioCompletado(this, '${ejercicio.nombre}')">
                        <i class="fas fa-check"></i> Completado
                    </button>
                </div>
            </div>`;
    });

    // SIN contenedores extra en rutina-footer y consejos-entrenamiento
    htmlRutina += `
                </div>
            </div>
            <div class="rutina-footer">
                <div class="motivacion">
                    <h4>🎯 ¡Vamos que puedes!</h4>
                    <p>Recuerda: la constancia es la clave del éxito. Cada repetición te acerca más a tu objetivo.</p>
                </div>
                <div class="consejos-entrenamiento">
                    <h5>💡 Consejos importantes:</h5>
                    <ul>
                        <li>🔥 Calienta antes de empezar (5-10 min)</li>
                        <li>💧 Mantente hidratado durante todo el entrenamiento</li>
                        <li>🎯 Prioriza la técnica sobre el peso</li>
                        <li>😮‍💨 Respira correctamente en cada ejercicio</li>
                        <li>🧘‍♂️ Estira al finalizar tu rutina</li>
                    </ul>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button onclick="completarRutinaCompleta()" class="btn">
                        <i class="fas fa-check-circle"></i> Marcar Rutina Completa
                    </button>
                </div>
            </div>
        </div>`;

    contenedorRutinas.innerHTML = htmlRutina;
}

// Función para marcar ejercicio como completado
function marcarEjercicioCompletado(boton, nombreEjercicio) {
    boton.innerHTML = '<i class="fas fa-check-circle"></i> ¡Completado!';
    boton.style.background = 'var(--rutina-success)';
    boton.disabled = true;
    
    const card = boton.closest('.ejercicio-card');
    card.style.background = 'var(--rutina-gradient-light)';
    card.style.border = '2px solid var(--rutina-success)';
    
    guardarEjercicioCompletado(nombreEjercicio);
    mostrarNotificacion(`Ejercicio completado: ${nombreEjercicio}`, 'success');
    
    console.log('Ejercicio marcado como completado:', nombreEjercicio);
}

// Función para completar rutina completa
function completarRutinaCompleta() {
    const botones = document.querySelectorAll('.btn-completar:not(:disabled)');
    
    if (botones.length > 0) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); display: flex; align-items: center; 
            justify-content: center; z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--rutina-white); padding: 2rem; border-radius: 20px; text-align: center; max-width: 400px; border: 1px solid var(--rutina-border); box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">🤔</div>
                <h3 style="color: var(--rutina-text-primary); margin-bottom: 1rem; font-size: 1.375rem;">¿Completaste toda la rutina?</h3>
                <p style="color: var(--rutina-text-secondary); margin-bottom: 2rem; line-height: 1.5;">Esto marcará todos los ejercicios como completados.</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="this.closest('div').parentElement.remove()" 
                            style="background: var(--rutina-bg-secondary); color: var(--rutina-text-primary); border: 1px solid var(--rutina-border); padding: 0.75rem 1.5rem; 
                                   border-radius: 12px; cursor: pointer; font-weight: 500;">
                        Cancelar
                    </button>
                    <button onclick="confirmarRutinaCompleta(); this.closest('div').parentElement.remove()" 
                            style="background: var(--rutina-primary); color: white; border: none; padding: 0.75rem 1.5rem; 
                                   border-radius: 12px; cursor: pointer; font-weight: 600;">
                        Sí, completé todo
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } else {
        mostrarNotificacion('¡Excelente! Ya completaste todos los ejercicios de hoy.', 'success');
    }
}

// Función auxiliar para confirmar rutina completa
function confirmarRutinaCompleta() {
    const botones = document.querySelectorAll('.btn-completar:not(:disabled)');
    
    botones.forEach(boton => {
        const nombreEjercicio = boton.closest('.ejercicio-card').querySelector('h5').textContent;
        marcarEjercicioCompletado(boton, nombreEjercicio);
    });
    
    setTimeout(() => mostrarMensajeFelicitacion(), 500);
}

// Función para mostrar mensaje de felicitación
function mostrarMensajeFelicitacion() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); display: flex; align-items: center; 
        justify-content: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--rutina-white); padding: 2.5rem; border-radius: 20px; text-align: center; max-width: 400px; border: 1px solid var(--rutina-border); box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="color: var(--rutina-primary); margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">¡Rutina Completada!</h3>
            <p style="color: var(--rutina-text-secondary); margin-bottom: 2rem; line-height: 1.6;">Excelente trabajo. Has completado tu entrenamiento de hoy. ¡Sigue así!</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: var(--rutina-primary); color: white; border: none; padding: 1rem 2rem; 
                           border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                ¡Genial! 🚀
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 5000);
    
    mostrarNotificacion('¡Rutina completada! Excelente trabajo.', 'success');
}

// Función para guardar ejercicio completado
function guardarEjercicioCompletado(nombreEjercicio) {
    const fecha = new Date().toLocaleDateString();
    let historial = JSON.parse(localStorage.getItem('historialEjercicios') || '[]');
    
    historial.push({
        ejercicio: nombreEjercicio,
        fecha: fecha,
        timestamp: Date.now()
    });
    
    if (historial.length > 50) {
        historial = historial.slice(-50);
    }
    
    localStorage.setItem('historialEjercicios', JSON.stringify(historial));
}

// Función para cargar historial de entrenamientos
async function cargarHistorialEntrenamientos(userId) {
    try {
        const historialContainer = document.getElementById("historial-container");
        
        const historial = JSON.parse(localStorage.getItem('historialEjercicios') || '[]');
        
        if (historial.length === 0) {
            historialContainer.innerHTML = `
                <div class="mensaje-historial">
                    <p>Aún no tienes entrenamientos registrados. ¡Completa tu primera rutina!</p>
                </div>
            `;
            return;
        }

        const ejerciciosPorFecha = historial.reduce((acc, item) => {
            const fecha = item.fecha;
            if (!acc[fecha]) {
                acc[fecha] = [];
            }
            acc[fecha].push(item.ejercicio);
            return acc;
        }, {});

        let historialHTML = '';
        const fechas = Object.keys(ejerciciosPorFecha).sort().reverse().slice(0, 10);
        
        fechas.forEach(fecha => {
            const ejercicios = ejerciciosPorFecha[fecha];
            historialHTML += `
                <div class="historial-item">
                    <div class="historial-fecha">${fecha}</div>
                    <div class="historial-rutina">Entrenamiento completado</div>
                    <div class="historial-ejercicios">${ejercicios.length} ejercicio(s): ${ejercicios.slice(0, 3).join(', ')}${ejercicios.length > 3 ? '...' : ''}</div>
                </div>
            `;
        });

        historialContainer.innerHTML = historialHTML;

    } catch (error) {
        console.error("Error al cargar historial:", error);
        document.getElementById("historial-container").innerHTML = `
            <div class="mensaje-historial">
                <p>Error al cargar el historial de entrenamientos.</p>
            </div>
        `;
        mostrarNotificacion("Error al cargar historial", "error");
    }
}

// Función para manejar errores de conexión
function manejarErrorConexion(error) {
    console.error("Error de conexión:", error);
    mostrarNotificacion("Error de conexión con el servidor", "error");
}

// Event listener para manejar errores de red globalmente
window.addEventListener('unhandledrejection', event => {
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
        manejarErrorConexion(event.reason);
        event.preventDefault();
    }
});

// Exportar funciones para uso externo si es necesario
window.RutinasApp = {
    mostrarNotificacion,
    animateCounter,
    marcarEjercicioCompletado,
    completarRutinaCompleta
};