// ===== MEMBRESÍA LOGIC - ACTUALIZADO SIN TRANSICIONES =====

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

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar gestor de temas
    new ThemeManager();
    
    const userId = parseInt(sessionStorage.getItem("usuarioId"));
    const nombre = sessionStorage.getItem("usuarioNombre");

    // Verificar autenticación
    if (!userId || !nombre) {
        window.location.href = "../login/login.html";
        return;
    }

    // Inicializar página
    await inicializarPaginaMembresia(userId);
    
    // Event listeners
    configurarEventListeners();
    
    // Configurar eventos de scroll con throttle para mejor performance
    const throttledNavScroll = throttle(handleNavigationScroll, 16);
    window.addEventListener('scroll', throttledNavScroll);
});

async function inicializarPaginaMembresia(userId) {
    try {
        // Cargar datos de la membresía
        await mostrarMembresiaUsuario(userId);
        
        // Cargar historial de pagos
        await mostrarHistorialPagos(userId);
        
        // Configurar botones de planes
        configurarBotonesPlanes();
        
    } catch (error) {
        console.error("Error al inicializar página de membresía:", error);
        mostrarMensajeError("Error al cargar la información de membresía");
        mostrarNotificacion("Error al cargar información de membresía", "error");
    }
}

// ===== FUNCIÓN MOVIDA DESDE home.js =====
async function mostrarMembresiaUsuario(userId) {
    try {
        const membresias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias").then(r => r.json());
        const miembro = membresias.find(m => m.idUsuario === userId);
        
        if (!miembro || !miembro.tipoMembresia) {
            mostrarMensajeSinMembresia();
            return;
        }

        const tipo = miembro.tipoMembresia.nombre;
        const vencimiento = new Date(miembro.fechaFin);
        const inicio = new Date(miembro.fechaInicio);
        const hoy = new Date();
        const diasTotales = Math.ceil((vencimiento - inicio) / (1000 * 60 * 60 * 24));
        const diasRestantes = Math.max(0, Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24)));
        const porcentaje = Math.min(100, (diasRestantes / diasTotales) * 100);

        const beneficios = {
            "Básico": [
                "Acceso a una sola sede (elige tu sede principal)", 
                "Área de pesas y máquinas cardiovasculares", 
                "Clases grupales (Zumba, Funcional, Spinning, etc)", 
                "Asesoramiento básico en entrenamiento", 
                "Uso de vestidores y duchas", 
                "Acceso a eventos internos del gimnasio"
            ],
            "Premium": [
                "Todo lo incluido en la Membresía Básica", 
                "Acceso a todas las sedes", 
                "2 sesiones de entrenamiento personal (PT) al mes", 
                "Guía nutricional en la app", 
                "Seguimiento mensual de progreso físico", 
                "Descuento en suplementos y productos del gimnasio"
            ],
            "Élite": [
                "Todo lo incluido en la Membresía Premium", 
                "Acceso ilimitado a entrenadores personales (previa reserva)", 
                "Plan de entrenamiento personalizado mensual", 
                "Prioridad en reserva de clases y horarios con entrenador", 
                "1 suplemento post-entrenamiento por sesión (batido de proteínas o bebida energética, según disponibilidad)"
            ]
        };

        const ul = (beneficios[tipo] || []).map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join("");

        // Estado de la membresía
        let estadoMembresia = "";
        let claseEstado = "";
        
        if (diasRestantes <= 0) {
            estadoMembresia = "Expirada";
            claseEstado = "expirada";
        } else if (diasRestantes <= 7) {
            estadoMembresia = "Por vencer";
            claseEstado = "por-vencer";
        } else {
            estadoMembresia = "Activa";
            claseEstado = "activa";
        }

        document.getElementById("membership-section").innerHTML = `
            <div class="container">
                <div class="membership-card">
                    <div class="membership-header">
                        <div class="membership-icon">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div class="membership-info">
                            <h3>Tu Membresía Actual: ${tipo}</h3>
                            <p class="membership-expiry estado-${claseEstado}">
                                Estado: <span>${estadoMembresia}</span> | 
                                Vence: <span>${vencimiento.toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div class="membership-details">
                        <div class="membership-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${porcentaje}%"></div>
                            </div>
                            <p>${diasRestantes} días restantes de ${diasTotales} días</p>
                        </div>
                        <ul class="membership-features">${ul}</ul>
                        <div class="membership-actions">
                            <button class="btn btn-primary" onclick="renovarMembresia('${tipo}')">
                                <i class="fas fa-sync-alt"></i> Renovar Membresía
                            </button>
                            <button class="btn btn-secondary" onclick="mostrarModalCambiarPlan('${tipo}')">
                                <i class="fas fa-arrow-up"></i> Cambiar Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        
    } catch (err) {
        console.error("Error cargando membresía:", err);
        mostrarMensajeError("Error al cargar información de membresía");
        mostrarNotificacion("Error al cargar membresía", "error");
    }
}

function mostrarMensajeSinMembresia() {
    document.getElementById("membership-section").innerHTML = `
        <div class="container">
            <div class="mensaje-sin-membresia">
                <h3>⚠️ No tienes membresía activa</h3>
                <p>Selecciona un plan para comenzar tu experiencia en LoMax Fitness</p>
                <button class="btn btn-primary" onclick="scrollToPlans()">
                    <i class="fas fa-star"></i> Ver Planes Disponibles
                </button>
            </div>
        </div>`;
}

// ===== HISTORIAL DE PAGOS =====
async function mostrarHistorialPagos(userId) {
    try {
        // Simulación de datos de historial - En producción vendría de la API
        const pagos = await generarHistorialPagos(userId);
        
        const contenedor = document.getElementById("payments-container");
        
        if (pagos.length === 0) {
            contenedor.innerHTML = `
                <div class="mensaje-sin-pagos">
                    <h4>📝 No hay historial de pagos</h4>
                    <p>Cuando realices tu primer pago, aparecerá aquí</p>
                </div>`;
            return;
        }

        let html = "";
        pagos.forEach((pago) => {
            html += `
                <div class="payment-item">
                    <div class="payment-info">
                        <h4>${pago.concepto}</h4>
                        <p>
                            <i class="fas fa-calendar"></i> ${pago.fecha}
                            <i class="fas fa-credit-card"></i> ${pago.metodo}
                        </p>
                    </div>
                    <div class="payment-details">
                        <div class="payment-amount">$${pago.monto}</div>
                        <span class="payment-status status-${pago.estado.toLowerCase()}">${pago.estado}</span>
                    </div>
                </div>`;
        });

        contenedor.innerHTML = html;
        
    } catch (error) {
        console.error("Error al cargar historial de pagos:", error);
        document.getElementById("payments-container").innerHTML = `
            <div class="mensaje-error">
                <h4>❌ Error al cargar historial</h4>
                <p>No se pudo cargar el historial de pagos</p>
            </div>`;
        mostrarNotificacion("Error al cargar historial de pagos", "error");
    }
}

// Simulación de datos de historial de pagos
async function generarHistorialPagos(userId) {
    // En producción, esto vendría de la API
    const fechaActual = new Date();
    
    return [
        {
            id: 1,
            concepto: "Membresía Premium - Enero 2025",
            monto: "49.00",
            fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toLocaleDateString(),
            metodo: "Tarjeta de Crédito",
            estado: "Pagado"
        },
        {
            id: 2,
            concepto: "Membresía Premium - Diciembre 2024",
            monto: "49.00",
            fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1).toLocaleDateString(),
            metodo: "Tarjeta de Débito",
            estado: "Pagado"
        },
        {
            id: 3,
            concepto: "Membresía Premium - Noviembre 2024",
            monto: "49.00",
            fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 2, 1).toLocaleDateString(),
            metodo: "Transferencia",
            estado: "Pagado"
        }
    ];
}

// ===== GESTIÓN DE PLANES =====
function configurarBotonesPlanes() {
    const botones = document.querySelectorAll('.btn-plan');
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            
            // Animación del botón
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            seleccionarPlan(plan);
        });
    });
}

function seleccionarPlan(planSeleccionado) {
    // Obtener plan actual del usuario
    const userId = parseInt(sessionStorage.getItem("usuarioId"));
    
    mostrarNotificacion("Verificando plan actual...", "info");
    
    fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias")
        .then(r => r.json())
        .then(membresias => {
            const miembro = membresias.find(m => m.idUsuario === userId);
            const planActual = miembro?.tipoMembresia?.nombre || "Ninguno";
            
            if (planActual === planSeleccionado) {
                mostrarNotificacion("Ya tienes este plan activo", "info");
                return;
            }
            
            mostrarModalConfirmacionPlan(planActual, planSeleccionado);
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarNotificacion("Error al procesar solicitud", "error");
        });
}

function mostrarModalConfirmacionPlan(planActual, planNuevo) {
    const precios = {
        "Básico": 29,
        "Premium": 49,
        "Élite": 69
    };
    
    const precio = precios[planNuevo] || 0;
    const diferencia = precio - (precios[planActual] || 0);
    
    let mensaje = `
        <div class="cambio-plan-info">
            <h4>Cambio de Plan</h4>
            <p><strong>Plan actual:</strong> ${planActual}</p>
            <p><strong>Plan nuevo:</strong> ${planNuevo}</p>
            <p><strong>Precio mensual:</strong> $${precio}</p>`;
    
    if (diferencia > 0) {
        mensaje += `<p class="diferencia-precio">
            <strong>Diferencia a pagar:</strong> <span style="color: var(--membresia-primary);">+$${diferencia}</span>
        </p>`;
    } else if (diferencia < 0) {
        mensaje += `<p class="diferencia-precio">
            <strong>Ahorro mensual:</strong> <span style="color: var(--activa-color);">$${Math.abs(diferencia)}</span>
        </p>`;
    }
    
    mensaje += `
        <div class="confirmacion-cambio">
            <i class="fas fa-info-circle"></i>
            <p>El cambio será efectivo inmediatamente y se prorrateará en tu próxima factura.</p>
        </div>
        </div>`;

    document.getElementById("modal-title").textContent = "Confirmar Cambio de Plan";
    document.getElementById("modal-body").innerHTML = mensaje;
    
    // Configurar botones del modal
    document.getElementById("btn-confirm").onclick = function() {
        confirmarCambioPlan(planNuevo);
    };
    
    document.getElementById("modal-overlay").classList.add("active");
}

function confirmarCambioPlan(planNuevo) {
    // Simular procesamiento
    mostrarNotificacion("Procesando cambio de plan...", "info");
    
    // Añadir loading al botón
    const btnConfirm = document.getElementById("btn-confirm");
    const originalText = btnConfirm.innerHTML;
    btnConfirm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btnConfirm.disabled = true;
    
    setTimeout(() => {
        // En producción, aquí iría la llamada a la API para actualizar el plan
        cerrarModal();
        mostrarNotificacion(`¡Plan cambiado exitosamente a ${planNuevo}!`, "success");
        
        // Restaurar botón
        btnConfirm.innerHTML = originalText;
        btnConfirm.disabled = false;
        
        // Recargar información de membresía
        const userId = parseInt(sessionStorage.getItem("usuarioId"));
        mostrarMembresiaUsuario(userId);
    }, 2000);
}

function renovarMembresia(tipoMembresia) {
    const precios = {
        "Básico": 29,
        "Premium": 49,
        "Élite": 69
    };
    
    const precio = precios[tipoMembresia] || 0;
    
    const mensaje = `
        <div class="renovacion-info">
            <h4>Renovar Membresía ${tipoMembresia}</h4>
            <p><strong>Precio:</strong> $${precio}/mes</p>
            <p><strong>Duración:</strong> 30 días</p>
            <div class="metodos-pago">
                <h5>Selecciona método de pago:</h5>
                <div class="metodo-item">
                    <input type="radio" id="tarjeta" name="metodo" value="tarjeta" checked>
                    <label for="tarjeta"><i class="fas fa-credit-card"></i> Tarjeta de Crédito/Débito</label>
                </div>
                <div class="metodo-item">
                    <input type="radio" id="transferencia" name="metodo" value="transferencia">
                    <label for="transferencia"><i class="fas fa-university"></i> Transferencia Bancaria</label>
                </div>
                <div class="metodo-item">
                    <input type="radio" id="efectivo" name="metodo" value="efectivo">
                    <label for="efectivo"><i class="fas fa-money-bill"></i> Pago en Efectivo</label>
                </div>
                <div class="metodo-item">
                    <input type="radio" id="paypal" name="metodo" value="paypal">
                    <label for="paypal"><i class="fab fa-paypal"></i> PayPal</label>
                </div>
            </div>
        </div>`;

    document.getElementById("modal-title").textContent = "Renovar Membresía";
    document.getElementById("modal-body").innerHTML = mensaje;
    
    document.getElementById("btn-confirm").onclick = function() {
        procesarRenovacion(tipoMembresia);
    };
    
    document.getElementById("modal-overlay").classList.add("active");
}

function procesarRenovacion(tipoMembresia) {
    const metodoSeleccionado = document.querySelector('input[name="metodo"]:checked').value;
    
    mostrarNotificacion("Procesando renovación...", "info");
    
    // Añadir loading al botón
    const btnConfirm = document.getElementById("btn-confirm");
    const originalText = btnConfirm.innerHTML;
    btnConfirm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btnConfirm.disabled = true;
    
    setTimeout(() => {
        cerrarModal();
        mostrarNotificacion(`¡Membresía ${tipoMembresia} renovada exitosamente!`, "success");
        
        // Restaurar botón
        btnConfirm.innerHTML = originalText;
        btnConfirm.disabled = false;
        
        // Recargar información
        const userId = parseInt(sessionStorage.getItem("usuarioId"));
        mostrarMembresiaUsuario(userId);
        mostrarHistorialPagos(userId);
    }, 2000);
}

// ===== EVENT LISTENERS =====
function configurarEventListeners() {
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

    // Modal controls
    document.getElementById("modal-close").addEventListener("click", cerrarModal);
    document.getElementById("btn-cancel").addEventListener("click", cerrarModal);
    
    document.getElementById("modal-overlay").addEventListener("click", function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });

    // Cerrar modal con Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            cerrarModal();
        }
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
}

// ===== FUNCIONES AUXILIARES =====
function cerrarModal() {
    document.getElementById("modal-overlay").classList.remove("active");
}

function scrollToPlans() {
    document.getElementById("available-plans").scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function mostrarNotificacion(mensaje, tipo = "info") {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 1rem 1.5rem; border-radius: 12px; color: white;
        font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transform: translateX(400px); transition: all 0.4s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex; align-items: center; gap: 8px;
    `;
    
    // Colores según tipo
    const colores = {
        'info': 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
        'success': 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
        'warning': 'linear-gradient(135deg, #ff9500 0%, #ffcc02 100%)',
        'error': 'linear-gradient(135deg, #ff3b30 0%, #ff6961 100%)'
    };
    
    // Iconos según tipo
    const iconos = {
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle'
    };
    
    notificacion.style.background = colores[tipo] || colores.info;
    notificacion.innerHTML = `<i class="${iconos[tipo] || iconos.info}"></i> ${mensaje}`;
    
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

function mostrarMensajeError(mensaje) {
    document.getElementById("membership-section").innerHTML = `
        <div class="container">
            <div class="mensaje-error">
                <h3>❌ Error</h3>
                <p>${mensaje}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        </div>`;
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

// Función para limpiar event listeners cuando sea necesario
function cleanup() {
    window.removeEventListener('scroll', handleNavigationScroll);
}

// Manejo del estado de la página al cargar/salir
window.addEventListener('beforeunload', cleanup);

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

// Funciones globales para hacer disponibles desde HTML
window.renovarMembresia = renovarMembresia;
window.mostrarModalCambiarPlan = function(planActual) {
    // Esta función se puede personalizar según necesidades
    console.log('Cambiar plan desde:', planActual);
};
window.scrollToPlans = scrollToPlans;

// Exportar funciones para uso externo si es necesario
window.MembresiaApp = {
    mostrarNotificacion,
    cerrarModal,
    scrollToPlans,
    cleanup
};