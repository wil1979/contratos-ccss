// Variables globales
let selectedColor = '#FFD700';
let selectedTemplate = 'classic';
let fotoURL = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSavedData();
    populateSkillSuggestions();
    updateCVPreview();
});

// Inicializar Event Listeners
function initializeEventListeners() {
    // Botones principales
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    document.getElementById('addSkillBtn').addEventListener('click', addSkillInput);

    // Inputs del formulario
    document.getElementById('nombre').addEventListener('input', updateCVPreview);
    document.getElementById('cedula').addEventListener('input', updateCVPreview);
    document.getElementById('direccion').addEventListener('input', updateCVPreview);
    document.getElementById('telefono').addEventListener('input', updateCVPreview);
    document.getElementById('email').addEventListener('input', updateCVPreview);
    document.getElementById('foto').addEventListener('change', handlePhotoUpload);
    document.getElementById('nivelEstudio').addEventListener('change', updateCVPreview);
    document.getElementById('institucion').addEventListener('input', updateCVPreview);
    document.getElementById('titulo').addEventListener('input', updateCVPreview);
    document.getElementById('anioGraduacion').addEventListener('input', updateCVPreview);
    document.getElementById('templateSelect').addEventListener('change', changeTemplate);

    // Color picker
    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', function() {
            selectedColor = this.dataset.color;
            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateCVStyling();
        });
    });

    // Event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('skill-remove')) {
            removeSkillInput(e.target);
        }
        if (e.target.classList.contains('suggestion-btn')) {
            addSuggestedSkill(e.target.textContent);
        }
    });
}

// Cargar datos guardados
function loadSavedData() {
    const savedData = localStorage.getItem('cvData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restaurar datos del formulario
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('cedula').value = data.cedula || '';
        document.getElementById('direccion').value = data.direccion || '';
        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('nivelEstudio').value = data.nivelEstudio || '';
        document.getElementById('institucion').value = data.institucion || '';
        document.getElementById('titulo').value = data.titulo || '';
        document.getElementById('anioGraduacion').value = data.anioGraduacion || '';
        
        // Restaurar habilidades
        if (data.skills && data.skills.length > 0) {
            const skillsContainer = document.getElementById('skillsContainer');
            skillsContainer.innerHTML = '';
            data.skills.forEach(skill => {
                addSkillInput(skill);
            });
        }
        
        // Restaurar foto
        if (data.fotoURL) {
            fotoURL = data.fotoURL;
            updatePhotoPreview(fotoURL);
        }
        
        // Restaurar color y template
        if (data.selectedColor) {
            selectedColor = data.selectedColor;
            document.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === selectedColor) {
                    btn.classList.add('active');
                }
            });
        }
        
        if (data.selectedTemplate) {
            selectedTemplate = data.selectedTemplate;
            document.getElementById('templateSelect').value = selectedTemplate;
        }
        
        updateCVPreview();
        updateCVStyling();
        
        showToast('Datos cargados exitosamente');
    }
}

// Guardar datos
function saveData() {
    const data = {
        nombre: document.getElementById('nombre').value,
        cedula: document.getElementById('cedula').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        nivelEstudio: document.getElementById('nivelEstudio').value,
        institucion: document.getElementById('institucion').value,
        titulo: document.getElementById('titulo').value,
        anioGraduacion: document.getElementById('anioGraduacion').value,
        skills: getSkillsFromInputs(),
        fotoURL: fotoURL,
        selectedColor: selectedColor,
        selectedTemplate: selectedTemplate
    };
    
    localStorage.setItem('cvData', JSON.stringify(data));
    showToast('Datos guardados exitosamente');
}

// Limpiar todos los datos
function clearAllData() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos?')) {
        document.querySelectorAll('input, select').forEach(input => {
            if (input.type !== 'file') {
                input.value = '';
            }
        });
        
        document.getElementById('skillsContainer').innerHTML = '';
        addSkillInput();
        
        fotoURL = null;
        document.getElementById('fotoPreview').innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span id="fotoText">Sin foto</span>
        `;
        
        localStorage.removeItem('cvData');
        updateCVPreview();
        showToast('Todos los datos han sido limpiados');
    }
}

// Manejar subida de foto
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            fotoURL = event.target.result;
            updatePhotoPreview(fotoURL);
            updateCVPreview();
            showToast('Foto cargada exitosamente');
        };
        reader.readAsDataURL(file);
    }
}

function updatePhotoPreview(url) {
    const preview = document.getElementById('fotoPreview');
    preview.innerHTML = `<img src="${url}" alt="Foto de perfil">`;
}

// Obtener habilidades de los inputs
function getSkillsFromInputs() {
    const skills = [];
    document.querySelectorAll('.skill-input').forEach(input => {
        if (input.value.trim() !== '') {
            skills.push(input.value.trim());
        }
    });
    return skills;
}

// Agregar input de habilidad
function addSkillInput(skill = '') {
    const container = document.getElementById('skillsContainer');
    const div = document.createElement('div');
    div.className = 'skill-input-group';
    div.innerHTML = `
        <input type="text" class="form-control skill-input" placeholder="Ingrese una habilidad" value="${skill}">
        <button class="btn btn-sm btn-danger skill-remove">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
    
    // Focus en el nuevo input
    div.querySelector('.skill-input').focus();
}

// Remover input de habilidad
function removeSkillInput(button) {
    const group = button.closest('.skill-input-group');
    if (document.querySelectorAll('.skill-input-group').length > 1) {
        group.remove();
    } else {
        group.querySelector('.skill-input').value = '';
    }
}

// Agregar habilidad sugerida
function addSuggestedSkill(skillName) {
    // Verificar si ya existe
    const existingSkills = getSkillsFromInputs();
    if (existingSkills.includes(skillName)) {
        showToast('Esta habilidad ya fue agregada');
        return;
    }
    
    // Agregar nueva habilidad
    addSkillInput(skillName);
    showToast(`Habilidad "${skillName}" agregada`);
}

// Poblar sugerencias de habilidades
function populateSkillSuggestions() {
    const grid = document.getElementById('suggestionsGrid');
    grid.innerHTML = '';
    
    suggestedSkills.forEach(skill => {
        const button = document.createElement('button');
        button.className = 'suggestion-btn';
        button.textContent = skill;
        grid.appendChild(button);
    });
}

// Actualizar vista previa del CV
function updateCVPreview() {
    const nombre = document.getElementById('nombre').value || 'Tu Nombre Completo';
    const cedula = document.getElementById('cedula').value || 'XXXXXXXX';
    const direccion = document.getElementById('direccion').value || 'Dirección';
    const telefono = document.getElementById('telefono').value || 'Teléfono';
    const email = document.getElementById('email').value || 'Correo';
    
    // Educación
    const titulo = document.getElementById('titulo').value || 'Título';
    const institucion = document.getElementById('institucion').value || 'Institución';
    const anio = document.getElementById('anioGraduacion').value || 'Año';
    
    // Habilidades
    const skills = getSkillsFromInputs();
    
    // Actualizar CV
    document.getElementById('cvName').textContent = nombre;
    document.getElementById('cvCedula').textContent = `Cédula: ${cedula}`;
    document.getElementById('cvDireccion').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${direccion}`;
    document.getElementById('cvTelefono').innerHTML = `<i class="fas fa-phone"></i> ${telefono}`;
    document.getElementById('cvEmail').innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
    
    document.getElementById('educationTitle').textContent = titulo;
    document.getElementById('educationInstitution').textContent = institucion;
    document.getElementById('educationYear').textContent = anio;
    
    // Actualizar habilidades
    const skillsList = document.getElementById('cvSkills');
    skillsList.innerHTML = '';
    skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'skill-tag';
        span.textContent = skill;
        skillsList.appendChild(span);
    });
    
    // Actualizar foto
    if (fotoURL) {
        document.getElementById('cvPhoto').innerHTML = `<img src="${fotoURL}" alt="Foto">`;
    } else {
        document.getElementById('cvPhoto').innerHTML = `<i class="fas fa-user-circle"></i>`;
    }
}

// Cambiar template
function changeTemplate() {
    selectedTemplate = document.getElementById('templateSelect').value;
    const cvTemplate = document.getElementById('cvTemplate');
    
    // Remover todas las clases de template
    cvTemplate.className = 'cv-template';
    // Agregar la clase del template seleccionado
    cvTemplate.classList.add(selectedTemplate);
    
    updateCVStyling();
    showToast(`Template cambiado a ${selectedTemplate}`);
}

// Actualizar estilos del CV
function updateCVStyling() {
    const cvTemplate = document.getElementById('cvTemplate');
    const cvName = document.getElementById('cvName');
    const cvSections = document.querySelectorAll('.cv-section h3');
    const skillTags = document.querySelectorAll('.skill-tag');
    const educationItems = document.querySelectorAll('.education-item');
    
    // Aplicar color seleccionado
    cvName.style.color = selectedColor;
    
    cvSections.forEach(section => {
        section.style.color = selectedColor;
        section.style.borderColor = selectedColor;
    });
    
    skillTags.forEach(tag => {
        tag.style.background = selectedColor;
    });
    
    educationItems.forEach(item => {
        item.style.borderColor = selectedColor;
    });
}

// Exportar a PDF
function exportToPDF() {
    // Verificar que los datos obligatorios estén completos
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const direccion = document.getElementById('direccion').value;
    
    if (!nombre || !cedula || !direccion) {
        showToast('Por favor complete los datos obligatorios (nombre, cédula y dirección)');
        return;
    }
    
    showToast('Generando PDF... Esto puede tomar unos segundos');
    
    // Usar html2pdf.js para generar el PDF
    const element = document.getElementById('cvTemplate');
    const opt = {
        margin: 10,
        filename: `CV_${nombre.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Importar html2pdf desde CDN
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', function() {
        html2pdf().set(opt).from(element).save();
        showToast('PDF generado exitosamente');
    });
}

// Cargar script dinámicamente
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Mostrar toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Prevenir cierre accidental con datos sin guardar
window.addEventListener('beforeunload', function(e) {
    const hasUnsavedChanges = document.getElementById('nombre').value !== '' || 
                              document.getElementById('cedula').value !== '' ||
                              document.getElementById('direccion').value !== '';
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});