// cobro.js - Sistema de cobro SmartFit
document.addEventListener('DOMContentLoaded', function() {
    // Configuración de APIs
    const API_BASE_URL = 'https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api';
    const API_ENDPOINTS = {
        datosCobro: `${API_BASE_URL}/DatosCobro`,
        pagos: `${API_BASE_URL}/Pagos`,
        tarjetasCredito: `${API_BASE_URL}/TarjetasCredito`,
        tipoTarjetas: `${API_BASE_URL}/TipoTarjetasApi`,
        membresias: `${API_BASE_URL}/Membresias`,
        usuarios: `${API_BASE_URL}/UsuariosApi`
    };

     // Función para inicializar PayPal
    function inicializarPayPal() {
        // Limpiar contenedor existente
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
            paypalContainer.innerHTML = '';
        }

        // Verificar que PayPal SDK esté cargado
        if (typeof paypal === 'undefined') {
            console.error('PayPal SDK no está cargado');
            return;
        }

        // Configurar botones de PayPal
        paypal.Buttons({
            // Configuración del pago
            createOrder: function(data, actions) {
                if (!datosCompletos || !datosCompletos.plan) {
                    console.error('No hay datos de plan para procesar el pago');
                    return;
                }

                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: datosCompletos.plan.precio.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: `Membresía ${datosCompletos.plan.nombre} - ${datosCompletos.instalacion.nombre}`
                    }]
                });
            },

            // Cuando se aprueba el pago
            onApprove: function(data, actions) {
                // Mostrar modal de procesamiento
                const processingModal = document.getElementById('paypal-processing-modal');
                if (processingModal) {
                    processingModal.style.display = 'block';
                }

                return actions.order.capture().then(function(details) {
                    console.log('Pago completado:', details);
                    
                    // Ocultar modal de procesamiento
                    if (processingModal) {
                        processingModal.style.display = 'none';
                    }
                    
                    // Procesar el pago en tu backend
                    procesarPagoPayPal(details);
                });
            },

            // Si hay un error
            onError: function(err) {
                console.error('Error en PayPal:', err);
                
                // Ocultar modal de procesamiento
                const processingModal = document.getElementById('paypal-processing-modal');
                if (processingModal) {
                    processingModal.style.display = 'none';
                }
                
                // Mostrar mensaje de error
                mostrarResultado(false, 'Error al procesar el pago con PayPal: ' + err.message);
            },

            // Si el usuario cancela
            onCancel: function(data) {
                console.log('Pago cancelado por el usuario');
                
                // Ocultar modal de procesamiento
                const processingModal = document.getElementById('paypal-processing-modal');
                if (processingModal) {
                    processingModal.style.display = 'none';
                }
            }
        }).render('#paypal-button-container');
    }

    // Función para procesar el pago de PayPal en tu backend
    async function procesarPagoPayPal(detallesPago) {
        try {
            // Validar términos y condiciones
            const termsCheckbox = document.getElementById('terms-checkbox');
            if (!termsCheckbox.checked) {
                mostrarResultado(false, 'Debe aceptar los términos y condiciones para continuar.');
                return;
            }

            // Recolectar datos de dirección
            const datosDireccion = recolectarDatosDireccion();
            if (!datosDireccion) {
                mostrarResultado(false, 'Por favor complete todos los campos de dirección.');
                return;
            }

            // Construir objeto de pago para tu API
            const datosCobroPayPal = {
                idUsuario: datosCompletos.usuario.idUsuario,
                idMembresia: datosCompletos.plan.idMembresia,
                idInstalacion: datosCompletos.instalacion.idInstalacion,
                metodoPago: 'PayPal',
                montoTotal: datosCompletos.plan.precio,
                direccion: datosDireccion,
                detallesPayPal: {
                    paymentId: detallesPago.id,
                    payerId: detallesPago.payer.payer_id,
                    status: detallesPago.status,
                    amount: detallesPago.purchase_units[0].amount.value
                }
            };

            console.log('Enviando datos de cobro PayPal:', datosCobroPayPal);

            // Enviar a tu API
            const response = await fetch(API_ENDPOINTS.pagos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosCobroPayPal)
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('Respuesta del servidor:', resultado);
                
                mostrarResultado(true, '¡Pago procesado exitosamente con PayPal!', {
                    transactionId: detallesPago.id,
                    plan: datosCompletos.plan.nombre,
                    monto: `$${datosCompletos.plan.precio.toFixed(2)}`
                });
                
                // Limpiar sessionStorage después del éxito
                setTimeout(() => {
                    sessionStorage.removeItem('seleccionMembresia');
                    // Opcional: redirigir a página de éxito
                    // window.location.href = '../success/success.html';
                }, 3000);
                
            } else {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                mostrarResultado(false, 'Error al procesar el pago: ' + (errorData.message || 'Error desconocido'));
            }

        } catch (error) {
            console.error('Error al procesar pago PayPal:', error);
            mostrarResultado(false, 'Error de conexión al procesar el pago.');
        }
    }

    // Función para recolectar datos de dirección
    function recolectarDatosDireccion() {
        const codigoPostal = document.getElementById('codigo-postal').value.trim();
        const provincia = document.getElementById('provincia').value;
        const ciudad = document.getElementById('ciudad').value;
        const sector = document.getElementById('sector').value.trim();
        const interseccion = document.getElementById('interseccion').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const referencia = document.getElementById('referencia').value.trim();

        // Validar campos requeridos
        if (!codigoPostal || !provincia || !ciudad || !sector || !interseccion || !direccion || !numero) {
            return null;
        }

        return {
            codigoPostal,
            provincia,
            ciudad,
            sector,
            interseccion,
            direccion,
            numero,
            referencia
        };
    }

    // Función para mostrar resultados
    function mostrarResultado(exito, mensaje, detalles = null) {
        const resultModal = document.getElementById('result-modal');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const resultDetails = document.getElementById('result-details');

        if (resultModal && resultTitle && resultMessage) {
            resultTitle.textContent = exito ? '✅ ¡Éxito!' : '❌ Error';
            resultMessage.textContent = mensaje;
            
            if (detalles && resultDetails) {
                resultDetails.innerHTML = `
                    <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4>Detalles de la transacción:</h4>
                        <p><strong>ID de transacción:</strong> ${detalles.transactionId}</p>
                        <p><strong>Plan:</strong> ${detalles.plan}</p>
                        <p><strong>Monto:</strong> ${detalles.monto}</p>
                    </div>
                `;
            }
            
            resultModal.style.display = 'block';
        }
    }

    // Función para actualizar estilos visuales de métodos de pago
    function actualizarEstiloMetodoPago() {
        const paymentOptions = document.querySelectorAll('.payment-option');
        paymentOptions.forEach(option => {
            option.classList.remove('active');
        });

        const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
        if (selectedRadio) {
            const parentOption = selectedRadio.closest('.payment-option');
            if (parentOption) {
                parentOption.classList.add('active');
            }
        }
    }

    // Event listeners para cerrar modales
    function configurarModales() {
        // Cerrar modal de resultado
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });

        // Botón cerrar resultado
        if (elementos.closeResultBtn) {
            elementos.closeResultBtn.addEventListener('click', function() {
                elementos.resultModal.style.display = 'none';
            });
        }
    }

    // Mapa de beneficios por membresía (igual que en registro.js)
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

    // Provincias y ciudades del Ecuador
    const PROVINCIAS_CIUDADES = {
        'azuay': ['Cuenca', 'Gualaceo', 'Paute', 'Santa Isabel', 'Girón'],
        'bolivar': ['Guaranda', 'Chillanes', 'Chimbo', 'Echeandía', 'San Miguel'],
        'canar': ['Azogues', 'Biblián', 'Cañar', 'La Troncal', 'El Tambo'],
        'carchi': ['Tulcán', 'Bolívar', 'Espejo', 'Mira', 'Montúfar', 'San Pedro de Huaca'],
        'chimborazo': ['Riobamba', 'Alausí', 'Colta', 'Chambo', 'Chunchi', 'Guamote', 'Guano', 'Pallatanga', 'Penipe', 'Cumandá'],
        'cotopaxi': ['Latacunga', 'La Maná', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'],
        'el-oro': ['Machala', 'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Las Lajas', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma'],
        'esmeraldas': ['Esmeraldas', 'Atacames', 'Eloy Alfaro', 'Muisne', 'Quinindé', 'San Lorenzo'],
        'galapagos': ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
        'guayas': ['Guayaquil', 'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Daule', 'Durán', 'El Empalme', 'El Triunfo', 'Milagro', 'Naranjal', 'Naranjito', 'Palestina', 'Pedro Carbo', 'Playas', 'Samborondón', 'Santa Lucía', 'Salitre', 'San Jacinto de Yaguachi', 'Simón Bolívar', 'Coronel Marcelino Maridueña', 'Lomas de Sargentillo', 'Nobol', 'General Antonio Elizalde', 'Isidro Ayora'],
        'imbabura': ['Ibarra', 'Antonio Ante', 'Cotacachi', 'Otavalo', 'Pimampiro', 'San Miguel de Urcuquí'],
        'loja': ['Loja', 'Calvas', 'Catamayo', 'Celica', 'Chaguarpamba', 'Espíndola', 'Gonzanamá', 'Macará', 'Paltas', 'Pindal', 'Puyango', 'Saraguro', 'Sozoranga', 'Zapotillo', 'Paquisha', 'Quilanga'],
        'los-rios': ['Babahoyo', 'Baba', 'Montalvo', 'Puebloviejo', 'Quevedo', 'Urdaneta', 'Ventanas', 'Vínces', 'Palenque', 'Buena Fé', 'Valencia', 'Mocache', 'Quinsaloma'],
        'manabi': ['Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Paján', 'Pichincha', 'Rocafuerte', 'Santa Ana', 'Sucre', 'Tosagua', '24 de Mayo', 'Pedernales', 'Olmedo', 'Puerto López', 'Jama', 'Jaramijó', 'San Vicente'],
        'morona-santiago': ['Macas', 'Gualaquiza', 'Limón Indanza', 'Logroño', 'Méndez', 'Morona', 'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Huamboya', 'Taisha', 'Tiwintza'],
        'napo': ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola'],
        'orellana': ['Francisco de Orellana', 'Aguarico', 'La Joya de los Sachas', 'Loreto'],
        'pastaza': ['Puyo', 'Arajuno', 'Mera', 'Santa Clara'],
        'pichincha': ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Rumiñahui', 'San Miguel de los Bancos', 'Pedro Vicente Maldonado', 'Puerto Quito'],
        'santa-elena': ['Santa Elena', 'La Libertad', 'Salinas'],
        'santo-domingo': ['Santo Domingo'],
        'sucumbios': ['Nueva Loja', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Putumayo', 'Shushufindi', 'Sucumbíos'],
        'tungurahua': ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Quero', 'San Pedro de Pelileo', 'Santiago de Píllaro', 'Tisaleo'],
        'zamora-chinchipe': ['Zamora', 'Centinela del Cóndor', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza']
    };

    // Variables globales
    let tiposTarjeta = [];
    let datosCompletos = null;

    // Elementos del DOM
    const elementos = {
        // Formulario de dirección
        provinciaSelect: document.getElementById('provincia'),
        ciudadSelect: document.getElementById('ciudad'),
        
        // Métodos de pago
        tarjetaCreditoRadio: document.getElementById('tarjeta-credito'),
        cuentaDebitoRadio: document.getElementById('cuenta-debito'),
        
        // Formulario de tarjeta
        cardForm: document.getElementById('card-form'),
        tipoTarjetaSelect: document.getElementById('tipo-tarjeta'),
        identificacionInput: document.getElementById('identificacion'),
        numeroTarjetaInput: document.getElementById('numero-tarjeta'),
        nombreTarjetaInput: document.getElementById('nombre-tarjeta'),
        vencimientoInput: document.getElementById('vencimiento'),
        cvvInput: document.getElementById('cvv'),
        
        // Botones y modales
        finalizarBtn: document.getElementById('finalize-btn'),
        confirmationModal: document.getElementById('confirmation-modal'),
        resultModal: document.getElementById('result-modal'),
        confirmPurchaseBtn: document.getElementById('confirm-purchase'),
        cancelPurchaseBtn: document.getElementById('cancel-purchase'),
        closeResultBtn: document.getElementById('close-result')
    };

    // Inicializar la aplicación
    init();

    function init() {
        cargarDatosSessionStorage();
        mostrarDetallesCompra(); // Nueva función para mostrar detalles
        llenarProvincias();
        cargarTiposTarjeta();
        configurarEventListeners();
        configurarValidaciones();
        configurarModales();
    }

    function cargarDatosSessionStorage() {
        try {
            const seleccionMembresia = JSON.parse(sessionStorage.getItem('seleccionMembresia'));
            
            if (seleccionMembresia) {
                datosCompletos = seleccionMembresia;
                console.log('Datos completos cargados:', datosCompletos);
                
                if (datosCompletos.plan) {
                    console.log('Plan seleccionado:', datosCompletos.plan);
                }
                
                if (datosCompletos.instalacion) {
                    console.log('Instalacion seleccionada:', datosCompletos.instalacion);
                }
                
                if (datosCompletos.usuario) {
                    console.log('Datos del usuario:', datosCompletos.usuario);
                }
            } else {
                console.error('No se encontraron datos de selección en sessionStorage');
                alert('No se encontraron datos de selección. Redirigiendo...');
                window.location.href = '../carts/carts.html';
            }
        } catch (error) {
            console.error('Error al cargar datos del sessionStorage:', error);
        }
    }

    // Nueva función para mostrar los detalles de compra
    function mostrarDetallesCompra() {
        if (!datosCompletos || !datosCompletos.plan || !datosCompletos.instalacion) {
            console.error('Faltan datos para mostrar detalles de compra');
            return;
        }

        const purchaseDetailsContainer = document.querySelector('.purchase-details');
        
        if (!purchaseDetailsContainer) {
            console.error('No se encontró el contenedor .purchase-details');
            return;
        }

        // Limpiar contenido existente
        purchaseDetailsContainer.innerHTML = '';

        // Crear y agregar título
        const titulo = document.createElement('h3');
        titulo.textContent = 'Resumen de tu compra';
        titulo.style.marginBottom = '20px';
        titulo.style.color = '#333';
        purchaseDetailsContainer.appendChild(titulo);

        // Mostrar detalles de la instalación
        const instalacionDiv = document.createElement('div');
        instalacionDiv.className = 'instalacion-info';
        instalacionDiv.innerHTML = `
            <h4 style="color: #CD7213; margin-bottom: 10px;">📍 Instalación seleccionada</h4>
            <p><strong>${datosCompletos.instalacion.nombre}</strong></p>
            <p style="color: #666; margin-bottom: 15px;">${datosCompletos.instalacion.direccion}</p>
        `;
        purchaseDetailsContainer.appendChild(instalacionDiv);

        // Mostrar detalles del plan
        const planDiv = document.createElement('div');
        planDiv.className = 'plan-info';
        
        // Normalizar nombre del plan (igual que en registro.js)
        let nombrePlan = datosCompletos.plan.nombre;
        if (nombrePlan === "Básico") nombrePlan = "Básica";

        planDiv.innerHTML = `
            <h4 style="color: #16253D; margin-bottom: 15px;">💪 Plan ${nombrePlan}</h4>
            <div style="background: #e0e0e0;; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 18px; font-weight: bold;">${nombrePlan}</span>
                    <span style="font-size: 20px; font-weight: bold; color: #CD7213;">$ ${datosCompletos.plan.precio.toFixed(2)} /mes</span>
                </div>
                ${getBeneficiosHTML(nombrePlan)}
            </div>
        `;
        purchaseDetailsContainer.appendChild(planDiv);

        // Mostrar total
        const totalDiv = document.createElement('div');
        totalDiv.className = 'total-info';
        totalDiv.innerHTML = `
            <div style="border-top: 2px solid #CD7213; padding-top: 15px; margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; font-weight: bold;">Total a pagar:</span>
                    <span style="font-size: 24px; font-weight: bold; color: #CD7213;">$ ${datosCompletos.plan.precio.toFixed(2)}</span>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">*Precio mensual + IVA</p>
            </div>
        `;
        purchaseDetailsContainer.appendChild(totalDiv);
    }

    // Función para obtener el HTML de los beneficios (igual que en registro.js)
    function getBeneficiosHTML(nombrePlan) {
        let beneficiosHTML = '';
        
        // Obtener lista de beneficios según el tipo de membresía
        const listaBeneficios = beneficiosMembresias[nombrePlan] || [];
        
        // Agregar cada beneficio con formato de lista
        listaBeneficios.forEach(beneficio => {
            beneficiosHTML += `
                <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                    <span style="color: #27ae60; margin-right: 8px; font-weight: bold;">✓</span>
                    <span style="color: #333; line-height: 1.4;">${beneficio}</span>
                </div>
            `;
        });
        
        return beneficiosHTML;
    }

    function llenarProvincias() {
        elementos.provinciaSelect.innerHTML = '<option value="">Provincia</option>';
        
        Object.keys(PROVINCIAS_CIUDADES).sort().forEach(provincia => {
            const option = document.createElement('option');
            option.value = provincia;
            option.textContent = provincia.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            elementos.provinciaSelect.appendChild(option);
        });
    }

    function llenarCiudades(provincia) {
        elementos.ciudadSelect.innerHTML = '<option value="">Ciudad</option>';
        elementos.ciudadSelect.disabled = false;
        
        if (provincia && PROVINCIAS_CIUDADES[provincia]) {
            PROVINCIAS_CIUDADES[provincia].sort().forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad.toLowerCase();
                option.textContent = ciudad;
                elementos.ciudadSelect.appendChild(option);
            });
        }
    }

    async function cargarTiposTarjeta() {
        try {
            const response = await fetch(API_ENDPOINTS.tipoTarjetas);
            if (response.ok) {
                tiposTarjeta = await response.json();
                console.log('Tipos de tarjeta cargados:', tiposTarjeta);
                actualizarTipoTarjeta();
            } else {
                console.error('Error al cargar tipos de tarjeta');
            }
        } catch (error) {
            console.error('Error de conexión al cargar tipos de tarjeta:', error);
        }
    }

    function actualizarTipoTarjeta() {
        elementos.tipoTarjetaSelect.innerHTML = '<option value="">Selecciona el tipo de tarjeta</option>';
        
        const metodoPago = document.querySelector('input[name="payment-method"]:checked').value;
        let tiposFiltrados = [];

        if (metodoPago === 'credit') {
            // Tarjetas de crédito: Visa, MasterCard, Diners Club
            tiposFiltrados = tiposTarjeta.filter(tipo => 
                ['Visa', 'MasterCard', 'Diners Club'].includes(tipo.nombre)
            );
        } else if (metodoPago === 'debit') {
            // Débito: Bancos
            tiposFiltrados = tiposTarjeta.filter(tipo => 
                ['Banco Guayaquil', 'Banco Internacional', 'Banco del Pacífico'].includes(tipo.nombre)
            );
        }

        tiposFiltrados.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.idTipoTarjeta;
            option.textContent = tipo.nombre;
            elementos.tipoTarjetaSelect.appendChild(option);
        });
    }

    function configurarEventListeners() {
        // Cambio de provincia
        elementos.provinciaSelect.addEventListener('change', function() {
            const provinciaSeleccionada = this.value;
            if (provinciaSeleccionada) {
                llenarCiudades(provinciaSeleccionada);
            } else {
                elementos.ciudadSelect.innerHTML = '<option value="">Ciudad</option>';
                elementos.ciudadSelect.disabled = true;
            }
        });

        // Cambio de método de pago
        elementos.tarjetaCreditoRadio.addEventListener('change', function() {
            if (this.checked) {
                // Mostrar formulario de tarjeta
                elementos.cardForm.style.display = 'block';
                
                // Ocultar sección de PayPal
                const paypalSection = document.getElementById('paypal-section');
                if (paypalSection) {
                    paypalSection.style.display = 'none';
                }
                
                // Mostrar botón finalizar compra
                elementos.finalizarBtn.style.display = 'block';
                
                actualizarTipoTarjeta();
                actualizarEstiloMetodoPago();
            }
        });

        elementos.cuentaDebitoRadio.addEventListener('change', function() {
            if (this.checked) {
                // Mostrar formulario de tarjeta
                elementos.cardForm.style.display = 'block';
                
                // Ocultar sección de PayPal
                const paypalSection = document.getElementById('paypal-section');
                if (paypalSection) {
                    paypalSection.style.display = 'none';
                }
                
                // Mostrar botón finalizar compra
                elementos.finalizarBtn.style.display = 'block';
                
                actualizarTipoTarjeta();
                actualizarEstiloMetodoPago();
            }
        });
        // NUEVO: Event listener para PayPal
        const paypalRadio = document.getElementById('paypal-gateway');
        if (paypalRadio) {
            paypalRadio.addEventListener('change', function() {
                if (this.checked) {
                    // Ocultar formulario de tarjeta
                    elementos.cardForm.style.display = 'none';
                    
                    // Mostrar sección de PayPal
                    const paypalSection = document.getElementById('paypal-section');
                    if (paypalSection) {
                        paypalSection.style.display = 'block';
                    }
                    
                    // Ocultar botón finalizar compra (PayPal maneja su propio botón)
                    elementos.finalizarBtn.style.display = 'none';
                    
                    // Actualizar estilo visual
                    actualizarEstiloMetodoPago();
                    
                    // Inicializar PayPal si no está inicializado
                    inicializarPayPal();
                }
            });
        }

        elementos.cuentaDebitoRadio.addEventListener('change', function() {
            if (this.checked) {
                actualizarTipoTarjeta();
                actualizarEstiloMetodoPago();
            }
        });

        // Botón finalizar compra
        elementos.finalizarBtn.addEventListener('click', function() {
            if (validarFormulario()) {
                mostrarModal(elementos.confirmationModal);
            }
        });

        // Botones del modal de confirmación
        elementos.confirmPurchaseBtn.addEventListener('click', procesarCompra);
        elementos.cancelPurchaseBtn.addEventListener('click', () => {
            cerrarModal(elementos.confirmationModal);
        });

        // Botón cerrar resultado
        elementos.closeResultBtn.addEventListener('click', () => {
            cerrarModal(elementos.resultModal);
        });

        // Cerrar modales con X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                cerrarModal(modal);
            });
        });

        // Cerrar modales clickeando fuera
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                cerrarModal(event.target);
            }
        });
    }

    function configurarValidaciones() {
        // Validación cédula ecuatoriana
        elementos.identificacionInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
            validarCedula(this);
        });

        // Validación número de tarjeta
        elementos.numeroTarjetaInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
            value = value.substring(0, 16);
            
            // Formatear con espacios cada 4 dígitos
            const formatted = value.replace(/(.{4})/g, '$1 ').trim();
            this.value = formatted;
            
            validarNumeroTarjeta(this);
        });

        // Validación nombre (solo letras y espacios)
        elementos.nombreTarjetaInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').substring(0, 50);
        });

        // Validación fecha vencimiento
        elementos.vencimientoInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
            validarVencimiento(this);
        });

        // Validación CVV
        elementos.cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 3);
            this.type = 'password'; // Ocultar CVV
        });

        // Validaciones solo números
        ['codigo-postal', 'numero'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', function() {
                    this.value = this.value.replace(/\D/g, '');
                });
            }
        });

        // Validaciones solo texto
        ['sector', 'interseccion', 'direccion', 'referencia'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', function() {
                    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,#-]/g, '');
                });
            }
        });
    }

    function validarCedula(input) {
        const cedula = input.value;
        const formGroup = input.closest('.form-group');
        
        if (cedula.length === 10) {
            if (esCedulaValida(cedula)) {
                marcarCampoValido(formGroup);
            } else {
                marcarCampoInvalido(formGroup, 'Cédula inválida');
            }
        } else if (cedula.length > 0) {
            marcarCampoInvalido(formGroup, 'La cédula debe tener 10 dígitos');
        } else {
            limpiarValidacion(formGroup);
        }
    }

    function esCedulaValida(cedula) {
        if (cedula.length !== 10) return false;
        
        const digitos = cedula.split('').map(Number);
        const provincia = parseInt(cedula.substring(0, 2));
        
        if (provincia < 1 || provincia > 24) return false;
        
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;
        
        for (let i = 0; i < 9; i++) {
            let resultado = digitos[i] * coeficientes[i];
            if (resultado > 9) resultado -= 9;
            suma += resultado;
        }
        
        const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
        return digitoVerificador === digitos[9];
    }

    function validarNumeroTarjeta(input) {
        const numero = input.value.replace(/\s/g, '');
        const formGroup = input.closest('.form-group');
        
        if (numero.length >= 13 && numero.length <= 16) {
            if (esNumeroTarjetaValido(numero)) {
                marcarCampoValido(formGroup);
            } else {
                marcarCampoInvalido(formGroup, 'Número de tarjeta inválido');
            }
        } else if (numero.length > 0) {
            marcarCampoInvalido(formGroup, 'Número de tarjeta incompleto');
        } else {
            limpiarValidacion(formGroup);
        }
    }

    function esNumeroTarjetaValido(numero) {
        // Algoritmo de Luhn
        let suma = 0;
        let alternar = false;
        
        for (let i = numero.length - 1; i >= 0; i--) {
            let digito = parseInt(numero.charAt(i));
            
            if (alternar) {
                digito *= 2;
                if (digito > 9) digito -= 9;
            }
            
            suma += digito;
            alternar = !alternar;
        }
        
        return suma % 10 === 0;
    }

    function validarVencimiento(input) {
        const fecha = input.value;
        const formGroup = input.closest('.form-group');
        
        if (fecha.length === 5) {
            const [mes, año] = fecha.split('/').map(Number);
            const fechaActual = new Date();
            const mesActual = fechaActual.getMonth() + 1;
            const añoActual = fechaActual.getFullYear() % 100;
            
            if (mes >= 1 && mes <= 12) {
                if (año > añoActual || (año === añoActual && mes >= mesActual)) {
                    marcarCampoValido(formGroup);
                } else {
                    marcarCampoInvalido(formGroup, 'Tarjeta vencida');
                }
            } else {
                marcarCampoInvalido(formGroup, 'Mes inválido');
            }
        } else if (fecha.length > 0) {
            marcarCampoInvalido(formGroup, 'Formato: MM/AA');
        } else {
            limpiarValidacion(formGroup);
        }
    }

    function marcarCampoValido(formGroup) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) errorMsg.style.display = 'none';
    }

    function marcarCampoInvalido(formGroup, mensaje) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
        
        let errorMsg = formGroup.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            formGroup.appendChild(errorMsg);
        }
        
        errorMsg.textContent = mensaje;
        errorMsg.style.display = 'block';
    }

    function limpiarValidacion(formGroup) {
        formGroup.classList.remove('error', 'success');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) errorMsg.style.display = 'none';
    }

    function actualizarEstiloMetodoPago() {
        document.querySelectorAll('.payment-option').forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio.checked) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    function validarFormulario() {
        let esValido = true;
        const errores = [];

        // Validar dirección
        const camposDireccion = [
            'codigo-postal', 'provincia', 'ciudad', 'sector', 
            'interseccion', 'direccion', 'numero'
        ];

        camposDireccion.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (!elemento.value.trim()) {
                errores.push(`El campo ${campo.replace('-', ' ')} es requerido`);
                esValido = false;
            }
        });

        // Validar tarjeta
        if (!elementos.tipoTarjetaSelect.value) {
            errores.push('Debe seleccionar un tipo de tarjeta');
            esValido = false;
        }

        if (!elementos.identificacionInput.value || !esCedulaValida(elementos.identificacionInput.value)) {
            errores.push('La identificación del titular es inválida');
            esValido = false;
        }

        const numeroTarjeta = elementos.numeroTarjetaInput.value.replace(/\s/g, '');
        if (!numeroTarjeta || !esNumeroTarjetaValido(numeroTarjeta)) {
            errores.push('El número de tarjeta es inválido');
            esValido = false;
        }

        if (!elementos.nombreTarjetaInput.value.trim()) {
            errores.push('El nombre impreso en la tarjeta es requerido');
            esValido = false;
        }

        if (!elementos.vencimientoInput.value || elementos.vencimientoInput.value.length !== 5) {
            errores.push('La fecha de vencimiento es inválida');
            esValido = false;
        }

        if (!elementos.cvvInput.value || elementos.cvvInput.value.length !== 3) {
            errores.push('El CVV debe tener 3 dígitos');
            esValido = false;
        }

        // Validar términos
        if (!document.getElementById('terms-checkbox').checked) {
            errores.push('Debe aceptar los términos y condiciones');
            esValido = false;
        }

        if (!esValido) {
            alert('Por favor, corrija los siguientes errores:\n\n' + errores.join('\n'));
        }

        return esValido;
    }

   // Función corregida para procesar la compra
async function procesarCompra() {
    try {
        elementos.confirmPurchaseBtn.innerHTML = '<span class="spinner"></span>Procesando...';
        elementos.confirmPurchaseBtn.disabled = true;

        if (!datosCompletos?.usuario) {
            throw new Error('No se encontraron datos del usuario');
        }

        let idUsuario = datosCompletos.usuario.idUsuario;

        // 1. Verificar si el usuario ya existe
        if (!idUsuario) {
            console.log('Verificando existencia del usuario por cédula o email...');

            let responseBuscar = await fetch(`${API_ENDPOINTS.usuarios}/ByCedula/${datosCompletos.usuario.cedula}`);
            let usuarioExistente = null;

            if (responseBuscar.ok) {
                usuarioExistente = await responseBuscar.json();
            } else {
                responseBuscar = await fetch(`${API_ENDPOINTS.usuarios}/ByEmail/${datosCompletos.usuario.email}`);
                if (responseBuscar.ok) {
                    usuarioExistente = await responseBuscar.json();
                }
            }

            if (usuarioExistente) {
                console.log('Usuario ya existe. Usando su ID...');
                idUsuario = usuarioExistente.idUsuario;
                datosCompletos.usuario.idUsuario = idUsuario;
            } else {
                console.log('Usuario no existe. Creando nuevo usuario...');
                const usuarioNuevo = {
                    cedula: datosCompletos.usuario.cedula,
                    nombreCompleto: datosCompletos.usuario.nombreCompleto,
                    email: datosCompletos.usuario.email,
                    sexo: datosCompletos.usuario.sexo,
                    celular: datosCompletos.usuario.celular.replace(/[^0-9]/g, '').slice(0, 15),
                    fechaNacimiento: datosCompletos.usuario.fechaNacimiento,
                    contrasenaHash: datosCompletos.usuario.contrasenaHash,
                    politicasAceptadas: datosCompletos.usuario.politicasAceptadas,
                    estado: "Activo"
                };

                const responseUsuario = await fetch(API_ENDPOINTS.usuarios, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioNuevo)
                });

                if (!responseUsuario.ok) {
                    const errorText = await responseUsuario.text();
                    throw new Error('Error al crear el usuario: ' + errorText);
                }

                const usuarioGuardado = await responseUsuario.json();
                idUsuario = usuarioGuardado.idUsuario;
                datosCompletos.usuario.idUsuario = idUsuario;
            }
        }

        // 2. Guardar datos de cobro
        const datosCobro = {
            idCobro: 0,
            idUsuario: idUsuario,
            codigoPostal: document.getElementById('codigo-postal').value,
            provincia: document.getElementById('provincia').value,
            ciudad: document.getElementById('ciudad').value,
            sector: document.getElementById('sector').value,
            interseccion: document.getElementById('interseccion').value,
            direccion: document.getElementById('direccion').value,
            numero: document.getElementById('numero').value,
            referencia: document.getElementById('referencia').value || '',
            esDireccionPrincipal: document.getElementById('direccion-principal').checked
        };

        const responseCobro = await fetch(API_ENDPOINTS.datosCobro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCobro)
        });

        if (!responseCobro.ok) throw new Error(await responseCobro.text());

        // 3. Guardar tarjeta
        const [mes, anio] = elementos.vencimientoInput.value.split('/').map(Number);
        const datosTarjeta = {
            idTarjeta: 0,
            idUsuario: idUsuario,
            idTipoTarjeta: parseInt(elementos.tipoTarjetaSelect.value),
            identificacionTitular: elementos.identificacionInput.value,
            ultimosCuatroDigitos: elementos.numeroTarjetaInput.value.replace(/\s/g, '').slice(-4),
            numeroTarjetaHash: btoa(elementos.numeroTarjetaInput.value.replace(/\s/g, '')),
            nombreImpreso: elementos.nombreTarjetaInput.value,
            vencimientoMes: mes,
            vencimientoAnio: anio + 2000,
            cvvHash: btoa(elementos.cvvInput.value),
            fechaRegistro: new Date().toISOString(),
            esTarjetaPrincipal: document.getElementById('tarjeta-principal').checked
        };

        const responseTarjeta = await fetch(API_ENDPOINTS.tarjetasCredito, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTarjeta)
        });

        if (!responseTarjeta.ok) throw new Error(await responseTarjeta.text());
        const tarjetaGuardada = await responseTarjeta.json();

        // 4. Crear membresía
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + (datosCompletos.plan?.duracionMeses || 1));

        const datosMembresia = {
            idMembresia: 0,
            idUsuario: idUsuario,
            idTipoMembresia: datosCompletos.plan.idTipoMembresia,
            idInstalacion: datosCompletos.instalacion.idInstalacion,
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            estado: "Activa",
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            motivoCancelacion: ""
        };

        const responseMembresia = await fetch(API_ENDPOINTS.membresias, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMembresia)
        });

        if (!responseMembresia.ok) throw new Error(await responseMembresia.text());
        const membresiaCreada = await responseMembresia.json();

        // 5. Registrar pago
        const datosPago = {
            idPago: 0,
            idMembresia: membresiaCreada.idMembresia,
            idTarjeta: tarjetaGuardada.idTarjeta,
            fechaPago: new Date().toISOString(),
            monto: datosCompletos.plan.precio,
            metodoPago: document.querySelector('input[name="payment-method"]:checked').value === 'credit'
                ? 'Tarjeta de Crédito'
                : 'Cuenta de Débito',
            referenciaPago: 'REF-' + Date.now(),
            estado: 'Completado',
            descripcion: `Pago de membresía ${datosCompletos.plan.nombre}`
        };

        const responsePago = await fetch(API_ENDPOINTS.pagos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPago)
        });

        if (!responsePago.ok) throw new Error(await responsePago.text());

        // 6. Éxito
        sessionStorage.removeItem('seleccionMembresia');

        cerrarModal(elementos.confirmationModal);
        mostrarResultado(
            '¡Compra procesada exitosamente!',
            `Su membresía ${datosCompletos.plan.nombre} ha sido activada. Referencia: ${datosPago.referenciaPago}`,
            'success'
        );

        setTimeout(() => {
            window.location.href = '/';
        }, 3000);

    } catch (error) {
        console.error('Error al procesar la compra:', error);
        cerrarModal(elementos.confirmationModal);
        mostrarResultado(
            'Error en el procesamiento',
            `Hubo un error: ${error.message}. Por favor, inténtelo nuevamente.`,
            'error'
        );
    } finally {
        elementos.confirmPurchaseBtn.innerHTML = 'Confirmar';
        elementos.confirmPurchaseBtn.disabled = false;
    }
}



    function mostrarModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function cerrarModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function mostrarResultado(titulo, mensaje, tipo) {
        document.getElementById('result-title').textContent = titulo;
        document.getElementById('result-message').textContent = mensaje;
        
        const modalContent = elementos.resultModal.querySelector('.modal-content');
        modalContent.className = `modal-content ${tipo}`;
        
        mostrarModal(elementos.resultModal);
    }

    // Inicializar con crédito seleccionado por defecto
    actualizarEstiloMetodoPago();
    
    // Deshabilitar ciudad inicialmente
    elementos.ciudadSelect.disabled = true;
});