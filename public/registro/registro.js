// URLs de APIs
const API_USUARIOS = "https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/UsuariosApi";
const API_INSTALACIONES = "https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Instalacions";
const API_MEMBRESIAS = "https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/TipoMembresiasApi";

// Mapa de beneficios por membresía
const beneficiosMembresias = {
    "Básica": [
        "Acceso a una sola sede (elige tu sede principal)",
        "Área de pesas y máquinas cardiovasculares",
        "Clases grupales (Zumba, Funcional, Spinning, etc.)",
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

// Cargar datos almacenados en memoria desde la página anterior
document.addEventListener("DOMContentLoaded", function() {
    // Obtener datos de la sesión guardados por carts.js
    const seleccionMembresia = JSON.parse(sessionStorage.getItem('seleccionMembresia'));
    
    if (seleccionMembresia && seleccionMembresia.plan && seleccionMembresia.instalacion) {
        const membresia = seleccionMembresia.plan;
        const instalacion = seleccionMembresia.instalacion;
        
        console.log("Membresía cargada:", membresia);
        console.log("Instalación cargada:", instalacion);
        
        // Mostrar detalles de la instalación
        document.getElementById("instalacion-nombre").textContent = instalacion.nombre;
        document.getElementById("instalacion-direccion").textContent = instalacion.direccion;
        
        // Mostrar detalles de la membresía (ajustar el nombre si es necesario)
        let nombreMembresia = membresia.nombre;
        // Asegurar consistencia en los nombres de membresias
        if (nombreMembresia === "Básico") nombreMembresia = "Básica";
        
        mostrarDetalleMembresia(membresia, nombreMembresia);
    } else {
        console.error("No se encontraron datos de membresía o instalación");
        alert("No se encontraron datos de selección previa. Por favor, vuelve a seleccionar un plan.");
        // Redireccionar a la página anterior
        window.location.href = '../carts/carts.html';
    }
    
    // Configurar validaciones y eventos del formulario
    configurarFormulario();
    
    // Configurar el icono del ojo para mostrar/ocultar contraseña
    configurarVisualizacionPassword();
    
    // Configurar formateo automático para el celular
    configurarFormatoCelular();
    
    // Configurar enlace de descarga de políticas
    configurarEnlacePoliticas();
});

// Función para mostrar los detalles de la membresía seleccionada
function mostrarDetalleMembresia(membresia, nombreMembresia) {
    // Actualizar título del plan
    document.getElementById("plan-titulo").textContent = `Plan ${nombreMembresia}`;
    
    // Actualizar descripción del plan
    document.getElementById("plan-descripcion").textContent = 
        `Con el plan ${nombreMembresia} ${getDescripcionCorta(nombreMembresia)}`;
    
    // Mostrar beneficios específicos según el tipo de membresía
    const beneficiosHTML = getBeneficiosHTML(nombreMembresia, membresia.precio);
    document.getElementById("plan-beneficios").innerHTML = beneficiosHTML;
}

// Función para obtener la descripción corta según el tipo de membresía
function getDescripcionCorta(tipoMembresia) {
    switch(tipoMembresia) {
        case "Básico":
        case "Básica":
            return "obtienes acceso básico para comenzar tu entrenamiento!";
        case "Premium":
            return "obtienes grandes beneficios para tu entrenamiento!";
        case "Élite":
            return "puedes entrenar en varios gimnasios y mucho más!";
        default:
            return "obtienes acceso a nuestras instalaciones!";
    }
}

// Función para obtener el HTML de los beneficios según el tipo de membresía
function getBeneficiosHTML(tipoMembresia, precio) {
    let beneficiosHTML = '';
    
    // Obtener lista de beneficios según el tipo de membresía
    const listaBeneficios = beneficiosMembresias[tipoMembresia] || [];
    
    // Agregar cada beneficio con el formato de check igual que en carts.js
    listaBeneficios.forEach(beneficio => {
        beneficiosHTML += `
            <div class="price-item">
                <div class="price-label">
                    <strong>✓ ${beneficio}</strong>
                </div>
            </div>
        `;
    });
    
    beneficiosHTML += `
    <div class="price-item">
        <div class="price-label">
            <strong>Mensualidad</strong>
        </div>
        <div class="price-value">$ ${precio.toFixed(2)}/mes + IVA</div>
    </div>`;
    
    return beneficiosHTML;
}

// Configurar control de visualización de contraseña
function configurarVisualizacionPassword() {
    const passwordField = document.getElementById("password");
    
    // Crear el contenedor para el campo y el icono
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';
    passwordField.parentNode.insertBefore(passwordContainer, passwordField);
    passwordContainer.appendChild(passwordField);
    
    // Crear el icono del ojo
    const eyeIcon = document.createElement('span');
    eyeIcon.innerHTML = '👁️';
    eyeIcon.className = 'password-toggle';
    passwordContainer.appendChild(eyeIcon);
    
    // Evento para mostrar/ocultar contraseña
    eyeIcon.addEventListener('click', function() {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            eyeIcon.classList.add('active');
        } else {
            passwordField.type = 'password';
            eyeIcon.classList.remove('active');
        }
    });
    
    // Estilo en línea para el contenedor
    passwordContainer.style.position = 'relative';
    passwordContainer.style.display = 'flex';
    
    // Estilo para el icono del ojo
    eyeIcon.style.position = 'absolute';
    eyeIcon.style.right = '10px';
    eyeIcon.style.top = '50%';
    eyeIcon.style.transform = 'translateY(-50%)';
    eyeIcon.style.cursor = 'pointer';
    eyeIcon.style.zIndex = '10';
}

// Configurar formato automático para número de celular - MEJORADO para solo números
function configurarFormatoCelular() {
    const celularInput = document.getElementById("celular");
    
    celularInput.addEventListener('input', function(e) {
        // Eliminar cualquier carácter no numérico
        let value = e.target.value.replace(/\D/g, '');
        
        // Eliminar el primer dígito si es 0 (ya que +593 lo reemplaza)
        if (value.startsWith('0')) {
            value = value.substring(1);
        }
        
        // Limitar a 9 dígitos máximo
        value = value.substring(0, 9);
        
        // Aplicar formato: XX XXX XXXX
        let formatted = '';
        if (value.length > 0) {
            if (value.length <= 2) {
                // Primeros 2 dígitos
                formatted = value;
            } else if (value.length <= 5) {
                // Primeros 2 dígitos + espacio + siguientes dígitos
                formatted = value.substring(0, 2) + ' ' + value.substring(2);
            } else {
                // Formato completo: XX XXX XXXX
                formatted = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5);
            }
            e.target.value = formatted;
        }
    });
    
    // Evitar pegar texto no numérico
    celularInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const numericValue = paste.replace(/\D/g, '');
        
        // Simular entrada de números uno por uno para aplicar el formato
        this.value = '';
        for (let i = 0; i < numericValue.length && i < 9; i++) {
            const event = new Event('input', { bubbles: true });
            this.value += numericValue[i];
            this.dispatchEvent(event);
        }
    });
    
    // Evitar entrada de caracteres no numéricos con teclado
    celularInput.addEventListener('keypress', function(e) {
        // Permitir solo números, backspace, delete, tab, escape, enter
        if (!/[0-9]/.test(e.key) && 
            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Configurar enlace de descarga de políticas
function configurarEnlacePoliticas() {
    const enlacePoliticas = document.querySelector('.terms-link');
    
    if (enlacePoliticas) {
        enlacePoliticas.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear enlace temporal para descargar el PDF
            const link = document.createElement('a');
            link.href = '../docs/file.pdf';
            link.download = 'Politicas_Tratamiento_Datos_LoMax_Fitness.pdf';
            link.target = '_blank';
            
            // Agregar al DOM temporalmente
            document.body.appendChild(link);
            
            // Hacer clic programáticamente
            link.click();
            
            // Remover del DOM
            document.body.removeChild(link);
        });
    }
}

// Configurar formulario y sus validaciones
function configurarFormulario() {
    const form = document.getElementById("registration-form");
    
    // Validar cédula ecuatoriana en tiempo real
    const cedulaInput = document.getElementById("cedula");
    cedulaInput.addEventListener('input', function(e) {
        // Solo permitir números
        e.target.value = e.target.value.replace(/\D/g, '');
        
        // Limitar a 10 dígitos
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
        
        // Validar la cédula mientras escribe
        if (e.target.value.length === 10) {
            if (!validarCedulaEcuatoriana(e.target.value)) {
                mostrarError("cedula-error", "Cédula ecuatoriana inválida. Verifique los dígitos.");
            } else {
                document.getElementById("cedula-error").textContent = "";
                document.getElementById("cedula-error").style.display = "none";
            }
        }
    });
    
    // Validar nombre en tiempo real
    const nombreInput = document.getElementById("nombre");
    nombreInput.addEventListener('input', function(e) {
        // Solo permitir letras, espacios y caracteres especiales para nombres compuestos
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]/g, '');
    });
    
    // Envío del formulario
    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Validar formulario
        if (validarFormulario()) {
            // Obtener la selección de membresía
            const seleccionMembresia = JSON.parse(sessionStorage.getItem('seleccionMembresia'));
            
            if (!seleccionMembresia) {
                alert("No hay información de membresía disponible. Por favor, selecciona una membresía primero.");
                window.location.href = '../carts/carts.html';
                return;
            }
            
            // Crear objeto de usuario con los datos del formulario
            const nuevoUsuario = {
                cedula: document.getElementById("cedula").value,
                nombreCompleto: document.getElementById("nombre").value,
                email: document.getElementById("email").value,
                contrasenaHash: document.getElementById("password").value, // En producción debería ser hash
                sexo: document.getElementById("sexo").value.charAt(0).toUpperCase(),
                celular: "+593 " + document.getElementById("celular").value,
                fechaNacimiento: document.getElementById("fecha").value,
                politicasAceptadas: document.getElementById("terms").checked,
                fechaRegistro: new Date().toISOString(),
                ultimoLogin: new Date().toISOString(),
                estado: "Activo",
                membresias: [],
                datosCobro: [],
                tarjetasCredito: [],
                guiasNutricionales: []
            };
            
            // Verificar que cedula y email sean únicos
            const cedulaUnica = await verificarCedulaUnica(nuevoUsuario.cedula);
            const emailUnico = await verificarEmailUnico(nuevoUsuario.email);
            
            if (!cedulaUnica) {
                mostrarError("cedula-error", "Esta cédula ya está registrada.");
                return;
            }
            
            if (!emailUnico) {
                mostrarError("email-error", "Este correo electrónico ya está registrado.");
                return;
            }
            
            // Actualizar la selección con la información del usuario
            seleccionMembresia.usuario = nuevoUsuario;
            
            // Guardar datos actualizados en sessionStorage para la siguiente página
            sessionStorage.setItem('seleccionMembresia', JSON.stringify(seleccionMembresia));
            
            console.log("Selección actualizada:", seleccionMembresia);
            
            // Redireccionar a la página de cobro
            window.location.href = "../cobro/cobro.html";
        }
    });
}

// Validar cédula ecuatoriana usando el algoritmo oficial
function validarCedulaEcuatoriana(cedula) {
    // Verificar longitud
    if (cedula.length !== 10) {
        return false;
    }
    
    // Verificar que todos sean dígitos
    if (!/^\d+$/.test(cedula)) {
        return false;
    }
    
    // Verificar código de provincia (primeros dos dígitos)
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
        return false;
    }
    
    // Verificar tercer dígito (menor a 6 para personas naturales)
    if (parseInt(cedula.charAt(2)) > 6) {
        return false;
    }
    
    // Algoritmo de validación
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < coeficientes.length; i++) {
        let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
        suma += valor > 9 ? valor - 9 : valor;
    }
    
    const digitoVerificador = parseInt(cedula.charAt(9));
    const total = (Math.ceil(suma / 10) * 10);
    const residuo = total - suma;
    
    return residuo === digitoVerificador || (residuo === 10 && digitoVerificador === 0);
}

// Validar formulario completo
function validarFormulario() {
    let esValido = true;
    
    // Limpiar mensajes de error previos
    limpiarMensajesError();
    
    // Validar cédula (debe ser una cédula ecuatoriana válida)
    const cedula = document.getElementById("cedula").value;
    if (!cedula || !validarCedulaEcuatoriana(cedula)) {
        mostrarError("cedula-error", "Ingrese una cédula ecuatoriana válida.");
        esValido = false;
    }
    
    // Validar nombre (solo letras y espacios)
    const nombre = document.getElementById("nombre").value;
    if (!nombre || nombre.trim().length < 3 || /\d/.test(nombre)) {
        mostrarError("nombre-error", "Ingrese un nombre válido sin números.");
        esValido = false;
    }
    
    // Validar email
    const email = document.getElementById("email").value;
    if (!email || !validarEmail(email)) {
        mostrarError("email-error", "Ingrese un correo electrónico válido.");
        esValido = false;
    }
    
    // Validar contraseña
    const password = document.getElementById("password").value;
    if (!password || password.length < 6) {
        mostrarError("password-error", "La contraseña debe tener al menos 6 caracteres.");
        esValido = false;
    }
    
    // Validar sexo
    const sexo = document.getElementById("sexo").value;
    if (!sexo) {
        mostrarError("sexo-error", "Seleccione una opción.");
        esValido = false;
    }
    
    // Validar celular (debe tener formato correcto)
    const celular = document.getElementById("celular").value;
    const celularSinEspacios = celular.replace(/\s/g, '');
    if (!celular || celularSinEspacios.length < 9 || !/^\d+$/.test(celularSinEspacios)) {
        mostrarError("celular-error", "Ingrese un número de celular válido de 9 dígitos.");
        esValido = false;
    }
    
    // Validar fecha - CAMBIO: ahora debe ser mayor de 13 años
    const fecha = document.getElementById("fecha").value;
    if (!fecha) {
        mostrarError("fecha-error", "Seleccione una fecha de nacimiento.");
        esValido = false;
    } else {
        // Verificar que sea mayor de 13 años (edad mínima para tarjeta de débito)
        const fechaNacimiento = new Date(fecha);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesesDif = hoy.getMonth() - fechaNacimiento.getMonth();
        const diasDif = hoy.getDate() - fechaNacimiento.getDate();
        
        // Calcular la edad exacta
        let edadExacta = edad;
        if (mesesDif < 0 || (mesesDif === 0 && diasDif < 0)) {
            edadExacta--;
        }
        
        if (edadExacta < 13) {
            mostrarError("fecha-error", "Debe ser mayor de 13 años para poder realizar compras online.");
            esValido = false;
        }
    }
    
    // Validar términos y condiciones
    const terms = document.getElementById("terms").checked;
    if (!terms) {
        mostrarError("terms-error", "Debe aceptar los términos y condiciones.");
        esValido = false;
    }
    
    return esValido;
}

// Verificar si una cédula ya existe en la base de datos
async function verificarCedulaUnica(cedula) {
    try {
        const response = await fetch(API_USUARIOS);
        if (!response.ok) throw new Error('Error al consultar usuarios');
        
        const usuarios = await response.json();
        const usuarioExistente = usuarios.find(u => u.cedula === cedula);
        
        return !usuarioExistente;
    } catch (error) {
        console.error("Error al verificar cédula:", error);
        // En caso de error de conexión, permitimos continuar
        return true;
    }
}

// Verificar si un email ya existe en la base de datos
async function verificarEmailUnico(email) {
    try {
        const response = await fetch(API_USUARIOS);
        if (!response.ok) throw new Error('Error al consultar usuarios');
        
        const usuarios = await response.json();
        const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        return !usuarioExistente;
    } catch (error) {
        console.error("Error al verificar email:", error);
        // En caso de error de conexión, permitimos continuar
        return true;
    }
}

// Función para validar formato de email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar mensaje de error
function mostrarError(elementId, mensaje) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.style.display = "block";
    }
}

// Limpiar todos los mensajes de error
function limpiarMensajesError() {
    const errores = document.querySelectorAll(".error-message");
    errores.forEach(error => {
        error.textContent = "";
        error.style.display = "none";
    });
}