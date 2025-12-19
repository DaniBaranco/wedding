document.addEventListener('DOMContentLoaded', function() {
    console.log('Welcome.js cargado');
    
    // Verificar que la base de datos se cargó correctamente
    if (typeof guestDatabase === 'undefined') {
        console.error('ERROR: guestDatabase no está definido');
        return;
    }
    
    console.log('Base de datos cargada:', guestDatabase.length + ' invitados');
    
    // Inicializar efecto de pétalos
    initPetalsEffect();
    
    // Inicializar búsqueda
    initSearch();
});

// Función para crear el efecto de pétalos cayendo
function initPetalsEffect() {
    const container = document.getElementById('petalsContainer');
    const petalColors = ['#e91e63', '#f48fb1', '#f8bbd9', '#fce4ec'];
    const petalShapes = ['circle', 'diamond', 'heart', 'leaf'];
    
    function createPetal() {
        const petal = document.createElement('div');
        const shapeClass = petalShapes[Math.floor(Math.random() * petalShapes.length)];
        petal.className = `petal ${shapeClass}`;
        petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
        
        const size = Math.random() * 10 + 6;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 8 + 6;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(petal);
        
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, (duration + 3) * 1000);
    }
    
    // Crear pétalos más frecuentemente
    setInterval(createPetal, 300);
    
    // Inicializar con algunos pétalos
    for (let i = 0; i < 8; i++) {
        setTimeout(createPetal, i * 80);
    }
}

// Función para inicializar la búsqueda
function initSearch() {
    const searchInput = document.getElementById('guestSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) {
        console.error('Elementos del buscador no encontrados');
        return;
    }
    
    console.log('Inicializando búsqueda...');
    
    // Mostrar todas las opciones al hacer foco
    searchInput.addEventListener('focus', function() {
        console.log('Focus en buscador');
        showAllGuests();
    });
    
    // Búsqueda mientras se escribe
    searchInput.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        console.log('Buscando:', value);
        
        if (value.length === 0) {
            showAllGuests();
            return;
        }
        
        // Filtrar invitados basado en la búsqueda
        const matches = guestDatabase.filter(guest => {
            const fullName = `${guest.nombre} ${guest.apellidos}`.toLowerCase();
            const nombre = guest.nombre.toLowerCase();
            const apellidos = guest.apellidos.toLowerCase();
            
            return fullName.includes(value) || 
                   nombre.includes(value) || 
                   apellidos.includes(value);
        });
        
        console.log('Coincidencias encontradas:', matches.length);
        showSearchResults(matches);
    });
    
    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
            searchResults.style.display = 'none';
        }
    });
    
    // Evitar que se cierre al hacer click dentro del input o resultados
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    searchResults.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    function showAllGuests() {
        showSearchResults(guestDatabase.slice(0, 10)); // Mostrar primeros 10
    }
    
    function showSearchResults(guests) {
        console.log('Mostrando resultados:', guests.length);
        
        if (guests.length === 0) {
            searchResults.innerHTML = '<div class="guest-item"><span class="guest-name">No se encontraron invitados</span></div>';
            searchResults.style.display = 'block';
            return;
        }
        
        searchResults.innerHTML = '';
        searchResults.style.display = 'block';
        
        guests.forEach((guest) => {
            const item = document.createElement('div');
            item.className = 'guest-item';
            
            // Encontrar el índice real del invitado en la base de datos completa
            const realIndex = guestDatabase.findIndex(g => 
                g.nombre === guest.nombre && g.apellidos === guest.apellidos
            ) + 1;
            
            item.innerHTML = `
                <div class="guest-name">${guest.nombre} ${guest.apellidos}</div>
                <div class="guest-details">${guest.categoria || 'Invitado'}</div>
            `;
            
            item.addEventListener('click', function() {
                console.log('Click en invitado:', guest.nombre, guest.apellidos, 'ID:', realIndex);
                selectGuest(guest, realIndex);
            });
            
            searchResults.appendChild(item);
        });
    }
    
    function selectGuest(guest, guestId) {
        console.log('Seleccionando invitado:', guest, 'ID:', guestId);
        
        // Animar la selección
        searchInput.style.background = 'white';
        searchInput.style.borderColor = 'var(--primary-color)';
        searchInput.value = `${guest.nombre} ${guest.apellidos}`;
        
        // Ocultar resultados
        searchResults.style.display = 'none';
        
        // Mostrar botón Next
        if (typeof showNextButton === 'function') {
            showNextButton(guestId);
        }
    }
    
    function showSelectionFeedback() {
        const feedback = document.createElement('div');
        feedback.innerHTML = '✓ ¡Perfecto! Redirigiendo...';
        feedback.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #4caf50;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
            z-index: 1001;
        `;
        
        searchInput.parentElement.appendChild(feedback);
    }
}