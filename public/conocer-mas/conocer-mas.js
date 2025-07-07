document.addEventListener('DOMContentLoaded', function() {
  // Coordenadas del gimnasio Lomax Fitness
  const gymLocation = {
    lat: -1.2456283, // Aproximación para Av. Quiz Quiz 1172-1296, Ambato
    lng: -78.6299838  // Ajusta estas coordenadas con las exactas del gimnasio
  };

  // Referencias a elementos del DOM
  const mapButton = document.querySelector('.schedule-card a.btn-outline-small');
  
  // Crear elementos para el modal del mapa
  const mapModal = document.createElement('div');
  mapModal.className = 'map-modal';
  
  mapModal.innerHTML = `
    <div class="map-modal-content">
      <span class="map-close-btn">&times;</span>
      <h2>Ubicación de Lomax Fitness</h2>
      <p>Av. Quiz Quiz 1172-1296, Ambato 180202</p>
      <div id="map"></div>
      <div id="directions-status"></div>
      <button id="get-directions" class="btn btn-primary">Mostrar ruta hasta el gimnasio</button>
    </div>
  `;
  
  document.body.appendChild(mapModal);
  
  // Referencias a elementos creados
  const closeBtn = document.querySelector('.map-close-btn');
  const getDirectionsBtn = document.getElementById('get-directions');
  const directionsStatus = document.getElementById('directions-status');
  
  // Estilos CSS para el modal con diseño responsivo
  const mapStyles = document.createElement('style');
  mapStyles.textContent = `
    .map-modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.7);
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .map-modal-content {
      background-color: #fff;
      margin: 5% auto;
      padding: 20px;
      border-radius: 10px;
      width: 80%;
      max-width: 800px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      position: relative;
    }
    
    .map-close-btn {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      transition: color 0.2s;
      position: absolute;
      right: 20px;
      top: 10px;
    }
    
    .map-close-btn:hover {
      color: #000;
    }
    
    #map {
      height: 400px;
      width: 100%;
      border-radius: 8px;
      margin: 15px 0;
    }
    
    #directions-status {
      margin: 10px 0;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
      font-size: 14px;
      min-height: 20px;
    }
    
    #get-directions {
      margin-top: 10px;
      display: block;
      width: 100%;
      max-width: 300px;
      margin: 10px auto;
      padding: 10px 15px;
    }
    
    .leaflet-popup-content {
      text-align: center;
    }
    
    .user-marker {
      color: blue;
    }
    
    .gym-marker {
      color: red;
    }
    
    /* Ocultar las instrucciones paso a paso */
    .leaflet-routing-container {
      display: none !important;
    }

    /* RESPONSIVE DESIGN PARA IPHONE 8 Y MÓVILES */
    @media screen and (max-width: 768px) {
      .map-modal-content {
        width: 95%;
        margin: 2% auto;
        padding: 15px;
        border-radius: 8px;
        max-height: 95vh;
        overflow-y: auto;
      }
      
      .map-modal-content h2 {
        font-size: 18px;
        margin: 15px 0 10px 0;
        padding-right: 30px;
      }
      
      .map-modal-content p {
        font-size: 14px;
        margin: 5px 0 15px 0;
      }
      
      .map-close-btn {
        font-size: 24px;
        right: 15px;
        top: 8px;
      }
      
      #map {
        height: 300px;
        margin: 10px 0;
        border-radius: 6px;
      }
      
      #directions-status {
        font-size: 13px;
        padding: 8px;
        margin: 8px 0;
      }
      
      #get-directions {
        font-size: 14px;
        padding: 12px 15px;
        max-width: 100%;
        margin: 10px 0;
      }
    }

    /* ESPECÍFICO PARA IPHONE 8 (375px x 667px) */
    @media screen and (max-width: 414px) and (max-height: 736px) {
      .map-modal {
        padding: 0;
      }
      
      .map-modal-content {
        width: 98%;
        margin: 1% auto;
        padding: 12px;
        border-radius: 6px;
        max-height: 98vh;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      
      .map-modal-content h2 {
        font-size: 16px;
        margin: 10px 0 8px 0;
        padding-right: 25px;
        line-height: 1.3;
      }
      
      .map-modal-content p {
        font-size: 13px;
        margin: 5px 0 12px 0;
        line-height: 1.4;
      }
      
      .map-close-btn {
        font-size: 22px;
        right: 12px;
        top: 6px;
        padding: 2px;
      }
      
      #map {
        height: 250px;
        margin: 8px 0;
        border-radius: 4px;
      }
      
      #directions-status {
        font-size: 12px;
        padding: 6px 8px;
        margin: 6px 0;
        line-height: 1.3;
      }
      
      #get-directions {
        font-size: 13px;
        padding: 10px 12px;
        margin: 8px 0;
        border-radius: 6px;
      }
    }

    /* ORIENTACIÓN LANDSCAPE EN MÓVILES */
    @media screen and (max-width: 768px) and (orientation: landscape) {
      .map-modal-content {
        max-height: 90vh;
        margin: 1% auto;
      }
      
      #map {
        height: 200px;
      }
      
      .map-modal-content h2 {
        font-size: 16px;
        margin: 8px 0 5px 0;
      }
      
      .map-modal-content p {
        font-size: 13px;
        margin: 3px 0 8px 0;
      }
      
      #directions-status {
        font-size: 12px;
        padding: 6px;
        margin: 5px 0;
      }
      
      #get-directions {
        font-size: 13px;
        padding: 8px 12px;
        margin: 5px 0;
      }
    }
  `;
  
  document.head.appendChild(mapStyles);
  
  // Agregar eventos
  mapButton.addEventListener('click', function(e) {
    e.preventDefault();
    mapModal.style.display = 'block';
    initMap();
  });
  
  closeBtn.addEventListener('click', function() {
    mapModal.style.display = 'none';
  });
  
  window.addEventListener('click', function(e) {
    if (e.target === mapModal) {
      mapModal.style.display = 'none';
    }
  });
  
  getDirectionsBtn.addEventListener('click', function() {
    getDirections();
  });

  // Variable para almacenar la instancia del mapa
  let map;
  let userMarker;
  let routingControl;

  // Función para inicializar el mapa con Leaflet (OpenStreetMap)
  function initMap() {
    // Cargar la hoja de estilo de Leaflet si no está cargada
    if (!document.getElementById('leaflet-css')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.id = 'leaflet-css';
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);
    }

    // Cargar Leaflet.js si no está cargado
    if (typeof L === 'undefined') {
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletScript.onload = function() {
        // Cargar el plugin de rutas después de cargar Leaflet
        const routingScript = document.createElement('script');
        routingScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js';
        routingScript.onload = function() {
          createLeafletMap();
        };
        document.head.appendChild(routingScript);
      };
      document.head.appendChild(leafletScript);
    } else {
      createLeafletMap();
    }
  }

  // Función para crear el mapa de Leaflet
  function createLeafletMap() {
    if (map) {
      map.remove(); // Eliminar mapa anterior si existe
    }

    // Convertir coordenadas de Google Maps a formato Leaflet [lat, lng]
    const gymLatLng = [gymLocation.lat, gymLocation.lng];
    
    // Inicializar el mapa
    map = L.map('map').setView(gymLatLng, 15);
    
    // Añadir la capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Añadir marcador del gimnasio
    const gymIcon = L.divIcon({
      html: '<i class="fas fa-dumbbell gym-marker" style="font-size: 24px;"></i>',
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    // Usar un marcador estándar si hay problemas con el divIcon
    const gymMarker = L.marker(gymLatLng, {
      title: 'Lomax Fitness'
      // icon: gymIcon // Comentado para usar el marcador estándar
    }).addTo(map);
    
    // Añadir popup al marcador
    gymMarker.bindPopup(`
      <div>
        <h3 style="margin: 5px 0; font-weight: bold;">Lomax Fitness</h3>
        <p style="margin: 5px 0;">Av. Quiz Quiz 1172-1296, Ambato 180202</p>
        <p style="margin: 5px 0;">Tel: 0998861722</p>
      </div>
    `).openPopup();
    
    // Ajustar el tamaño del mapa después de que se muestre
    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }

  // Función para obtener direcciones desde la ubicación del usuario hasta el gimnasio
  function getDirections() {
    if (navigator.geolocation) {
      directionsStatus.textContent = 'Solicitando tu ubicación...';
      directionsStatus.style.display = 'block';
      
      navigator.geolocation.getCurrentPosition(
        function(position) {
          directionsStatus.textContent = 'Calculando la mejor ruta...';
          
          const userLatLng = [position.coords.latitude, position.coords.longitude];
          const gymLatLng = [gymLocation.lat, gymLocation.lng];
          
          // Eliminar ruta anterior si existe
          if (routingControl) {
            map.removeControl(routingControl);
          }
          
          // Eliminar marcador del usuario si existe
          if (userMarker) {
            map.removeLayer(userMarker);
          }
          
          // Añadir marcador de la ubicación del usuario
          userMarker = L.marker(userLatLng, {
            title: 'Tu ubicación'
          }).addTo(map);
          
          userMarker.bindPopup('Tu ubicación actual').openPopup();
          
          // Crear configuración personalizada para ocultar las instrucciones
          const routingControlOptions = {
            waypoints: [
              L.latLng(userLatLng[0], userLatLng[1]),
              L.latLng(gymLatLng[0], gymLatLng[1])
            ],
            routeWhileDragging: true,
            showAlternatives: false,
            lineOptions: {
              styles: [
                {color: 'blue', opacity: 0.7, weight: 6}
              ]
            },
            createMarker: function() { return null; }, // No mostrar los marcadores adicionales de la ruta
            show: false, // No mostrar el panel de control
            collapsible: true, // Hacer que el panel sea colapsable
            collapsed: true, // Mantener el panel colapsado
            fitSelectedRoutes: true,
            router: L.Routing.osrmv1({
              // Configuración específica para OSRM
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: 'driving'
            })
          };
          
          // Crear el control de ruta con nuestras opciones
          routingControl = L.Routing.control(routingControlOptions).addTo(map);
          
          // Ajustar el mapa para mostrar toda la ruta
          const bounds = L.latLngBounds(userLatLng, gymLatLng);
          map.fitBounds(bounds, {padding: [50, 50]});
          
          // Escuchar el evento de ruta encontrada
          routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            // Mostrar solo distancia y tiempo
            const distance = (summary.totalDistance / 1000).toFixed(1); // Convertir a km
            const time = Math.round(summary.totalTime / 60); // Convertir a minutos
            
            directionsStatus.innerHTML = `
              <strong>Distancia:</strong> ${distance} km | 
              <strong>Tiempo estimado:</strong> ${time} minutos
            `;
          });
          
          // Asegurarse de ocultar el contenedor de instrucciones después de que se cargue
          setTimeout(function() {
            const routingContainers = document.querySelectorAll('.leaflet-routing-container');
            routingContainers.forEach(container => {
              container.style.display = 'none';
            });
          }, 500);
        },
        function(error) {
          let errorMessage = 'No se pudo obtener tu ubicación.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Has denegado el permiso para acceder a tu ubicación. Por favor, activa la geolocalización y vuelve a intentarlo.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'La información de tu ubicación no está disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Se agotó el tiempo para obtener tu ubicación. Por favor, inténtalo de nuevo.';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = 'Ha ocurrido un error desconocido al obtener tu ubicación.';
              break;
          }
          
          directionsStatus.textContent = errorMessage;
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      directionsStatus.textContent = 'Lo sentimos, tu navegador no soporta geolocalización.';
    }
  }
});