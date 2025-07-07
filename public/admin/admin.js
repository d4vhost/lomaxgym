// ===== CONFIGURACIÓN DE APIs =====
const API_BASE_URL = 'https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api';

const API_ENDPOINTS = {
    usuarios: `${API_BASE_URL}/UsuariosApi`,
    membresias: `${API_BASE_URL}/Membresias`,
    tiposMembresia: `${API_BASE_URL}/TipoMembresiasApi`,
    instalaciones: `${API_BASE_URL}/Instalacions`
};

// ===== VARIABLES GLOBALES =====
let usuariosData = [];
let membresiasData = [];
let tiposMembresiasData = [];
let instalacionesData = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupNavigation();
});

// ===== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN =====
async function initializeAdmin() {
    try {
        await cargarDatos();
        actualizarDashboard();
        cargarTablaUsuarios();
        cargarTablaMembresias();
        cargarTablaInstalaciones();
        cargarReportes();
    } catch (error) {
        console.error('Error al inicializar el panel:', error);
        mostrarError('Error al cargar los datos del panel');
    }
}

// ===== CARGA DE DATOS DESDE APIs =====
async function cargarDatos() {
    try {
        const [usuarios, membresias, tiposMembresia, instalaciones] = await Promise.all([
            fetch(API_ENDPOINTS.usuarios).then(response => response.json()),
            fetch(API_ENDPOINTS.membresias).then(response => response.json()),
            fetch(API_ENDPOINTS.tiposMembresia).then(response => response.json()),
            fetch(API_ENDPOINTS.instalaciones).then(response => response.json())
        ]);

        usuariosData = usuarios;
        membresiasData = membresias;
        tiposMembresiasData = tiposMembresia;
        instalacionesData = instalaciones;

        console.log('Datos cargados correctamente');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        throw error;
    }
}

// ===== ACTUALIZACIÓN DEL DASHBOARD =====
function actualizarDashboard() {
    // Calcular estadísticas
    const totalUsuarios = usuariosData.length;
    const usuariosActivos = usuariosData.filter(usuario => usuario.estado === 'Activo').length;
    const totalMembresias = membresiasData.filter(membresia => membresia.estado === 'Activa').length;
    
    // Calcular ingresos del mes
    const ingresosMes = calcularIngresosMes();

    // Actualizar elementos del DOM
    document.getElementById('totalUsuarios').textContent = totalUsuarios;
    document.getElementById('usuariosActivos').textContent = usuariosActivos;
    document.getElementById('totalMembresias').textContent = totalMembresias;
    document.getElementById('ingresosMes').textContent = `$${ingresosMes.toFixed(2)}`;

    // Actualizar gráficos
    actualizarDistribucionMembresias();
    actualizarInstalacionesStats();
}

// ===== CÁLCULO DE INGRESOS DEL MES =====
function calcularIngresosMes() {
    // Calcular ingresos totales de todas las membresías activas
    let totalIngresos = 0;
    
    // Contar usuarios por tipo de membresía y calcular ingresos
    const ingresosPorTipo = {};
    
    membresiasData.forEach(membresia => {
        if (membresia.estado === 'Activa' && membresia.tipoMembresia) {
            const tipoNombre = membresia.tipoMembresia.nombre;
            const precio = membresia.tipoMembresia.precio;
            
            if (!ingresosPorTipo[tipoNombre]) {
                ingresosPorTipo[tipoNombre] = {
                    cantidad: 0,
                    precio: precio,
                    total: 0
                };
            }
            
            ingresosPorTipo[tipoNombre].cantidad++;
            ingresosPorTipo[tipoNombre].total = ingresosPorTipo[tipoNombre].cantidad * precio;
        }
    });
    
    // Sumar todos los ingresos
    Object.values(ingresosPorTipo).forEach(tipo => {
        totalIngresos += tipo.total;
    });
    
    console.log('Desglose de ingresos por tipo:', ingresosPorTipo);
    console.log('Total de ingresos del mes:', totalIngresos);
    
    return totalIngresos;
}

// ===== ACTUALIZAR DISTRIBUCIÓN DE MEMBRESÍAS =====
function actualizarDistribucionMembresias() {
    const membershipStats = document.getElementById('membershipStats');
    
    // Contar membresías por tipo
    const conteoTipos = {};
    membresiasData.forEach(membresia => {
        if (membresia.estado === 'Activa' && membresia.tipoMembresia) {
            const tipo = membresia.tipoMembresia.nombre;
            conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        }
    });

    // Generar HTML
    let html = '';
    tiposMembresiasData.forEach(tipo => {
        const cantidad = conteoTipos[tipo.nombre] || 0;
        const textoUsuarios = cantidad === 1 ? 'usuario' : 'usuarios';
        
        html += `
            <div class="membership-item">
                <span class="membership-name">${tipo.nombre}</span>
                <span class="membership-count">${cantidad} ${textoUsuarios}</span>
                <span class="membership-price">$${tipo.precio.toFixed(2)}</span>
            </div>
        `;
    });

    membershipStats.innerHTML = html;
}

// ===== ACTUALIZAR ESTADÍSTICAS DE INSTALACIONES =====
function actualizarInstalacionesStats() {
    const installationsStats = document.getElementById('installationsStats');
    
    let html = '';
    instalacionesData.forEach(instalacion => {
        html += `
            <div class="installation-item">
                <span class="installation-name">${instalacion.nombre}</span>
                <span class="installation-capacity">${instalacion.capacidad} personas</span>
            </div>
        `;
    });

    installationsStats.innerHTML = html;
}

// ===== CARGAR TABLA DE USUARIOS =====
function cargarTablaUsuarios() {
    const tbody = document.getElementById('usuariosTableBody');
    
    let html = '';
    usuariosData.forEach(usuario => {
        const fechaRegistro = new Date(usuario.fechaRegistro).toLocaleDateString();
        const estadoClass = usuario.estado === 'Activo' ? 'status-active' : 'status-inactive';
        
        html += `
            <tr>
                <td>${usuario.idUsuario}</td>
                <td>${usuario.cedula}</td>
                <td>${usuario.nombreCompleto}</td>
                <td>${usuario.email}</td>
                <td>${usuario.sexo}</td>
                <td><span class="${estadoClass}">${usuario.estado}</span></td>
                <td>${fechaRegistro}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== CARGAR TABLA DE MEMBRESÍAS =====
function cargarTablaMembresias() {
    const tbody = document.getElementById('membresiasTableBody');
    
    let html = '';
    membresiasData.forEach(membresia => {
        const fechaInicio = new Date(membresia.fechaInicio).toLocaleDateString();
        const fechaFin = new Date(membresia.fechaFin).toLocaleDateString();
        const estadoClass = membresia.estado === 'Activa' ? 'status-active' : 'status-inactive';
        
        html += `
            <tr>
                <td>${membresia.idMembresia}</td>
                <td>${membresia.usuario?.nombreCompleto || 'N/A'}</td>
                <td>${membresia.tipoMembresia?.nombre || 'N/A'}</td>
                <td>${membresia.instalacion?.nombre || 'N/A'}</td>
                <td>$${membresia.tipoMembresia?.precio?.toFixed(2) || '0.00'}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td><span class="${estadoClass}">${membresia.estado}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== CARGAR TABLA DE INSTALACIONES =====
function cargarTablaInstalaciones() {
    const tbody = document.getElementById('instalacionesTableBody');
    
    let html = '';
    instalacionesData.forEach(instalacion => {
        const horario = `${instalacion.horarioApertura.substring(0,5)} - ${instalacion.horarioCierre.substring(0,5)}`;
        const estadoClass = instalacion.estado === 'Activa' ? 'status-active' : 'status-inactive';
        
        html += `
            <tr>
                <td>${instalacion.idInstalacion}</td>
                <td>${instalacion.nombre}</td>
                <td>${instalacion.direccion}</td>
                <td>${instalacion.telefono}</td>
                <td>${horario}</td>
                <td>${instalacion.capacidad}</td>
                <td><span class="${estadoClass}">${instalacion.estado}</span></td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarInstalacion(${instalacion.idInstalacion})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarInstalacion(${instalacion.idInstalacion})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== CARGAR REPORTES =====
function cargarReportes() {
    cargarReporteUsuarios();
    cargarReporteIngresos();
    cargarReportePopularidad();
    cargarReporteInstalaciones();
}

function cargarReporteUsuarios() {
    const reportUsuarios = document.getElementById('reportUsuarios');
    const totalUsuarios = usuariosData.length;
    const usuariosActivos = usuariosData.filter(u => u.estado === 'Activo').length;
    const usuariosConMembresia = membresiasData.filter(m => m.estado === 'Activa').length;

    reportUsuarios.innerHTML = `
        <div class="report-item">
            <span class="report-label">Total Usuarios Registrados:</span>
            <span class="report-value">${totalUsuarios}</span>
        </div>
        <div class="report-item">
            <span class="report-label">Usuarios Activos:</span>
            <span class="report-value">${usuariosActivos}</span>
        </div>
        <div class="report-item">
            <span class="report-label">Usuarios con Membresía:</span>
            <span class="report-value">${usuariosConMembresia}</span>
        </div>
    `;
}

function cargarReporteIngresos() {
    const reportIngresos = document.getElementById('reportIngresos');
    
    // Calcular ingresos por tipo de membresía activa
    const ingresosPorTipo = {};
    
    membresiasData.forEach(membresia => {
        if (membresia.estado === 'Activa' && membresia.tipoMembresia) {
            const tipo = membresia.tipoMembresia.nombre;
            const precio = membresia.tipoMembresia.precio;
            
            if (!ingresosPorTipo[tipo]) {
                ingresosPorTipo[tipo] = { 
                    cantidad: 0, 
                    precio: precio,
                    total: 0 
                };
            }
            ingresosPorTipo[tipo].cantidad++;
            // Calcular total: cantidad de usuarios × precio unitario
            ingresosPorTipo[tipo].total = ingresosPorTipo[tipo].cantidad * precio;
        }
    });

    let html = '';
    let totalGeneral = 0;

    // Mostrar desglose por tipo
    Object.entries(ingresosPorTipo).forEach(([tipo, datos]) => {
        const textoUsuarios = datos.cantidad === 1 ? 'usuario' : 'usuarios';
        html += `
            <div class="report-item">
                <span class="report-label">${tipo} (${datos.cantidad} ${textoUsuarios} × ${datos.precio}):</span>
                <span class="report-value">${datos.total.toFixed(2)}</span>
            </div>
        `;
        totalGeneral += datos.total;
    });

    // Mostrar total general
    html += `
        <div class="report-total">
            <span class="report-label">Total de Ingresos del Mes:</span>
            <span class="report-value">${totalGeneral.toFixed(2)}</span>
        </div>
    `;

    reportIngresos.innerHTML = html;
}

function cargarReportePopularidad() {
    const reportPopularidad = document.getElementById('reportPopularidad');
    
    // Contar membresías por tipo
    const conteoTipos = {};
    membresiasData.forEach(membresia => {
        if (membresia.estado === 'Activa' && membresia.tipoMembresia) {
            const tipo = membresia.tipoMembresia.nombre;
            conteoTipos[tipo] = (conteoTipos[tipo] || 0) + 1;
        }
    });

    // Ordenar por popularidad
    const tiposOrdenados = Object.entries(conteoTipos)
        .sort(([,a], [,b]) => b - a);

    let html = '';
    if (tiposOrdenados.length > 0) {
        tiposOrdenados.forEach(([tipo, cantidad], index) => {
            const textoUsuarios = cantidad === 1 ? 'usuario' : 'usuarios';
            html += `
                <div class="popularity-item">
                    <span class="rank">${index + 1}.</span>
                    <span class="membership-type">${tipo}</span>
                    <span class="usage">(${cantidad} ${textoUsuarios})</span>
                </div>
            `;
        });
    } else {
        html = '<div class="popularity-item">No hay datos disponibles</div>';
    }

    reportPopularidad.innerHTML = html;
}

function cargarReporteInstalaciones() {
    const reportInstalaciones = document.getElementById('reportInstalaciones');
    const totalInstalaciones = instalacionesData.length;
    const capacidadTotal = instalacionesData.reduce((total, inst) => total + inst.capacidad, 0);
    const instalacionesActivas = instalacionesData.filter(inst => inst.estado === 'Activa').length;
    const porcentajeActivas = totalInstalaciones > 0 ? ((instalacionesActivas / totalInstalaciones) * 100).toFixed(1) : 0;

    reportInstalaciones.innerHTML = `
        <div class="report-item">
            <span class="report-label">Total Instalaciones:</span>
            <span class="report-value">${totalInstalaciones}</span>
        </div>
        <div class="report-item">
            <span class="report-label">Capacidad Total:</span>
            <span class="report-value">${capacidadTotal} personas</span>
        </div>
        <div class="report-item">
            <span class="report-label">Instalaciones Activas:</span>
            <span class="report-value">${porcentajeActivas}%</span>
        </div>
    `;
}

// ===== NAVEGACIÓN =====
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los links y secciones
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ===== FUNCIONES DE ACCIÓN =====
function editarInstalacion(id) {
    alert(`Editar instalación con ID: ${id}`);
    // Aquí implementarías la lógica de edición
}

function eliminarInstalacion(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta instalación?')) {
        alert(`Eliminar instalación con ID: ${id}`);
        // Aquí implementarías la lógica de eliminación
    }
}

// ===== UTILIDADES =====
function mostrarError(mensaje) {
    alert(`Error: ${mensaje}`);
    // Aquí podrías implementar un sistema de notificaciones más sofisticado
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES');
}

function cerrarSesion() {
    // Limpiar datos de sesión si los tienes
    localStorage.removeItem('adminSession');
    sessionStorage.clear();
    
    // Redirigir al login
    window.location.href = '../login/login.html';
}

// ===== ACTUALIZACIÓN AUTOMÁTICA =====
function actualizarDatos() {
    initializeAdmin();
}

// Actualizar datos cada 5 minutos
setInterval(actualizarDatos, 5 * 60 * 1000);


// ===== VARIABLES PARA MODALES =====
let instalacionAEliminar = null;
let modoEdicion = false;

// ===== FUNCIONES PARA MODAL DE INSTALACIÓN =====

// Función para abrir modal de nueva instalación
function abrirModalNuevaInstalacion() {
    modoEdicion = false;
    document.getElementById('modalInstalacionTitle').textContent = 'Nueva Instalación';
    limpiarFormularioInstalacion();
    document.getElementById('modalInstalacion').style.display = 'block';
}

// Función para abrir modal de editar instalación
function editarInstalacion(id) {
    modoEdicion = true;
    const instalacion = instalacionesData.find(inst => inst.idInstalacion === id);
    
    if (!instalacion) {
        mostrarError('Instalación no encontrada');
        return;
    }

    document.getElementById('modalInstalacionTitle').textContent = 'Editar Instalación';
    llenarFormularioInstalacion(instalacion);
    document.getElementById('modalInstalacion').style.display = 'block';
}

// Función para llenar el formulario con datos de instalación
function llenarFormularioInstalacion(instalacion) {
    document.getElementById('instalacionId').value = instalacion.idInstalacion;
    document.getElementById('instalacionNombre').value = instalacion.nombre;
    document.getElementById('instalacionDireccion').value = instalacion.direccion;
    document.getElementById('instalacionCiudad').value = instalacion.ciudad;
    document.getElementById('instalacionTelefono').value = instalacion.telefono;
    document.getElementById('instalacionHorarioApertura').value = instalacion.horarioApertura.substring(0, 5);
    document.getElementById('instalacionHorarioCierre').value = instalacion.horarioCierre.substring(0, 5);
    document.getElementById('instalacionMetrosCuadrados').value = instalacion.metrosCuadrados;
    document.getElementById('instalacionCapacidad').value = instalacion.capacidad;
    document.getElementById('instalacionEstado').value = instalacion.estado;
}

// Función para limpiar el formulario
function limpiarFormularioInstalacion() {
    document.getElementById('formInstalacion').reset();
    document.getElementById('instalacionId').value = '';
    // Establecer valores por defecto
    document.getElementById('instalacionHorarioApertura').value = '06:00';
    document.getElementById('instalacionHorarioCierre').value = '22:00';
    document.getElementById('instalacionEstado').value = 'Activa';
}

// Función para cerrar modal de instalación
function cerrarModalInstalacion() {
    document.getElementById('modalInstalacion').style.display = 'none';
    limpiarFormularioInstalacion();
}

// Función para guardar instalación (crear o actualizar)
async function guardarInstalacion() {
    const form = document.getElementById('formInstalacion');
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Recopilar datos del formulario
    const datosInstalacion = {
        nombre: document.getElementById('instalacionNombre').value.trim(),
        direccion: document.getElementById('instalacionDireccion').value.trim(),
        ciudad: document.getElementById('instalacionCiudad').value.trim(),
        telefono: document.getElementById('instalacionTelefono').value.trim(),
        horarioApertura: document.getElementById('instalacionHorarioApertura').value + ':00',
        horarioCierre: document.getElementById('instalacionHorarioCierre').value + ':00',
        metrosCuadrados: parseInt(document.getElementById('instalacionMetrosCuadrados').value),
        capacidad: parseInt(document.getElementById('instalacionCapacidad').value),
        estado: document.getElementById('instalacionEstado').value
    };

    try {
        let response;
        
        if (modoEdicion) {
            // Actualizar instalación existente
            const id = document.getElementById('instalacionId').value;
            datosInstalacion.idInstalacion = parseInt(id);
            
            response = await fetch(`${API_ENDPOINTS.instalaciones}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosInstalacion)
            });
        } else {
            // Crear nueva instalación
            response = await fetch(API_ENDPOINTS.instalaciones, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosInstalacion)
            });
        }

        if (response.ok) {
            cerrarModalInstalacion();
            await actualizarDatos(); // Recargar todos los datos
            mostrarMensajeExito(modoEdicion ? 'Instalación actualizada correctamente' : 'Instalación creada correctamente');
        } else {
            const errorData = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
        }

    } catch (error) {
        console.error('Error al guardar instalación:', error);
        mostrarError('Error al guardar la instalación: ' + error.message);
    }
}

// ===== FUNCIONES PARA MODAL DE CONFIRMACIÓN =====

// Función para abrir modal de confirmación de eliminación
function eliminarInstalacion(id) {
    const instalacion = instalacionesData.find(inst => inst.idInstalacion === id);
    
    if (!instalacion) {
        mostrarError('Instalación no encontrada');
        return;
    }

    instalacionAEliminar = id;
    document.getElementById('mensajeConfirmacion').textContent = 
        `¿Estás seguro de que quieres eliminar la instalación "${instalacion.nombre}"?`;
    document.getElementById('modalConfirmacion').style.display = 'block';
}

// Función para cerrar modal de confirmación
function cerrarModalConfirmacion() {
    document.getElementById('modalConfirmacion').style.display = 'none';
    instalacionAEliminar = null;
}

// Función para confirmar eliminación
async function confirmarEliminacion() {
    if (!instalacionAEliminar) {
        cerrarModalConfirmacion();
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.instalaciones}/${instalacionAEliminar}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            cerrarModalConfirmacion();
            await actualizarDatos(); // Recargar todos los datos
            mostrarMensajeExito('Instalación eliminada correctamente');
        } else {
            const errorData = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorData}`);
        }

    } catch (error) {
        console.error('Error al eliminar instalación:', error);
        mostrarError('Error al eliminar la instalación: ' + error.message);
        cerrarModalConfirmacion();
    }
}

// ===== FUNCIONES DE UTILIDAD =====

// Función para mostrar mensajes de éxito
function mostrarMensajeExito(mensaje) {
    alert('✓ ' + mensaje);
}

// Actualizar función mostrarError para que sea simple
function mostrarError(mensaje) {
    alert('❌ Error: ' + mensaje);
}

// ===== EVENT LISTENERS =====

// Cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const modalInstalacion = document.getElementById('modalInstalacion');
    const modalConfirmacion = document.getElementById('modalConfirmacion');
    
    if (event.target === modalInstalacion) {
        cerrarModalInstalacion();
    }
    
    if (event.target === modalConfirmacion) {
        cerrarModalConfirmacion();
    }
}

// Cerrar modales con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModalInstalacion();
        cerrarModalConfirmacion();
    }
});

// ===== ACTUALIZAR FUNCIÓN EXISTENTE =====

// Reemplaza la función existente setupNavigation para incluir el evento del botón
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los links y secciones
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Agregar event listener para el botón "Nueva Instalación"
    const btnNuevaInstalacion = document.querySelector('#instalaciones .btn-primary');
    if (btnNuevaInstalacion) {
        btnNuevaInstalacion.addEventListener('click', abrirModalNuevaInstalacion);
    }
}