document.addEventListener('DOMContentLoaded', function() {
    // Inicializar efecto de pétalos
    initPetalsEffect();
    
    const form = document.getElementById('confirmationForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        
        // Recoger acompañantes predefinidos seleccionados
        const predefinedCompanions = [];
        document.querySelectorAll('input[name="predefined_companion"]:checked').forEach(checkbox => {
            predefinedCompanions.push(checkbox.value);
        });
        
        // Recopilar acompañantes adicionales
        const numAcompanantes = parseInt(formData.get('num_acompanantes')) || 0;
        const additionalCompanions = [];
        for (let i = 1; i <= numAcompanantes; i++) {
            const nombre = formData.get(`acompanante_${i}`);
            if (nombre && nombre.trim()) {
                additionalCompanions.push(nombre.trim());
            }
        }
        
        // Combinar ambos tipos de acompañantes
        const allCompanions = [...predefinedCompanions, ...additionalCompanions];
        
        const data = {
            nombre: formData.get('nombre'),
            apellidos: formData.get('apellidos'),
            num_acompanantes: allCompanions.length,
            acompanantes: allCompanions,
            menu: formData.get('menu'),
            autobus: formData.get('autobus') === 'on'
        };

        // Validación básica
        if (!data.nombre || !data.apellidos || !data.menu) {
            showMessage('Por favor, selecciona un menú.', 'error');
            return;
        }
        
        // Validar que si hay acompañantes adicionales seleccionados, todos tengan nombre
        if (numAcompanantes > 0 && additionalCompanions.length !== numAcompanantes) {
            showMessage('Por favor, completa los nombres de todos los acompañantes adicionales.', 'error');
            return;
        }

        // Mostrar estado de carga
        setLoadingState(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Mostrar modal de confirmación
                showConfirmationModal();
                form.reset();
            } else {
                showMessage(result.error || 'Error al registrar. Inténtalo de nuevo.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Por favor, verifica tu conexión a internet.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Scroll al mensaje
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Ocultar mensaje después de 5 segundos si es de éxito
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    // Validación en tiempo real
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--success-color)';
            }
        });

        field.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = 'var(--success-color)';
            }
        });
    });

    // Animación de entrada para el formulario
    form.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        form.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
    }, 300);
});

// Función para crear el efecto de confeti cayendo
function initPetalsEffect() {
    const container = document.getElementById('petalsContainer');
    const shapes = ['circle', 'diamond', 'heart', 'leaf'];
    const colors = [
        'rgba(233, 30, 99, 0.6)',   // Rosa principal
        'rgba(255, 105, 180, 0.6)',  // Rosa claro
        'rgba(199, 21, 133, 0.6)',   // Rosa oscuro
        'rgba(255, 182, 193, 0.6)',  // Rosa pastel
        'rgba(255, 20, 147, 0.6)'    // Rosa intenso
    ];
    
    function createPetal() {
        const petal = document.createElement('div');
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        petal.className = `petal ${randomShape}`;
        petal.style.backgroundColor = randomColor;
        
        const size = Math.random() * 8 + 6;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 6 + 6;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(petal);
        
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, (duration + 3) * 1000);
    }
    
    setInterval(createPetal, 250);
    
    for (let i = 0; i < 8; i++) {
        setTimeout(createPetal, i * 80);
    }
}

// Funciones para el modal de confirmación
function showConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'flex';
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 27) {
            closeModal();
        }
    });
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
    
    // Opcional: redirigir a la página principal después de cerrar
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}