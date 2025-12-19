document.addEventListener('DOMContentLoaded', function() {
    // Inicializar efecto de pétalos
    initPetalsEffect();
    
    loadStats();
    loadGuests();
});

async function loadGuests() {
    try {
        const response = await fetch('/api/guests');
        if (response.ok) {
            const guests = await response.json();
            displayGuests(guests);
        }
    } catch (error) {
        console.error('Error al cargar invitados:', error);
    }
}

function displayGuests(guests) {
    const tbody = document.getElementById('guestsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    guests.forEach(guest => {
        const row = document.createElement('tr');
        
        const acompanantesStr = guest.acompanantes && guest.acompanantes.length > 0 
            ? guest.acompanantes.join(', ') 
            : 'Sin acompañantes';
        
        row.innerHTML = `
            <td>${guest.id}</td>
            <td>${guest.nombre}</td>
            <td>${guest.apellidos}</td>
            <td>${guest.num_acompanantes}</td>
            <td class="acompanantes-cell" title="${acompanantesStr}">
                ${acompanantesStr.length > 30 ? acompanantesStr.substring(0, 30) + '...' : acompanantesStr}
            </td>
            <td>
                <span class="menu-badge menu-${guest.menu}">
                    ${guest.menu.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
            </td>
            <td>
                <span class="status-badge ${guest.autobus ? 'yes' : 'no'}">
                    ${guest.autobus ? 'Sí' : 'No'}
                </span>
            </td>
            <td>${guest.personas_autobus}</td>
            <td>${guest.fecha_registro}</td>
        `;
        
        tbody.appendChild(row);
    });
}

async function refreshData() {
    try {
        await Promise.all([loadStats(), loadGuests()]);
        showTempMessage('Datos actualizados correctamente', 'success');
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        showTempMessage('Error al actualizar los datos', 'error');
    }
}

async function exportExcel() {
    try {
        const response = await fetch('/api/export_excel');
        
        if (response.ok) {
            // Crear un enlace temporal para descargar el archivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'invitados_boda.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Mostrar modal de confirmación en lugar del mensaje
            showExportModal();
        } else {
            throw new Error('Error al exportar');
        }
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        showTempMessage('Error al exportar el archivo Excel', 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function updateStatsDisplay(stats) {
    const totalElement = document.getElementById('totalGuests');
    const busPersonsElement = document.getElementById('busPersons');
    const companionElement = document.getElementById('companionGuests');
    const totalPersonsElement = document.getElementById('totalPersons');
    
    if (totalElement) {
        animateCounter(totalElement, stats.total_guests);
    }
    if (busPersonsElement) {
        animateCounter(busPersonsElement, stats.total_personas_autobus);
    }
    if (companionElement) {
        animateCounter(companionElement, stats.guests_with_companions);
    }
    if (totalPersonsElement) {
        animateCounter(totalPersonsElement, stats.total_personas);
    }
}

function animateCounter(element, finalValue) {
    const startValue = 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.round(startValue + (finalValue - startValue) * progress);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    updateCounter();
}

function showTempMessage(message, type) {
    // Crear elemento de mensaje temporal
    const messageEl = document.createElement('div');
    messageEl.className = `temp-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    
    document.body.appendChild(messageEl);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Añadir animaciones CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .temp-message {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// Auto-refresh cada 30 segundos (opcional)
setInterval(loadStats, 30000);

// Función para crear el efecto de pétalos cayendo (compartida con script.js)
function initPetalsEffect() {
    const container = document.getElementById('petalsContainer');
    const petalColors = ['light-blue', 'yellow', 'beige', 'cream'];
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = `petal ${petalColors[Math.floor(Math.random() * petalColors.length)]}`;
        
        // Tamaño aleatorio entre 8px y 20px
        const size = Math.random() * 12 + 8;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        
        // Posición horizontal aleatoria
        petal.style.left = `${Math.random() * 100}%`;
        
        // Duración de caída aleatoria entre 8 y 15 segundos
        const duration = Math.random() * 7 + 8;
        petal.style.animationDuration = `${duration}s`;
        
        // Delay aleatorio para que no caigan todos a la vez
        petal.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(petal);
        
        // Remover el pétalo cuando termine la animación
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, (duration + 2) * 1000);
    }
    
    // Crear pétalos cada 400ms (un poco menos frecuente en admin)
    setInterval(createPetal, 400);
    
    // Crear algunos pétalos iniciales inmediatamente
    for (let i = 0; i < 3; i++) {
        setTimeout(createPetal, i * 150);
    }
}

// Funciones para el modal de exportación
function showExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}