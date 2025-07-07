// Función para mostrar errores del mapa
function mostrarErrorMapa(mensaje) {
    const loadingMap = document.getElementById('loading-map');
    loadingMap.innerHTML = `
        <div style="color: #d32f2f; text-align: center; padding: 20px;">
            <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
            <p><strong>Error al cargar el mapa</strong></p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">${mensaje}</p>
            <button onclick="location.reload()" style="
                margin-top: 15px; 
                padding: 8px 16px; 
                background: #CD7213; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer;
            ">Recargar página</button>
        </div>
    `;
}

// carts/carts.js
document.addEventListener('DOMContentLoaded', async function() {
    let selectedPlan = null;
    let planes = [];
    let instalaciones = [];
    let userLocation = null;
    let map = null;
    let beneficiosMembresias = {
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
    
    // Establecer el orden correcto de los planes (Élite, Premium, Básica)
    const ordenPlanes = ["Élite", "Premium", "Básica"];

    // Cargar datos de las APIs
    try {
        // Cargar tipos de membresías
        const responsePlanes = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/TipoMembresiasApi');
        if (!responsePlanes.ok) {
            throw new Error('Error al cargar los tipos de membresías');
        }
        let planesTemp = await responsePlanes.json();
        
        // Ordenar los planes según el orden definido (Élite, Premium, Básica)
        planes = [];
        
        // Primero buscar y agregar el plan Élite (o su equivalente)
        const planElite = planesTemp.find(p => p.nombre === "Élite" || p.nombre === "Elite");
        if (planElite) {
            planElite.nombre = "Élite"; // Asegurar que tenga el nombre correcto con tilde
            planes.push(planElite);
        }
        
        // Luego buscar y agregar el plan Premium
        const planPremium = planesTemp.find(p => p.nombre === "Premium");
        if (planPremium) planes.push(planPremium);
        
        // Finalmente buscar y agregar el plan Básico/Básica
        const planBasico = planesTemp.find(p => p.nombre === "Básico" || p.nombre === "Básica" || p.nombre === "Basico" || p.nombre === "Basica");
        if (planBasico) {
            planBasico.nombre = "Básica"; // Convertir a "Básica" para coincidir con los beneficios
            planes.push(planBasico);
        }
        
        // Si algún plan no se encontró en el formato esperado, agregar los restantes
        if (planes.length < planesTemp.length) {
            planesTemp.forEach(plan => {
                if (!planes.some(p => p.idTipoMembresia === plan.idTipoMembresia)) {
                    planes.push(plan);
                }
            });
        }
        
        // Cargar instalaciones
        const responseInstalaciones = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Instalacions');
        if (!responseInstalaciones.ok) {
            throw new Error('Error al cargar las instalaciones');
        }
        instalaciones = await responseInstalaciones.json();
        
        // Renderizar planes e instalaciones
        renderizarPlanes(planes);
        renderizarInstalaciones(instalaciones);
        
        // Seleccionar el plan Élite por defecto
        const planEliteElement = document.querySelector('.plan-item[data-nombre="Élite"]');
        if (planEliteElement) {
            seleccionarPlan(planEliteElement);
        }
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('#plans-container').innerHTML = 
            `<div class="error-message">Error al cargar los datos. Por favor, intenta más tarde.</div>`;
    }

    // Función para renderizar los planes
    function renderizarPlanes(planes) {
        const planesContainer = document.getElementById('plans-container');
        planesContainer.innerHTML = '';
        
        planes.forEach((plan, index) => {
            // Adaptar los nombres de los planes para coincidir con los beneficios predefinidos
            let nombrePlan = plan.nombre;
            if (nombrePlan === "Básico") nombrePlan = "Básica";
            
            // Determinar si este plan debe tener clase selected y fondo negro por defecto
            const isElite = nombrePlan === "Élite";
            const isSelected = isElite ? 'selected' : '';
            
            // Determinar si debe tener badge y qué texto mostrar
            let badgeHtml = '';
            if (nombrePlan === "Élite") {
                badgeHtml = '<div class="plan-badge">MÁS COMPLETA</div>';
            } else if (nombrePlan === "Premium") {
                badgeHtml = '<div class="plan-badge">MÁS BENEFICIOS</div>';
            }
            
            const planHtml = `
                <div class="plan-item ${isSelected}" data-id="${plan.idTipoMembresia}" data-nombre="${nombrePlan}">
                    <div class="plan-checkbox">
                        <input type="checkbox" id="plan-${plan.idTipoMembresia}" name="plan" value="${plan.idTipoMembresia}" ${isElite ? 'checked' : ''}>
                        <label for="plan-${plan.idTipoMembresia}">PLAN ${nombrePlan.toUpperCase()}</label>
                    </div>
                    
                    <div class="plan-details">
                        <div class="plan-feature">
                            <span>Inscripción</span>
                            <span>${nombrePlan === "Básica" ? "Gratis" : "Gratis"}</span>
                        </div>
                        
                        <div class="plan-feature">
                            <span>Mantenimiento</span>
                            <span>${nombrePlan === "Básica" ? "$ 21.70/año" : "$ 21.70/año"}</span>
                        </div>
                        
                        <div class="plan-feature">
                            <span>Fidelidad</span>
                            <span>${plan.duracionMeses} mes</span>
                        </div>
                        
                        <div class="plan-price">
                            <span class="price-currency">$</span>
                            <span class="price-amount">${Math.floor(plan.precio)}</span>
                            <span class="price-decimals">.${Math.round((plan.precio % 1) * 100)} + IVA</span>
                        </div>
                    </div>
                    
                    ${badgeHtml}
                    
                    <div class="plan-description">
                        ${plan.descripcion}
                    </div>
                </div>
            `;
            
            planesContainer.innerHTML += planHtml;
        });
        
        // Agregar event listeners a los planes
        document.querySelectorAll('.plan-item').forEach(planItem => {
            planItem.addEventListener('click', function() {
                seleccionarPlan(this);
            });
        });
    }
    
    // Función para renderizar las instalaciones
    function renderizarInstalaciones(instalaciones) {
        const selectInstalacion = document.getElementById('instalacion-select');
        selectInstalacion.innerHTML = '<option value="">Selecciona una sede</option>';
        
        instalaciones.forEach(instalacion => {
            selectInstalacion.innerHTML += `
                <option value="${instalacion.idInstalacion}" 
                        data-direccion="${instalacion.direccion}" 
                        data-ciudad="${instalacion.ciudad}"
                        data-latitud="${instalacion.latitud || ''}"
                        data-longitud="${instalacion.longitud || ''}"
                        data-horario="${instalacion.horarioApertura.substring(0, 5)} - ${instalacion.horarioCierre.substring(0, 5)}">
                    ${instalacion.nombre}
                </option>
            `;
        });
        
        // Event listener para el cambio de instalación
        selectInstalacion.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                const direccion = selectedOption.getAttribute('data-direccion');
                const ciudad = selectedOption.getAttribute('data-ciudad');
                const horario = selectedOption.getAttribute('data-horario');
                
                document.getElementById('gym-address').textContent = 
                    `${direccion} - ${ciudad} | Horario: ${horario}`;
                
                // Mostrar el enlace del mapa solo si hay una sede seleccionada
                const verAcademiaLink = document.getElementById('ver-academia');
                verAcademiaLink.style.display = 'inline-flex';
            } else {
                document.getElementById('gym-address').textContent = '';
                document.getElementById('ver-academia').style.display = 'none';
            }
        });
    }
    
    // Función para seleccionar un plan
    function seleccionarPlan(planElement) {
        // Obtener el nombre del plan
        const planNombre = planElement.getAttribute('data-nombre');
        
        // Deseleccionar todos los planes (visualmente), pero mantener el fondo negro para el plan Élite
        document.querySelectorAll('.plan-item').forEach(plan => {
            const planName = plan.getAttribute('data-nombre');
            
            // Si es el plan Élite, mantener el fondo negro siempre
            if (planName === "Élite") {
                plan.classList.add('selected');
            } else {
                plan.classList.remove('selected');
            }
            
            // Desmarcar todos los checkboxes
            plan.querySelector('input[type="checkbox"]').checked = false;
        });
        
        // Marcar el checkbox del plan seleccionado
        planElement.querySelector('input[type="checkbox"]').checked = true;
        
        // Guardar el plan seleccionado
        const planId = planElement.getAttribute('data-id');
        selectedPlan = {
            id: planId,
            nombre: planNombre
        };
        
        // Actualizar la información del plan en la sección de detalles
        actualizarDetallesPlan(planNombre);
        
        // Actualizar el título
        document.querySelector('.form-title').textContent = `SELECCIONASTE EL PLAN ${planNombre.toUpperCase()}`;
    }
    
    // Función para actualizar los detalles del plan seleccionado
    function actualizarDetallesPlan(planNombre) {
        // Actualizar la tarjeta del plan
        const planCard = document.getElementById('plan-card');
        planCard.innerHTML = `
            <div class="plan-header">Plan ${planNombre}</div>
            <div class="plan-benefit">
                <span class="benefit-icon">🏃</span>
                <span class="benefit-text">Con el plan ${planNombre} obtienes grandes beneficios para tu entrenamiento</span>
            </div>
        `;
        
        // Actualizar los beneficios del plan
        const planBenefits = document.getElementById('plan-benefits');
        planBenefits.innerHTML = '';
        
        // Obtener los beneficios según el nombre del plan
        const beneficios = beneficiosMembresias[planNombre] || [];
        
        beneficios.forEach(beneficio => {
            planBenefits.innerHTML += `
                <div class="price-item">
                    <div class="price-label">
                        <strong>✓ ${beneficio}</strong>
                    </div>
                </div>
            `;
        });
    }

    // Función para obtener la ubicación del usuario
    function obtenerUbicacionUsuario() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('La geolocalización no es soportada por este navegador.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                (error) => {
                    let errorMessage = 'Error desconocido al obtener la ubicación.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permiso de ubicación denegado.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Información de ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Tiempo de espera agotado para obtener la ubicación.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    // Función para calcular distancia y tiempo entre dos puntos
    function calcularDistanciaYTiempo(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distancia = R * c; // Distancia en km

        // Estimación de tiempo (asumiendo velocidad promedio de 40 km/h en ciudad)
        const velocidadPromedio = 40; // km/h
        const tiempoHoras = distancia / velocidadPromedio;
        const tiempoMinutos = Math.round(tiempoHoras * 60);

        return {
            distancia: distancia.toFixed(2),
            tiempo: tiempoMinutos
        };
    }

    // Función para geocodificar una dirección usando Nominatim
    async function geocodificarDireccion(direccion, ciudad) {
        try {
            // Limpiar y formatear la dirección
            let direccionCompleta = `${direccion}, ${ciudad}, Ecuador`;
            
            // Reemplazar caracteres especiales y formatear
            direccionCompleta = direccionCompleta
                .replace(/Q\w+\+\w+,?\s*/g, '') // Remover códigos Plus
                .replace(/&,?\s*/g, '') // Remover & solos
                .replace(/\s+/g, ' ') // Normalizar espacios
                .trim();

            console.log('Geocodificando:', direccionCompleta);
            
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}&limit=1&countrycodes=ec`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                
                console.log(`Coordenadas encontradas para "${direccionCompleta}": ${lat}, ${lng}`);
                
                return {
                    lat: lat,
                    lng: lng,
                    encontrado: true
                };
            } else {
                console.warn(`No se encontraron coordenadas para: ${direccionCompleta}`);
                return null;
            }
        } catch (error) {
            console.error('Error en geocodificación:', error);
            return null;
        }
    }

    // Función para obtener coordenadas específicas de la instalación
    async function obtenerCoordenadasInstalacion(instalacion) {
        // Primero verificar si ya tiene coordenadas en la base de datos
        let lat = parseFloat(instalacion.latitud);
        let lng = parseFloat(instalacion.longitud);
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            console.log(`Usando coordenadas de DB para ${instalacion.nombre}: ${lat}, ${lng}`);
            return { lat, lng, encontrado: true };
        }
        
        // Si no tiene coordenadas, intentar geocodificar la dirección
        console.log(`Geocodificando dirección para ${instalacion.nombre}: ${instalacion.direccion}`);
        
        const coordenadasGeocodificadas = await geocodificarDireccion(instalacion.direccion, instalacion.ciudad);
        
        if (coordenadasGeocodificadas) {
            return coordenadasGeocodificadas;
        }
        
        // Coordenadas de fallback específicas para diferentes zonas de Ambato
        const fallbackCoordinates = {
            'ficoa': { lat: -1.2456, lng: -78.6125 }, // Zona Ficoa
            'rodrigo pachano': { lat: -1.2456, lng: -78.6125 },
            'atahualpa': { lat: -1.2501, lng: -78.6294 }, // Zona Atahualpa
            'celiano monge': { lat: -1.2534, lng: -78.6198 }, // Zona Celiano Monge
            'celino monge': { lat: -1.2534, lng: -78.6198 },
            'parroquia celiano monge': { lat: -1.2534, lng: -78.6198 },
            'centro': { lat: -1.2490, lng: -78.6067 }, // Centro de Ambato
            'ambato': { lat: -1.2490, lng: -78.6067 } // Por defecto Ambato centro
        };
        
        // Buscar en el texto de la dirección palabras clave
        const direccionLower = `${instalacion.direccion} ${instalacion.ciudad}`.toLowerCase();
        
        for (const [keyword, coords] of Object.entries(fallbackCoordinates)) {
            if (direccionLower.includes(keyword)) {
                console.log(`Usando coordenadas de fallback para "${keyword}": ${coords.lat}, ${coords.lng}`);
                return { lat: coords.lat, lng: coords.lng, encontrado: false };
            }
        }
        
        // Última opción: centro de Ambato
        console.log('Usando coordenadas por defecto: centro de Ambato');
        return { lat: -1.2490, lng: -78.6067, encontrado: false };
    }

    // Función para crear el mapa y mostrar automáticamente la ruta
    async function mostrarMapaConUbicacion(instalacionSeleccionada) {
        const modal = document.getElementById('map-modal');
        const modalTitle = document.getElementById('modal-title');
        const loadingMap = document.getElementById('loading-map');
        const mapContainer = document.getElementById('map-container');
        const routeInfoTop = document.getElementById('route-info-top');

        // Mostrar modal y loading
        modal.style.display = 'block';
        modalTitle.textContent = `Ubicación: ${instalacionSeleccionada.nombre}`;
        loadingMap.style.display = 'block';
        mapContainer.style.display = 'none';
        routeInfoTop.style.display = 'none';

        try {
            // Obtener coordenadas específicas de la instalación
            console.log('Obteniendo coordenadas para:', instalacionSeleccionada);
            const coordenadasGym = await obtenerCoordenadasInstalacion(instalacionSeleccionada);
            const gymLat = coordenadasGym.lat;
            const gymLng = coordenadasGym.lng;
            
            console.log(`Coordenadas finales del gimnasio: ${gymLat}, ${gymLng}`);

            // Primero obtener la ubicación del usuario
            await obtenerUbicacionUsuario();

            // Esperar un momento para que el DOM esté listo
            setTimeout(() => {
                try {
                    // Limpiar mapa anterior si existe
                    if (map) {
                        map.remove();
                        map = null;
                    }

                    // Mostrar el contenedor del mapa primero
                    loadingMap.style.display = 'none';
                    mapContainer.style.display = 'block';
                    
                    // Esperar un frame para que el contenedor se renderice
                    requestAnimationFrame(() => {
                        // Crear el mapa centrado entre ambos puntos
                        const centerLat = (userLocation.lat + gymLat) / 2;
                        const centerLng = (userLocation.lng + gymLng) / 2;
                        
                        map = L.map('map-container', {
                            center: [centerLat, centerLng],
                            zoom: 13,
                            zoomControl: true,
                            scrollWheelZoom: true,
                            doubleClickZoom: true,
                            dragging: true
                        });

                        // Agregar tiles del mapa con mejor calidad
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors',
                            maxZoom: 18,
                            minZoom: 10
                        }).addTo(map);

                        // Esperar a que el mapa se cargue completamente
                        map.whenReady(() => {
                            // Forzar invalidación del tamaño del mapa
                            setTimeout(() => {
                                map.invalidateSize();
                                
                                // Marcador del gimnasio
                                const gymIcon = L.divIcon({
                                    html: `
                                        <div style="
                                            background: linear-gradient(135deg, #CD7213 0%, #EFB509 100%);
                                            width: 30px; 
                                            height: 30px; 
                                            border-radius: 50%; 
                                            border: 3px solid white; 
                                            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                                            display: flex; 
                                            align-items: center; 
                                            justify-content: center; 
                                            color: white; 
                                            font-size: 16px; 
                                            font-weight: bold;
                                        ">🏋️</div>
                                    `,
                                    iconSize: [36, 36],
                                    iconAnchor: [18, 18],
                                    className: 'gym-location-marker'
                                });

                                // Agregar texto indicando si las coordenadas son exactas o aproximadas
                                const tipoUbicacion = coordenadasGym.encontrado ? 'Ubicación exacta' : 'Ubicación aproximada';

                                L.marker([gymLat, gymLng], {icon: gymIcon})
                                    .addTo(map)
                                    .bindPopup(`
                                        <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                                            <strong style="color: #16253D; font-size: 14px;">${instalacionSeleccionada.nombre}</strong><br>
                                            <span style="color: #666; font-size: 12px; margin-top: 5px; display: block;">${instalacionSeleccionada.direccion}</span><br>
                                            <span style="color: #666; font-size: 12px;">${instalacionSeleccionada.ciudad}</span><br>
                                            <span style="color: #CD7213; font-size: 10px; font-style: italic; margin-top: 3px; display: block;">${tipoUbicacion}</span>
                                        </div>
                                    `, {
                                        closeButton: false,
                                        offset: [0, -10],
                                        maxWidth: 250
                                    });

                                // Marcador de ubicación del usuario
                                const userIcon = L.divIcon({
                                    html: `
                                        <div style="
                                            background: #4285f4; 
                                            width: 20px; 
                                            height: 20px; 
                                            border-radius: 50%; 
                                            border: 3px solid white; 
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                            position: relative;
                                        ">
                                            <div style="
                                                position: absolute;
                                                top: -5px;
                                                left: -5px;
                                                width: 30px;
                                                height: 30px;
                                                border-radius: 50%;
                                                background: rgba(66, 133, 244, 0.3);
                                                animation: pulse 2s infinite;
                                            "></div>
                                        </div>
                                    `,
                                    iconSize: [26, 26],
                                    iconAnchor: [13, 13],
                                    className: 'user-location-marker'
                                });

                                L.marker([userLocation.lat, userLocation.lng], {icon: userIcon})
                                    .addTo(map)
                                    .bindPopup(`
                                        <div style="text-align: center; font-family: Arial, sans-serif;">
                                            <strong style="color: #4285f4;">📍 Tu ubicación</strong>
                                        </div>
                                    `, {
                                        closeButton: false,
                                        offset: [0, -10]
                                    });

                                // Crear línea de ruta
                                const routeLine = L.polyline([
                                    [userLocation.lat, userLocation.lng],
                                    [gymLat, gymLng]
                                ], {
                                    color: '#CD7213',
                                    weight: 4,
                                    opacity: 0.8,
                                    dashArray: '10, 10',
                                    className: 'animated-route'
                                }).addTo(map);

                                // Ajustar vista para mostrar ambos puntos con padding
                                map.fitBounds(routeLine.getBounds(), {
                                    padding: [30, 30],
                                    maxZoom: 16
                                });

                                // Calcular distancia y tiempo
                                const resultado = calcularDistanciaYTiempo(
                                    userLocation.lat, userLocation.lng, 
                                    gymLat, gymLng
                                );

                                // Mostrar información de la ruta en la parte superior
                                document.getElementById('distance-text').textContent = `📍 Distancia: ${resultado.distancia} km`;
                                document.getElementById('time-text').textContent = `⏱️ Tiempo estimado: ${resultado.tiempo} minutos en auto`;
                                routeInfoTop.style.display = 'block';

                                // Agregar CSS para animación de pulso si no existe
                                if (!document.getElementById('pulse-animation')) {
                                    const style = document.createElement('style');
                                    style.id = 'pulse-animation';
                                    style.textContent = `
                                        @keyframes pulse {
                                            0% { transform: scale(1); opacity: 1; }
                                            50% { transform: scale(1.2); opacity: 0.7; }
                                            100% { transform: scale(1.4); opacity: 0; }
                                        }
                                    `;
                                    document.head.appendChild(style);
                                }

                            }, 300);
                        });
                    });

                } catch (error) {
                    console.error('Error al crear el mapa:', error);
                    mostrarErrorMapa(error.message);
                }
            }, 500);

        } catch (error) {
            console.error('Error al obtener ubicación:', error);
            // Si no puede obtener la ubicación, solo mostrar el gimnasio
            await mostrarSoloGimnasio(instalacionSeleccionada);
        }
    }

    // Función para mostrar solo el gimnasio cuando no se puede obtener la ubicación del usuario
    async function mostrarSoloGimnasio(instalacionSeleccionada) {
        const loadingMap = document.getElementById('loading-map');
        const mapContainer = document.getElementById('map-container');
        const routeInfoTop = document.getElementById('route-info-top');

        // Obtener coordenadas específicas de la instalación
        const coordenadasGym = await obtenerCoordenadasInstalacion(instalacionSeleccionada);
        const gymLat = coordenadasGym.lat;
        const gymLng = coordenadasGym.lng;

        setTimeout(() => {
            try {
                if (map) {
                    map.remove();
                    map = null;
                }

                loadingMap.style.display = 'none';
                mapContainer.style.display = 'block';
                
                requestAnimationFrame(() => {
                    map = L.map('map-container', {
                        center: [gymLat, gymLng],
                        zoom: 15,
                        zoomControl: true,
                        scrollWheelZoom: true,
                        doubleClickZoom: true,
                        dragging: true
                    });

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 18,
                        minZoom: 10
                    }).addTo(map);

                    map.whenReady(() => {
                        setTimeout(() => {
                            map.invalidateSize();
                            
                            const gymIcon = L.divIcon({
                                html: `
                                    <div style="
                                        background: linear-gradient(135deg, #CD7213 0%, #EFB509 100%);
                                        width: 30px; 
                                        height: 30px; 
                                        border-radius: 50%; 
                                        border: 3px solid white; 
                                        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        color: white; 
                                        font-size: 16px; 
                                        font-weight: bold;
                                    ">🏋️</div>
                                `,
                                iconSize: [36, 36],
                                iconAnchor: [18, 18],
                                className: 'gym-location-marker'
                            });

                            const tipoUbicacion = coordenadasGym.encontrado ? 'Ubicación exacta' : 'Ubicación aproximada';

                            const marker = L.marker([gymLat, gymLng], {icon: gymIcon})
                                .addTo(map)
                                .bindPopup(`
                                    <div style="text-align: center; font-family: Arial, sans-serif; min-width: 200px;">
                                        <strong style="color: #16253D; font-size: 14px;">${instalacionSeleccionada.nombre}</strong><br>
                                        <span style="color: #666; font-size: 12px; margin-top: 5px; display: block;">${instalacionSeleccionada.direccion}</span><br>
                                        <span style="color: #666; font-size: 12px;">${instalacionSeleccionada.ciudad}</span><br>
                                        <span style="color: #CD7213; font-size: 10px; font-style: italic; margin-top: 3px; display: block;">${tipoUbicacion}</span>
                                    </div>
                                `, {
                                    closeButton: false,
                                    offset: [0, -10],
                                    maxWidth: 250
                                });

                            setTimeout(() => {
                                marker.openPopup();
                            }, 500);

                            // Mostrar mensaje de que no se pudo obtener la ubicación
                            document.getElementById('distance-text').textContent = `📍 Ubicación del gimnasio`;
                            document.getElementById('time-text').textContent = `⚠️ No se pudo obtener tu ubicación`;
                            routeInfoTop.style.display = 'block';

                        }, 300);
                    });
                });

            } catch (error) {
                console.error('Error al crear el mapa:', error);
                mostrarErrorMapa(error.message);
            }
        }, 500);
    }

    // Event listeners para el modal del mapa
    document.getElementById('ver-academia').addEventListener('click', function(e) {
        e.preventDefault();
        
        const instalacionSelect = document.getElementById('instalacion-select');
        const selectedOption = instalacionSelect.options[instalacionSelect.selectedIndex];
        
        if (!selectedOption.value) {
            alert('Por favor, selecciona una sede primero.');
            return;
        }

        const instalacionSeleccionada = {
            nombre: selectedOption.textContent,
            direccion: selectedOption.getAttribute('data-direccion'),
            ciudad: selectedOption.getAttribute('data-ciudad'),
            latitud: selectedOption.getAttribute('data-latitud'),
            longitud: selectedOption.getAttribute('data-longitud')
        };

        mostrarMapaConUbicacion(instalacionSeleccionada);
    });

    // Cerrar modal
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('map-modal').style.display = 'none';
        if (map) {
            map.remove();
            map = null;
        }
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('map-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
            if (map) {
                map.remove();
                map = null;
            }
        }
    });
    
    // Event listener para el botón de continuar
    document.getElementById('continue-btn').addEventListener('click', function() {
        if (!selectedPlan) {
            alert('Por favor, selecciona un plan para continuar.');
            return;
        }
        
        const instalacionId = document.getElementById('instalacion-select').value;
        if (!instalacionId) {
            alert('Por favor, selecciona una sede para continuar.');
            return;
        }
        
        // Obtener información completa de la membresía seleccionada
        const planCompleto = planes.find(p => p.idTipoMembresia.toString() === selectedPlan.id);
        
        // Obtener información completa de la instalación seleccionada
        const instalacionCompleta = instalaciones.find(i => i.idInstalacion.toString() === instalacionId);
        
        // Guardar la selección en sessionStorage para usarla en la siguiente página
        const seleccion = {
            plan: planCompleto,
            instalacion: instalacionCompleta
        };
        
        // Guardar en sessionStorage
        sessionStorage.setItem('seleccionMembresia', JSON.stringify(seleccion));
        
        // Mostrar en consola SOLO los datos importantes que se están guardando
        console.log("Datos seleccionados para registro:");
        console.log("Membresía:", planCompleto);
        console.log("Instalación:", instalacionCompleta);
        
        // Redireccionar a la página de registro
        window.location.href = '../registro/registro.html';
    });
});