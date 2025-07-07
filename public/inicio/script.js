// Variables globales
let respuestasChatbot = [];
let inactivityTimer;
let chatbotVisible = false;
let datosUsuario = {};
const INACTIVITY_TIMEOUT = 1.5 * 60 * 1000; // 1 minuto y medio en milisegundos

// Variable para controlar el debounce de validación
let timeoutValidacion = null;

// Función para el desplazamiento suave
document.addEventListener('DOMContentLoaded', () => {
    // Cargar las respuestas al iniciar la página
    cargarRespuestas();
    
    // Añadir controlador de eventos para todos los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Desplazamiento suave con animación personalizada
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // 80px es la altura del header
                        behavior: 'smooth',
                    });

                    const startPosition = window.pageYOffset;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                    const distance = targetPosition - startPosition;
                    let startTime = null;
                    
                    function animation(currentTime) {
                        if (startTime === null) startTime = currentTime;
                        const timeElapsed = currentTime - startTime;
                        const duration = 1500; // Ajusta este valor para una animación más lenta (1500ms = 1.5 segundos)
                        
                        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                        window.scrollTo(0, run);
                        
                        if (timeElapsed < duration) requestAnimationFrame(animation);
                    }
                    
                    // Función de easing para suavizar el desplazamiento
                    function easeInOutQuad(t, b, c, d) {
                        t /= d/2;
                        if (t < 1) return c/2*t*t + b;
                        t--;
                        return -c/2 * (t*(t-2) - 1) + b;
                    }
                    
                    requestAnimationFrame(animation);
                }
            }
        });
    });

    // Configurar validaciones en tiempo real después de cargar el DOM
    setTimeout(() => {
        // Configurar validación de cédula (CON VALIDACIÓN EN TIEMPO REAL)
        configurarValidacionCedula();
        
        // Configurar validación de nombre y apellido (solo letras)
        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        
        if (nombreInput) {
            nombreInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            });
        }
        
        if (apellidoInput) {
            apellidoInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            });
        }
    }, 100);
});

// Función para cargar las respuestas desde la API
function cargarRespuestas() {
    fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/RespuestasChatbot')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar respuestas del chatbot');
            }
            return response.json();
        })
        .then(data => {
            respuestasChatbot = data;
            console.log('Respuestas del chatbot cargadas:', respuestasChatbot.length);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function resetInactivityTimer() {
    // Limpiar temporizador existente
    clearTimeout(inactivityTimer);
    
    // Configurar nuevo temporizador
    inactivityTimer = setTimeout(() => {
        // Solo mostrar mensaje si el chatbot está visible
        if (chatbotVisible) {
            mostrarMensajeInactividad();
        }
    }, INACTIVITY_TIMEOUT);
}

function mostrarMensajeInactividad() {
    const messages = document.getElementById('messages');
    
    // Agregar mensaje de inactividad
    const inactivityDiv = document.createElement('div');
    inactivityDiv.className = 'bot-message inactivity-message';
    inactivityDiv.innerHTML = `<strong>Lomax Bot:</strong> ¿Sigues ahí? ¿Aún necesitas mi ayuda?`;
    messages.appendChild(inactivityDiv);
    
    // Agregar botones de respuesta
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'inactivity-options';
    optionsDiv.innerHTML = `
        <button onclick="responderInactividad('si')">Sí</button>
        <button onclick="responderInactividad('no')">No</button>
    `;
    messages.appendChild(optionsDiv);
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

function responderInactividad(respuesta) {
    // Remover botones de inactividad
    const inactivityOptions = document.querySelector('.inactivity-options');
    if (inactivityOptions) {
        inactivityOptions.remove();
    }
    
    // Agregar respuesta del usuario
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'user-message';
    userMessageDiv.innerHTML = `<strong>Tú:</strong> ${respuesta.charAt(0).toUpperCase() + respuesta.slice(1)}`;
    document.getElementById('messages').appendChild(userMessageDiv);
    
    // Procesar respuesta
    sendMessage(respuesta);
}

function procesarRespuesta(message, messages) {
    // Procesar respuestas a la pregunta de inactividad
    if (message.toLowerCase() === "si") {
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'bot-message';
        botMessageDiv.innerHTML = `<strong>Lomax Bot:</strong> ¿En qué más puedo ayudarte? Puedes preguntarme sobre:`;
        messages.appendChild(botMessageDiv);
        
        // Mostrar opciones como botones
        const opcionesDiv = document.createElement('div');
        opcionesDiv.className = 'chatbot-sugerencias';
        opcionesDiv.innerHTML = `
            <button onclick="hacerPregunta('¿Qué tipos de membresía ofrecen?')">Membresías</button>
            <button onclick="hacerPregunta('¿Cuánto cuestan las membresías?')">Precios</button>
            <button onclick="hacerPregunta('¿Qué horarios tienen?')">Horarios</button>
            <button onclick="hacerPregunta('¿Qué servicios ofrecen?')">Servicios</button>
            <button onclick="hacerPregunta('¿Cómo me registro?')">Registro</button>
        `;
        messages.appendChild(opcionesDiv);
    } 
    else if (message.toLowerCase() === "no") {
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'bot-message';
        botMessageDiv.innerHTML = `<strong>Lomax Bot:</strong> ¡Gracias por utilizar nuestros servicios! Si necesitas más ayuda en el futuro, no dudes en escribirme.`;
        messages.appendChild(botMessageDiv);
        
        // Cerrar chatbot después de 15 segundos
        setTimeout(() => {
            limpiarYCerrarChatbot();
        }, 15000);
    }
    // Respuestas normales
    else {
        const respuesta = encontrarRespuesta(message);
        
        // Add bot response
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'bot-message';
        botMessageDiv.innerHTML = `<strong>Lomax Bot:</strong> ${respuesta}`;
        messages.appendChild(botMessageDiv);
    }
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

// Función para encontrar la mejor respuesta basada en el mensaje del usuario
function encontrarRespuesta(mensaje) {
    mensaje = mensaje.toLowerCase();
    
    // Primero intentamos encontrar una coincidencia exacta con la pregunta
    const coincidenciaExacta = respuestasChatbot.find(
        r => r.activa && r.pregunta.toLowerCase() === mensaje
    );
    
    if (coincidenciaExacta) {
        return coincidenciaExacta.respuesta;
    }
    
    // Si no hay coincidencia exacta, buscamos por palabras clave
    let mejorRespuesta = null;
    let mayorPuntuacion = 0;
    
    respuestasChatbot.forEach(respuesta => {
        if (!respuesta.activa) return;
        
        // Calculamos una puntuación basada en cuántas palabras clave coinciden
        const palabrasClave = respuesta.palabrasClave.toLowerCase().split(',');
        let puntuacion = 0;
        
        palabrasClave.forEach(palabra => {
            if (mensaje.includes(palabra.trim())) {
                puntuacion++;
            }
        });
        
        // También verificamos si hay palabras de la pregunta en el mensaje
        const palabrasPregunta = respuesta.pregunta.toLowerCase().split(' ');
        palabrasPregunta.forEach(palabra => {
            if (palabra.length > 3 && mensaje.includes(palabra)) {
                puntuacion += 0.5;
            }
        });
        
        if (puntuacion > mayorPuntuacion) {
            mayorPuntuacion = puntuacion;
            mejorRespuesta = respuesta.respuesta;
        }
    });
    
    // Si encontramos alguna coincidencia
    if (mejorRespuesta && mayorPuntuacion > 0) {
        return mejorRespuesta;
    }
    
    // Respuesta por defecto si no hay coincidencias
    return "Lo siento, no tengo información sobre eso. ¿Te puedo ayudar con información sobre nuestras membresías, pagos, horarios o servicios?";
}

function sendMessage(automaticMessage = null) {
    const userInput = document.getElementById('userInput');
    const messages = document.getElementById('messages');
    const message = automaticMessage || userInput.value.trim();
    
    if (message === '') return;
    
    // Reiniciar temporizador de inactividad cuando se envía un mensaje
    resetInactivityTimer();
    
    // Add user message (excepto para mensajes de sistema)
    if (!automaticMessage) {
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'user-message';
        userMessageDiv.innerHTML = `<strong>Tú:</strong> ${message}`;
        messages.appendChild(userMessageDiv);
        
        // Clear input
        userInput.value = '';
    }
    
    // Mostrar indicador de "escribiendo..." (excepto para respuestas inmediatas del sistema)
    const showTyping = !automaticMessage || (automaticMessage !== "si" && automaticMessage !== "no");
    
    if (showTyping) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing';
        typingDiv.innerHTML = '<strong>Lomax Bot:</strong> <em>Escribiendo...</em>';
        messages.appendChild(typingDiv);
        
        // Simular un pequeño retraso para que parezca más natural
        setTimeout(() => {
            // Remove typing indicator
            messages.removeChild(typingDiv);
            procesarRespuesta(message, messages);
        }, 800);
    } else {
        procesarRespuesta(message, messages);
    }
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    const chatbotCircle = document.getElementById('chatbot-circle');
    const messages = document.getElementById('messages');
    
    if (chatbot.style.display === 'none' || chatbot.style.display === '') {
        chatbot.style.display = 'flex';
        chatbotCircle.innerHTML = '<span style="font-size: 16px">✕</span>';
        chatbotVisible = true;
        
        // Add welcome message if no messages exist
        if (messages.children.length === 0) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'bot-message';
            welcomeDiv.innerHTML = `<strong>Lomax Bot:</strong> ¡Hola! Soy el asistente virtual de Lomax Fitness. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre membresías, pagos, horarios o servicios.`;
            messages.appendChild(welcomeDiv);
            
            // Agregar sugerencias después del mensaje de bienvenida
            setTimeout(agregarSugerencias, 500);
        }
        
        // Iniciar temporizador de inactividad
        resetInactivityTimer();
    } else {
        chatbot.style.display = 'none';
        chatbotCircle.innerHTML = '<span style="font-size: 24px">💬</span>';
        chatbotVisible = false;
        
        // Detener el temporizador cuando se cierra el chatbot
        clearTimeout(inactivityTimer);
    }
}

function limpiarYCerrarChatbot() {
    // Cerrar chatbot
    const chatbot = document.getElementById('chatbot');
    const chatbotCircle = document.getElementById('chatbot-circle');
    chatbot.style.display = 'none';
    chatbotCircle.innerHTML = '<span style="font-size: 24px">💬</span>';
    chatbotVisible = false;
    
    // Limpiar mensajes después de un pequeño delay
    setTimeout(() => {
        const messages = document.getElementById('messages');
        messages.innerHTML = '';
    }, 500);
    
    // Detener temporizador
    clearTimeout(inactivityTimer);
}

function handleKeyPress(event) {
    // Send message when Enter key is pressed
    if (event.key === 'Enter') {
        sendMessage();
    }
    
    // Reiniciar temporizador de inactividad al escribir
    resetInactivityTimer();
}

// Sugerencias de preguntas frecuentes para añadir al chatbot
function agregarSugerencias() {
    const messages = document.getElementById('messages');
    if (messages.children.length === 1) { // Solo si está el mensaje de bienvenida
        const sugerenciasDiv = document.createElement('div');
        sugerenciasDiv.className = 'chatbot-sugerencias';
        sugerenciasDiv.innerHTML = `
            <p>Preguntas frecuentes:</p>
            <button onclick="hacerPregunta('¿Qué tipos de membresía ofrecen?')">¿Qué tipos de membresía ofrecen?</button>
            <button onclick="hacerPregunta('¿Cómo ingreso al gimnasio?')">¿Cómo ingreso al gimnasio?</button>
            <button onclick="hacerPregunta('¿Qué clases ofrecen?')">¿Qué clases ofrecen?</button>
        `;
        messages.appendChild(sugerenciasDiv);
    }
}

function hacerPregunta(pregunta) {
    document.getElementById('userInput').value = pregunta;
    sendMessage();
    
    // Reiniciar temporizador de inactividad
    resetInactivityTimer();
}

// ===== FUNCIONES DEL MODAL PRUEBA GRATUITA =====

// Función para abrir el modal
function abrirModalPrueba() {
    document.getElementById('modalPruebaGratuita').style.display = 'block';
}

// Función para cerrar el modal
function cerrarModalPrueba() {
    document.getElementById('modalPruebaGratuita').style.display = 'none';
    resetearModal();
}

// Función para resetear el modal
function resetearModal() {
    document.getElementById('formPruebaGratuita').reset();
    document.getElementById('formularioPrueba').style.display = 'block';
    document.getElementById('seccionQR').style.display = 'none';
    document.getElementById('qrcode').innerHTML = '';
    
    // Limpiar mensajes de validación
    const cedulaInput = document.getElementById('cedula');
    if (cedulaInput) {
        const mensajeAnterior = cedulaInput.parentElement.querySelector('.mensaje-validacion');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        cedulaInput.style.borderColor = '';
    }
}

// ===== FUNCIONES DE VALIDACIÓN DE CÉDULA =====

// Función mejorada para validar cédula ecuatoriana
function validarCedulaEcuatoriana(cedula) {
    // Verificar que tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
        return { valida: false, mensaje: "La cédula debe tener exactamente 10 dígitos" };
    }
    
    // Verificar que los dos primeros dígitos correspondan a una provincia válida (01-24)
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
        return { valida: false, mensaje: "Los dos primeros dígitos deben corresponder a una provincia válida (01-24)" };
    }
    
    // Verificar el tercer dígito (debe ser menor a 6 para personas naturales)
    const tercerDigito = parseInt(cedula.substring(2, 3));
    if (tercerDigito >= 6) {
        return { valida: false, mensaje: "El tercer dígito debe ser menor a 6 para personas naturales" };
    }
    
    // Algoritmo de validación del dígito verificador
    const digitos = cedula.split('').map(Number);
    const digitoVerificador = digitos[9];
    
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let valor = digitos[i];
        if (i % 2 === 0) { // Posiciones impares (0, 2, 4, 6, 8)
            valor *= 2;
            if (valor > 9) {
                valor -= 9;
            }
        }
        suma += valor;
    }
    
    const digitoCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    
    if (digitoCalculado !== digitoVerificador) {
        return { valida: false, mensaje: "La cédula ingresada no es válida" };
    }
    
    return { valida: true, mensaje: "Cédula válida" };
}

// Función para verificar si la cédula ya existe en la base de datos
async function verificarCedulaExistente(cedula) {
    try {
        const response = await fetch(`https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/PruebaGratis/cedula/${cedula}`);
        
        if (response.status === 404) {
            // No encontrado - cédula disponible
            return { existe: false, mensaje: "Cédula disponible" };
        } else if (response.ok) {
            // Encontrado - cédula ya registrada
            return { existe: true, mensaje: "Esta cédula ya está registrada" };
        } else {
            // Error del servidor
            return { existe: false, mensaje: "Error al verificar la cédula" };
        }
    } catch (error) {
        console.error('Error al verificar cédula:', error);
        return { existe: false, mensaje: "Error de conexión al verificar la cédula" };
    }
}

// Función para mostrar mensajes en el campo de cédula
function mostrarMensajeCedula(mensaje, tipo) {
    const cedulaInput = document.getElementById('cedula');
    const contenedorInput = cedulaInput.parentElement;
    
    // Remover mensaje anterior si existe
    const mensajeAnterior = contenedorInput.querySelector('.mensaje-validacion');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    // Crear nuevo mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-validacion ${tipo}`;
    mensajeDiv.innerHTML = `<i class="fas ${tipo === 'error' ? 'fa-times-circle' : tipo === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${mensaje}`;
    
    // Estilos para el mensaje
    mensajeDiv.style.cssText = `
        margin-top: 5px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        ${tipo === 'error' ? 'background-color: #fee; color: #c53030; border: 1px solid #fed7d7;' : 
          tipo === 'warning' ? 'background-color: #fffbeb; color: #d69e2e; border: 1px solid #fbd38d;' : 
          'background-color: #f0fff4; color: #38a169; border: 1px solid #9ae6b4;'}
    `;
    
    // Agregar mensaje después del input
    contenedorInput.appendChild(mensajeDiv);
    
    // Cambiar borde del input según el tipo
    if (tipo === 'error') {
        cedulaInput.style.borderColor = '#e53e3e';
    } else if (tipo === 'warning') {
        cedulaInput.style.borderColor = '#d69e2e';
    } else {
        cedulaInput.style.borderColor = '#38a169';
    }
}

// Función de validación en tiempo real
async function validarCedulaTiempoReal(cedula) {
    // Limpiar timeout anterior
    if (timeoutValidacion) {
        clearTimeout(timeoutValidacion);
    }
    
    // Si está vacío, limpiar mensajes
    if (!cedula) {
        const cedulaInput = document.getElementById('cedula');
        const mensajeAnterior = cedulaInput.parentElement.querySelector('.mensaje-validacion');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        cedulaInput.style.borderColor = '';
        return;
    }
    
    // Si no tiene 10 dígitos aún, no validar
    if (cedula.length < 10) {
        mostrarMensajeCedula(`Faltan ${10 - cedula.length} dígitos`, 'warning');
        return;
    }
    
    // Validar formato y algoritmo de cédula
    const validacionCedula = validarCedulaEcuatoriana(cedula);
    
    if (!validacionCedula.valida) {
        mostrarMensajeCedula(validacionCedula.mensaje, 'error');
        return;
    }
    
    // Mostrar mensaje de validación mientras verifica en la base de datos
    mostrarMensajeCedula('Verificando disponibilidad...', 'warning');
    
    // Debounce para evitar muchas consultas
    timeoutValidacion = setTimeout(async () => {
        // Verificar si ya existe en la base de datos
        const verificacion = await verificarCedulaExistente(cedula);
        
        if (verificacion.existe) {
            mostrarMensajeCedula(verificacion.mensaje, 'error');
        } else {
            mostrarMensajeCedula('Cédula válida y disponible', 'success');
        }
    }, 800); // Esperar 800ms después de que el usuario deje de escribir
}

// Función para configurar la validación de cédula
function configurarValidacionCedula() {
    const cedulaInput = document.getElementById('cedula');
    
    if (cedulaInput) {
        cedulaInput.addEventListener('input', async function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Solo números
            if (value.length > 10) value = value.slice(0, 10);
            e.target.value = value;
            
            // Validar en tiempo real
            await validarCedulaTiempoReal(value);
        });
        
        // También validar cuando el campo pierde el foco
        cedulaInput.addEventListener('blur', async function(e) {
            const value = e.target.value.trim();
            if (value.length === 10) {
                await validarCedulaTiempoReal(value);
            }
        });
    }
}

// Función para verificar si el formulario es válido antes de enviar
function verificarFormularioValido() {
    const cedulaInput = document.getElementById('cedula');
    const mensaje = cedulaInput.parentElement.querySelector('.mensaje-validacion');
    
    // Verificar si hay un mensaje de error
    if (mensaje && mensaje.classList.contains('error')) {
        alert('❌ Por favor, corrije los errores en el formulario antes de continuar');
        return false;
    }
    
    // Verificar que la cédula esté validada como correcta
    if (!mensaje || !mensaje.classList.contains('success')) {
        alert('❌ Por favor, ingresa una cédula válida antes de continuar');
        return false;
    }
    
    return true;
}

// ===== FUNCIONES DE CARGA =====

// Función para mostrar mensaje de carga
function mostrarCargando() {
    const contenedorCarga = document.createElement('div');
    contenedorCarga.id = 'cargando';
    contenedorCarga.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: white;
        font-size: 18px;
    `;
    contenedorCarga.innerHTML = `
        <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 40px 30px; border-radius: 15px; backdrop-filter: blur(10px);">
            <div style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="margin: 0; font-weight: 500;">Generando código QR...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(contenedorCarga);
}

// Función para ocultar mensaje de carga
function ocultarCargando() {
    const contenedorCarga = document.getElementById('cargando');
    if (contenedorCarga) {
        contenedorCarga.remove();
    }
}

// ===== FUNCIÓN PRINCIPAL PARA GENERAR QR =====

// Función principal para generar QR con integración a la API
async function generarQR() {
    const form = document.getElementById('formPruebaGratuita');
    
    // Validar formulario básico
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Verificar que la cédula esté validada correctamente
    if (!verificarFormularioValido()) {
        return;
    }

    // Obtener datos del formulario
    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const genero = document.getElementById('genero').value;
    const correo = document.getElementById('correo').value.trim();

    // Mostrar indicador de carga
    mostrarCargando();

    try {
        // Delay inicial para mostrar la carga (1.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Preparar datos para enviar a la API
        const datosAPI = {
            cedula: cedula,
            nombre: nombre,
            apellido: apellido,
            correoElectronico: correo,
            genero: genero
        };

        // Enviar datos a la API
        const response = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/PruebaGratis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosAPI)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la prueba gratuita');
        }

        // Obtener la respuesta con los datos guardados
        const datosGuardados = await response.json();
        console.log('Datos guardados:', datosGuardados);

        // Delay adicional para que el usuario vea la carga (1 segundo más)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Guardar datos localmente para uso posterior
        datosUsuario = {
            idPrueba: datosGuardados.idPrueba,
            cedula: datosGuardados.cedula,
            nombre: datosGuardados.nombre,
            apellido: datosGuardados.apellido,
            genero: datosGuardados.genero,
            correo: datosGuardados.correoElectronico,
            fechaRegistro: new Date(datosGuardados.fechaRegistro).toLocaleDateString(),
            codigoQR: datosGuardados.codigoQR,
            estado: datosGuardados.estado ? 'Activa' : 'Inactiva'
        };

        // Crear texto para QR
        const textoQR = `LOMAX FITNESS - PRUEBA GRATUITA
ID: ${datosGuardados.idPrueba}
Cédula: ${datosGuardados.cedula}
Nombre: ${datosGuardados.nombre} ${datosGuardados.apellido}
Género: ${datosGuardados.genero}
Email: ${datosGuardados.correoElectronico}
Fecha: ${datosUsuario.fechaRegistro}
Código: ${datosGuardados.codigoQR}
Estado: ${datosUsuario.estado}
Válido por: 1 día`;

        // Generar QR usando API gratuita
        const textoQREncoded = encodeURIComponent(textoQR);
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${textoQREncoded}&bgcolor=FFFFFF&color=16253D&format=png&margin=10`;
        
        // Crear imagen QR
        const qrImg = document.createElement('img');
        qrImg.src = qrURL;
        qrImg.alt = 'Código QR Prueba Gratuita';
        qrImg.style.cssText = 'width: 250px; height: 250px; border: 2px solid #16253D; border-radius: 10px;';
        qrImg.crossOrigin = 'anonymous';
        
        // Limpiar y agregar QR
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrcode').appendChild(qrImg);
        
        // Mostrar datos generados
        document.getElementById('datosGenerados').innerHTML = `
            <p><strong>ID:</strong> ${datosGuardados.idPrueba}</p>
            <p><strong>Cédula:</strong> ${datosGuardados.cedula}</p>
            <p><strong>Nombre:</strong> ${datosGuardados.nombre} ${datosGuardados.apellido}</p>
            <p><strong>Género:</strong> ${datosGuardados.genero}</p>
            <p><strong>Email:</strong> ${datosGuardados.correoElectronico}</p>
            <p><strong>Fecha:</strong> ${datosUsuario.fechaRegistro}</p>
            <p><strong>Estado:</strong> ${datosUsuario.estado}</p>
            <p><strong>Código QR:</strong> ${datosGuardados.codigoQR}</p>
        `;
        
        // Cambiar vista
        document.getElementById('formularioPrueba').style.display = 'none';
        document.getElementById('seccionQR').style.display = 'block';

        // Ocultar indicador de carga
        ocultarCargando();

    } catch (error) {
        console.error('Error:', error);
        ocultarCargando();
        alert('❌ Error al registrar la prueba gratuita: ' + error.message);
    }
}

// ===== FUNCIONES DE DESCARGA Y UTILIDADES =====

// Función para descargar QR
function descargarQR() {
    const qrContainer = document.getElementById('qrcode');
    const img = qrContainer.querySelector('img');
    
    if (img && datosUsuario.cedula) {
        // Crear un canvas temporal para convertir la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 250;
        canvas.height = 250;
        
        // Función para procesar la descarga
        const procesarDescarga = () => {
            ctx.drawImage(img, 0, 0, 250, 250);
            
            // Descargar como PNG
            const link = document.createElement('a');
            link.download = `QR_PruebaGratuita_${datosUsuario.cedula}_${datosUsuario.idPrueba}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        // Si la imagen ya está cargada
        if (img.complete && img.naturalWidth > 0) {
            procesarDescarga();
        } else {
            // Esperar a que la imagen se cargue
            img.onload = procesarDescarga;
            img.onerror = () => {
                alert('❌ Error al cargar el código QR para descarga');
            };
        }
    } else {
        alert('❌ No se pudo descargar el código QR');
    }
}

// Función para nueva prueba
function nuevaPrueba() {
    document.getElementById('formularioPrueba').style.display = 'block';
    document.getElementById('seccionQR').style.display = 'none';
    document.getElementById('formPruebaGratuita').reset();
    datosUsuario = {}; // Limpiar datos previos
    
    // Limpiar mensajes de validación
    const cedulaInput = document.getElementById('cedula');
    if (cedulaInput) {
        const mensajeAnterior = cedulaInput.parentElement.querySelector('.mensaje-validacion');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        cedulaInput.style.borderColor = '';
    }
}

// ===== EVENT LISTENERS GLOBALES =====

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalPruebaGratuita');
    if (event.target === modal) {
        cerrarModalPrueba();
    }
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModalPrueba();
    }
});