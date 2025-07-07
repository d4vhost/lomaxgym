// Funcionalidad de búsqueda en tiempo real para instalaciones
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const locationCards = document.querySelectorAll('.location-card');
    
    // Función para filtrar las instalaciones
    function filterLocations(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        
        locationCards.forEach(card => {
            // Obtener el texto de búsqueda de cada tarjeta
            const locationName = card.querySelector('h3').textContent.toLowerCase();
            const locationAddress = card.querySelector('p').textContent.toLowerCase();
            
            // Verificar si el término de búsqueda coincide con el nombre o dirección
            const matchesSearch = locationName.includes(searchTerm) || 
                                locationAddress.includes(searchTerm);
            
            // Mostrar u ocultar la tarjeta con animación suave
            if (matchesSearch || searchTerm === '') {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Mostrar mensaje si no hay resultados
        showNoResultsMessage(searchTerm);
    }
    
    // Función para mostrar mensaje cuando no hay resultados
    function showNoResultsMessage(searchTerm) {
        const locationsGrid = document.querySelector('.locations-grid');
        let noResultsMessage = document.querySelector('.no-results-message');
        
        // Contar tarjetas visibles
        const visibleCards = Array.from(locationCards).filter(card => 
            card.style.display !== 'none' && card.style.opacity !== '0'
        );
        
        if (visibleCards.length === 0 && searchTerm !== '') {
            // Crear mensaje si no existe
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-results-message';
                noResultsMessage.innerHTML = `
                    <div class="no-results-content">
                        <i class="fas fa-search"></i>
                        <h3>No se encontraron instalaciones</h3>
                        <p>No hay instalaciones que coincidan con "${searchTerm}"</p>
                        <p>Intenta con términos como: Ficoa, Huachi, Miraflores, Celiano</p>
                    </div>
                `;
                locationsGrid.parentNode.insertBefore(noResultsMessage, locationsGrid.nextSibling);
            }
            noResultsMessage.style.display = 'block';
        } else {
            // Ocultar mensaje si hay resultados
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none';
            }
        }
    }
    
    // Event listener para el input de búsqueda
    searchInput.addEventListener('input', function(e) {
        filterLocations(e.target.value);
    });
    
    // Event listener para limpiar la búsqueda al presionar Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.target.value = '';
            filterLocations('');
            e.target.blur();
        }
    });
    
    // Función para resaltar texto coincidente (opcional)
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Agregar placeholder dinámico
    const placeholders = [
        'Buscar por ciudad, dirección o nombre',
        'Ej: Ficoa, Huachi Chico, Miraflores...',
        'Busca tu instalación más cercana'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        if (!searchInput.matches(':focus')) {
            searchInput.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }
    }, 3000);
});