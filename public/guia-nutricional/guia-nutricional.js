//guia-nutricional/guia-nutricional.js
// ===== GUÍA NUTRICIONAL LOGIC - OPTIMIZADO =====

// Variables globales para hidratación
let vasosConsumidos = 0;
let metaVasos = 8;

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

// Función para animar contadores
function animateCounter(element, target, duration = 2000, suffix = '') {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
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
        'info': '#16253D',
        'success': '#28a745',
        'warning': '#ffc107',
        'error': '#dc3545'
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
    
    const userId = parseInt(sessionStorage.getItem("usuarioId"));
    const nombre = sessionStorage.getItem("usuarioNombre");

    // Verificar autenticación
    if (!userId || !nombre) {
        window.location.href = "../login/login.html";
        return;
    }

    // Actualizar descripción con el nombre del usuario
    document.getElementById("descripcion-usuario").textContent = 
        `Plan nutricional personalizado para ${nombre}`;

    // Cargar perfil nutricional del usuario
    await cargarPerfilNutricional(userId);

    // Verificar membresía y mostrar contenido apropiado
    await verificarMembresiaYMostrarComidas(userId);

    // Inicializar sistema de hidratación
    inicializarHidratacion();

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

// Función para cargar perfil nutricional del usuario
async function cargarPerfilNutricional(userId) {
    try {
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guia = guias.find(g => g.idUsuario === userId);
        
        if (guia) {
            document.getElementById("objetivo-usuario").textContent = guia.objetivo || 'No definido';
            document.getElementById("alergias-usuario").textContent = guia.alergias || 'Ninguna';
            document.getElementById("actividad-usuario").textContent = guia.nivelActividad || 'No definido';
            
            // CORRECCIÓN: Usar los nombres correctos de los campos de la base de datos
            // Cambiar de 'peso' y 'altura' a 'pesoActual' y 'estatura'
            if (guia.pesoActual && guia.estatura) {
                const imc = calcularIMC(guia.pesoActual, guia.estatura);
                document.getElementById("imc-usuario").textContent = `${imc.valor} (${imc.categoria})`;
            } else {
                // Si no están disponibles, intentar con nombres alternativos que podrían venir de la API
                console.log("Datos disponibles en guía:", Object.keys(guia));
                document.getElementById("imc-usuario").textContent = 'Datos incompletos';
            }
            
            console.log("Perfil nutricional cargado:", guia);
        } else {
            document.getElementById("objetivo-usuario").textContent = 'No definido';
            document.getElementById("alergias-usuario").textContent = 'Ninguna';
            document.getElementById("actividad-usuario").textContent = 'No definido';
            document.getElementById("imc-usuario").textContent = 'No calculado';
        }
    } catch (error) {
        console.error("Error al cargar perfil nutricional:", error);
        mostrarNotificacion("Error al cargar perfil nutricional", "error");
    }
}

// Función para calcular IMC
function calcularIMC(peso, estatura) {
    try {
        // Convertir a números si vienen como strings
        const pesoNum = parseFloat(peso);
        const estaturaNum = parseFloat(estatura);
        
        // Validar que los valores sean números válidos
        if (isNaN(pesoNum) || isNaN(estaturaNum)) {
            console.error("Valores inválidos para calcular IMC:", { peso, estatura });
            return { valor: 'N/A', categoria: 'Datos inválidos' };
        }
        
        // Validar rangos razonables
        if (pesoNum < 30 || pesoNum > 300) {
            console.error("Peso fuera de rango:", pesoNum);
            return { valor: 'N/A', categoria: 'Peso inválido' };
        }
        
        if (estaturaNum < 1.0 || estaturaNum > 2.5) {
            console.error("Estatura fuera de rango:", estaturaNum);
            return { valor: 'N/A', categoria: 'Estatura inválida' };
        }
        
        // Calcular IMC
        const imc = pesoNum / (estaturaNum * estaturaNum);
        const imcRedondeado = Math.round(imc * 10) / 10;
        
        // Determinar categoría
        let categoria;
        if (imc < 18.5) categoria = 'Bajo peso';
        else if (imc < 25) categoria = 'Peso Normal';
        else if (imc < 30) categoria = 'Sobrepeso';
        else categoria = 'Obesidad';
        
        console.log(`IMC calculado: ${imcRedondeado} (${categoria}) - Peso: ${pesoNum}kg, Estatura: ${estaturaNum}m`);
        
        return {
            valor: imcRedondeado,
            categoria: categoria
        };
    } catch (error) {
        console.error("Error al calcular IMC:", error);
        return { valor: 'Error', categoria: 'Error en cálculo' };
    }
}

// Función para verificar membresía y mostrar comidas según el plan - CORREGIDA
async function verificarMembresiaYMostrarComidas(userId) {
    try {
        console.log("🔍 Verificando membresía para usuario ID:", userId);
        
        // Cargar membresías del usuario
        const membresias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias").then(r => r.json());
        console.log("📋 Todas las membresías:", membresias);
        
        // Buscar membresía activa del usuario
        const miembroData = membresias.find(m => m.idUsuario === userId);
        console.log("👤 Membresía del usuario:", miembroData);
        
        if (!miembroData) {
            console.log("❌ No se encontró membresía para el usuario");
            mostrarMensajeComidaBasico();
            ocultarEstadisticasNutricionales(); // Ocultar estadísticas
            return;
        }

        // Verificar si la membresía está activa
        const fechaActual = new Date();
        const fechaFin = new Date(miembroData.fechaFin);
        
        if (fechaFin < fechaActual) {
            console.log("⏰ Membresía expirada");
            mostrarMensajeComidaBasico();
            ocultarEstadisticasNutricionales(); // Ocultar estadísticas
            return;
        }

        // Obtener el ID del tipo de membresía
        const idTipoMembresia = miembroData.idTipoMembresia;
        console.log("🎫 ID Tipo de Membresía:", idTipoMembresia);

        // Verificar acceso según el ID del tipo de membresía
        if (idTipoMembresia === 1) {
            // Plan Básico - ID 1
            console.log("🚫 Usuario con membresía Básica - ID Tipo:", idTipoMembresia);
            mostrarMensajeComidaBasico();
            ocultarEstadisticasNutricionales(); // Ocultar estadísticas
        } else if (idTipoMembresia === 2 || idTipoMembresia === 3) {
            // Plan Premium (ID 2) o Élite (ID 3)
            console.log("✅ Usuario tiene acceso a guía nutricional - ID Tipo:", idTipoMembresia);
            mostrarEstadisticasNutricionales(); // Mostrar estadísticas
            await mostrarComidasDesdeJSON(userId);
        } else {
            // Tipo de membresía desconocido
            console.log("❓ Tipo de membresía desconocido - ID Tipo:", idTipoMembresia);
            mostrarMensajeComidaBasico();
            ocultarEstadisticasNutricionales(); // Ocultar estadísticas por seguridad
        }

    } catch (error) {
        console.error("❌ Error al verificar membresía:", error);
        mostrarMensajeError("Error al verificar tu membresía", 
            "Hubo un problema al verificar tu tipo de membresía. Por favor, recarga la página.");
        mostrarNotificacion("Error al verificar membresía", "error");
        ocultarEstadisticasNutricionales(); // Ocultar estadísticas en caso de error
    }
}

// Nueva función para ocultar las estadísticas nutricionales
function ocultarEstadisticasNutricionales() {
    const seccionEstadisticas = document.querySelector('.estadisticas-nutricionales');
    if (seccionEstadisticas) {
        seccionEstadisticas.style.display = 'none';
        console.log("📊 Estadísticas nutricionales ocultadas para plan Básico");
    }
    
    // Resetear valores a 0
    resetearEstadisticasNutricionales();
}

// Nueva función para mostrar las estadísticas nutricionales
function mostrarEstadisticasNutricionales() {
    const seccionEstadisticas = document.querySelector('.estadisticas-nutricionales');
    if (seccionEstadisticas) {
        seccionEstadisticas.style.display = 'block';
        console.log("📊 Estadísticas nutricionales mostradas para plan Premium/Élite");
    }
}

// Función modificada para mostrar mensaje para usuarios con plan Básico (sin cambios en funcionalidad)
function mostrarMensajeComidaBasico() {
    const contenedor = document.getElementById("comidas-diarias");
    contenedor.innerHTML = `
        <div class="container">
            <div class="mensaje-basico">
                <h3>🚫 Tu membresía actual es Básica</h3>
                <p>Para acceder a una guía nutricional personalizada, recomendaciones específicas según tus objetivos y estadísticas nutricionales detalladas, considera actualizar a un plan Premium o Élite.</p>
                <div class="upgrade-actions">
                    <a href="../membresia/membresia.html" class="btn">
                        <i class="fas fa-rocket"></i> Actualizar Plan
                    </a>
                </div>
            </div>
        </div>`;
}

// Función auxiliar para verificar el tipo de plan del usuario
async function obtenerTipoPlan(userId) {
    try {
        const membresias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias").then(r => r.json());
        const miembroData = membresias.find(m => m.idUsuario === userId);
        
        if (!miembroData) return null;
        
        // Verificar si está activa
        const fechaActual = new Date();
        const fechaFin = new Date(miembroData.fechaFin);
        
        if (fechaFin < fechaActual) return null;
        
        const idTipoMembresia = miembroData.idTipoMembresia;
        
        switch(idTipoMembresia) {
            case 1: return 'Básico';
            case 2: return 'Premium';
            case 3: return 'Élite';
            default: return 'Desconocido';
        }
    } catch (error) {
        console.error("Error al obtener tipo de plan:", error);
        return null;
    }
}

// Función para mostrar el tipo de plan en algún lugar de la UI (opcional)
async function mostrarTipoPlanEnUI(userId) {
    const tipoPlan = await obtenerTipoPlan(userId);
    
    if (tipoPlan) {
        // Podrías agregar esto en algún lugar de tu interfaz
        console.log(`🏷️ Plan del usuario: ${tipoPlan}`);
        
        // Ejemplo: agregar badge del plan (opcional)
        const planBadge = document.createElement('div');
        planBadge.className = 'plan-badge';
        planBadge.innerHTML = `
            <span class="badge badge-${tipoPlan.toLowerCase()}">
                Plan ${tipoPlan}
            </span>
        `;
        
        // Agregar al header de la guía nutricional si existe
        const perfilSection = document.querySelector('.perfil-nutricional h1');
        if (perfilSection) {
            perfilSection.appendChild(planBadge);
        }
    }
}

// Función principal para mostrar comidas desde JSON
async function mostrarComidasDesdeJSON(userId) {
    const hoy = new Date();
    const diaHoy = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][hoy.getDay()];
    const contenedor = document.getElementById("comidas-diarias");

    console.log("📅 Día actual:", diaHoy);

    if (diaHoy === "Sábado" || diaHoy === "Domingo") {
        contenedor.innerHTML = `
            <div class="container">
                <div class="mensaje-descanso">
                    <h3>🌞 Hoy es ${diaHoy}</h3>
                    <p>☕ Tómate un descanso nutricional, disfruta con moderación y nos vemos el lunes con nueva energía.</p>
                </div>
            </div>`;
        
        resetearEstadisticasNutricionales();
        return;
    }

    try {
        // Cargar guía nutricional del usuario
        const guias = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals").then(r => r.json());
        const guia = guias.find(g => g.idUsuario === userId);
        
        console.log("📊 Guía nutricional encontrada:", guia);
        
        if (!guia) {
            mostrarMensajeError("No se encontró tu guía nutricional", 
                "Por favor, completa tu perfil nutricional desde la página principal.");
            resetearEstadisticasNutricionales();
            return;
        }

        const objetivo = guia.objetivo;
        const alergia = guia.alergias;
        const actividad = guia.nivelActividad;

        console.log(`🎯 Buscando plan para: ${objetivo} | ${alergia} | ${actividad}`);

        // Cargar datos del archivo JSON
        const data = await fetch("../data/comida-nutricional.json").then(r => r.json());
        console.log("📁 Datos del JSON cargados:", data);
        
        let comidas = null;
        let mensajeFallback = "";
        
        // Buscar combinación exacta
        if (data.comidas?.[objetivo]?.[alergia]?.[actividad]) {
            comidas = data.comidas[objetivo][alergia][actividad];
            console.log("✅ Plan encontrado: combinación exacta");
        } 
        // Fallback 1: mismo objetivo, sin alergia específica
        else if (data.comidas?.[objetivo]?.["Ninguna"]?.[actividad]) {
            comidas = data.comidas[objetivo]["Ninguna"][actividad];
            mensajeFallback = "⚠️ Mostrando plan general (sin restricciones de alergia específica)";
            console.log("⚠️ Fallback 1: usando 'Ninguna' alergia");
        }
        // Fallback 2: mismo objetivo y alergia, actividad sedentaria
        else if (data.comidas?.[objetivo]?.[alergia]?.["Sedentario"]) {
            comidas = data.comidas[objetivo][alergia]["Sedentario"];
            mensajeFallback = "⚠️ Mostrando plan para actividad sedentaria";
            console.log("⚠️ Fallback 2: usando 'Sedentario'");
        }
        // Fallback 3: configuración básica
        else if (data.comidas?.["Ganar masa muscular"]?.["Ninguna"]?.["Sedentario"]) {
            comidas = data.comidas["Ganar masa muscular"]["Ninguna"]["Sedentario"];
            mensajeFallback = "⚠️ Mostrando plan nutricional básico";
            console.log("⚠️ Fallback 3: configuración básica");
        }

        if (!comidas) {
            console.log("❌ No se encontró configuración disponible");
            mostrarMensajeError("Configuración no disponible", `
                Estamos trabajando en tu plan personalizado para:
                <ul style="text-align: left; margin: 1rem 0; padding-left: 2rem;">
                    <li><strong>Objetivo:</strong> ${objetivo}</li>
                    <li><strong>Alergias:</strong> ${alergia}</li>
                    <li><strong>Actividad:</strong> ${actividad}</li>
                </ul>
                <p>Mientras tanto, consulta con nuestros nutricionistas.</p>
            `);
            resetearEstadisticasNutricionales();
            return;
        }

        console.log("🍽️ Comidas encontradas:", comidas);

        const desayuno = comidas.desayuno?.find(c => c.dia === diaHoy);
        const almuerzo = comidas.almuerzo?.find(c => c.dia === diaHoy);
        const merienda = comidas.merienda?.find(c => c.dia === diaHoy);

        console.log("🌅 Desayuno:", desayuno);
        console.log("🍽️ Almuerzo:", almuerzo);
        console.log("🍪 Merienda:", merienda);

        mostrarComidas(desayuno, almuerzo, merienda, diaHoy, mensajeFallback);
        calcularEstadisticasNutricionales(desayuno, almuerzo, merienda);

    } catch (error) {
        console.error("❌ Error al mostrar comidas:", error);
        mostrarMensajeError("Error al cargar el plan nutricional", 
            "Por favor, recarga la página o contacta con soporte técnico.");
        mostrarNotificacion("Error al cargar plan nutricional", "error");
        resetearEstadisticasNutricionales();
    }
}

// Función para generar el HTML de una comida
function crearCardComida(comida, tipo) {
    if (!comida) return '';
    
    return `
        <div class="comida-card">
            <h4>${tipo.toUpperCase()}</h4>
            <p><strong>${comida.descripcion}</strong></p>
            <p><span>Calorías:</span> ${comida.calorias} kcal</p>
            <p><span>Proteínas:</span> ${comida.proteinas}g</p>
            <p><span>Carbs:</span> ${comida.carbohidratos}g</p>
            <p><span>Grasas:</span> ${comida.grasas}g</p>
        </div>`;
}

// Función para mostrar las comidas del día
function mostrarComidas(desayuno, almuerzo, merienda, diaHoy, mensajeFallback) {
    const contenedor = document.getElementById("comidas-diarias");
    
    let html = `
        <div class="container">
            <div class="comidas-header">
                <h3>🍽️ Comidas para hoy ${diaHoy}</h3>
            </div>`;
    
    if (mensajeFallback) {
        html += `<div class="mensaje-fallback">${mensajeFallback}</div>`;
    }
    
    html += `<div class="comidas-container">`;
    
    if (desayuno) html += crearCardComida(desayuno, "Desayuno");
    if (almuerzo) html += crearCardComida(almuerzo, "Almuerzo");
    if (merienda) html += crearCardComida(merienda, "Merienda");
    
    if (!desayuno && !almuerzo && !merienda) {
        html += `
            <div class="mensaje-sin-comidas">
                <h4>🍽️ No hay comidas programadas para hoy</h4>
                <p>Disfruta de una alimentación balanceada según tus preferencias.</p>
            </div>`;
    }
    
    html += `</div></div>`;

    contenedor.innerHTML = html;
}

// Función para calcular estadísticas nutricionales
function calcularEstadisticasNutricionales(desayuno, almuerzo, merienda) {
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarbohidratos = 0;
    let totalGrasas = 0;

    [desayuno, almuerzo, merienda].forEach(comida => {
        if (comida) {
            totalCalorias += parseInt(comida.calorias) || 0;
            totalProteinas += parseInt(comida.proteinas) || 0;
            totalCarbohidratos += parseInt(comida.carbohidratos) || 0;
            totalGrasas += parseInt(comida.grasas) || 0;
        }
    });

    setTimeout(() => {
        animateCounter(document.getElementById("total-calorias"), totalCalorias, 1500);
    }, 500);
    
    setTimeout(() => {
        animateCounter(document.getElementById("total-proteinas"), totalProteinas, 1500, 'g');
    }, 700);
    
    setTimeout(() => {
        animateCounter(document.getElementById("total-carbohidratos"), totalCarbohidratos, 1500, 'g');
    }, 900);
    
    setTimeout(() => {
        animateCounter(document.getElementById("total-grasas"), totalGrasas, 1500, 'g');
    }, 1100);
}

// Función para resetear estadísticas nutricionales
function resetearEstadisticasNutricionales() {
    document.getElementById("total-calorias").textContent = '0';
    document.getElementById("total-proteinas").textContent = '0g';
    document.getElementById("total-carbohidratos").textContent = '0g';
    document.getElementById("total-grasas").textContent = '0g';
}

// Función para mostrar mensajes de error
function mostrarMensajeError(titulo, mensaje) {
    const contenedor = document.getElementById("comidas-diarias");
    contenedor.innerHTML = `
        <div class="container">
            <div class="mensaje-error">
                <h3>❌ ${titulo}</h3>
                <div>${mensaje}</div>
            </div>
        </div>`;
}

// ===== SISTEMA DE HIDRATACIÓN =====

// Función para inicializar sistema de hidratación
function inicializarHidratacion() {
    const fechaHoy = new Date().toDateString();
    const datosHidratacion = JSON.parse(localStorage.getItem('hidratacion') || '{}');
    
    if (datosHidratacion.fecha === fechaHoy) {
        vasosConsumidos = datosHidratacion.vasos || 0;
    } else {
        vasosConsumidos = 0;
    }
    
    actualizarInterfazHidratacion();
}

// Función para agregar un vaso de agua
function agregarVasoAgua() {
    if (vasosConsumidos < metaVasos) {
        vasosConsumidos++;
        
        const fechaHoy = new Date().toDateString();
        localStorage.setItem('hidratacion', JSON.stringify({
            fecha: fechaHoy,
            vasos: vasosConsumidos
        }));
        
        actualizarInterfazHidratacion();
        
        if (vasosConsumidos === metaVasos) {
            mostrarNotificacion('¡Felicidades! Alcanzaste tu meta de hidratación 🎉', 'success');
        } else {
            mostrarNotificacion(`Vaso ${vasosConsumidos} agregado 💧`, 'info');
        }
        
        const boton = document.querySelector('.btn-hidratacion');
        if (boton) {
            boton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                boton.style.transform = 'scale(1)';
            }, 150);
        }
    } else {
        mostrarNotificacion('¡Ya alcanzaste tu meta diaria! 🌟', 'success');
    }
}

// Función para actualizar interfaz de hidratación
function actualizarInterfazHidratacion() {
    document.getElementById("vasos-actuales").textContent = vasosConsumidos;
    document.getElementById("vasos-objetivo").textContent = metaVasos;
    
    const waterLevel = document.getElementById("water-level");
    if (waterLevel) {
        const porcentaje = (vasosConsumidos / metaVasos) * 100;
        waterLevel.style.height = `${Math.min(porcentaje, 100)}%`;
    }
    
    const boton = document.querySelector('.btn-hidratacion');
    if (boton) {
        if (vasosConsumidos >= metaVasos) {
            boton.style.background = 'var(--nutricion-primary)';
            boton.innerHTML = '<i class="fas fa-check"></i> Meta alcanzada';
        } else {
            boton.style.background = 'var(--agua-gradient)';
            boton.innerHTML = '<i class="fas fa-plus"></i> Agregar vaso';
        }
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
window.NutricionApp = {
    mostrarNotificacion,
    animateCounter,
    agregarVasoAgua,
    calcularIMC
};

// CSS adicional para los badges de plan (agregar al final de tu CSS)
const estilosBadgePlan = `
.plan-badge {
    display: inline-block;
    margin-left: 12px;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-básico {
    background: linear-gradient(135deg, #6c757d, #5a6268);
    color: white;
}

.badge-premium {
    background: linear-gradient(135deg, #007aff, #0056cc);
    color: white;
}

.badge-élite {
    background: linear-gradient(135deg, #ff6b35, #e55100);
    color: white;
}

/* Ocultar sección cuando no está disponible */
.estadisticas-nutricionales[style*="display: none"] {
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
}
`;

// Inyectar estilos para badges (ejecutar una vez)
function inyectarEstilosBadge() {
    if (!document.getElementById('estilos-badge-plan')) {
        const style = document.createElement('style');
        style.id = 'estilos-badge-plan';
        style.textContent = estilosBadgePlan;
        document.head.appendChild(style);
    }
}