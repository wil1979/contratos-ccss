// =====================================
// CV BUILDER PRO - Script Completo
// Versión: 2.0
// =====================================

// Variables globales
let selectedColor = '#FFD700';
let selectedTemplate = 'classic';
let fotoURL = null;
let documents = {
    cedula: null,
    diplomas: [],
    recomendaciones: [],
    otros: []
};

// Array de habilidades sugeridas
const suggestedSkills = [

"Comunicación Efectiva",
    "Trabajo en Equipo",
    "Liderazgo",
    "Resolución de Problemas",
    "Pensamiento Crítico",
    "Adaptabilidad",
    "Gestión del Tiempo",
    "Organización",
    "Creatividad",
    "Iniciativa",
    "Responsabilidad",
    "Empatía",
    "Negociación",
    "Toma de Decisiones",
    "Paciencia",
    "Persistencia",
    "Autoconfianza",
    "Motivación",
    "Integridad",
    "Honestidad",
    "Flexibilidad",
    "Proactividad",
    "Atención al Detalle",
    "Capacidad de Aprendizaje",
    "Gestión del Estrés",
    "Colaboración",
    "Escucha Activa",
    "Persuasión",
    "Resiliencia",
    "Innovación"
    ];
/*const suggestedSkills = [
    'JavaScript', 'HTML5', 'CSS3', 'React', 'Node.js', 'Python', 'Java',
    'TypeScript', 'PHP', 'Ruby', 'C#', 'C++', 'SQL', 'MongoDB', 'PostgreSQL',
    'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
    'REST APIs', 'GraphQL', 'Express.js', 'Vue.js', 'Angular', 'Laravel',
    'WordPress', 'Firebase', 'Linux', 'Bash', 'CI/CD', 'Jenkins',
    'Terraform', 'Ansible', 'Machine Learning', 'Inteligencia Artificial',
    'Diseño gráfico', 'Photoshop', 'Illustrator', 'Figma', 'Adobe XD',
    'UI/UX Design', 'Responsive Design', 'Branding', 'Motion Graphics',
    'Comunicación', 'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas',
    'Gestión de tiempo', 'Atención al cliente', 'Ventas', 'Marketing digital',
    'Excel avanzado', 'PowerPoint', 'Word', 'Google Workspace', 'Office 365',
    'Gestión de proyectos', 'Planificación estratégica', 'Negociación',
    'Presentaciones', 'Redacción', 'Copywriting', 'SEO', 'SEM',
    'Google Analytics', 'Social Media', 'Content Marketing', 'Email Marketing',
    'Análisis de datos', 'Data Science', 'Business Intelligence', 'Power BI',
    'Tableau', 'R', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'Contabilidad', 'Finanzas', 'Presupuestos', 'Financial Analysis',
    'Recursos humanos', 'Reclutamiento', 'Capacitación', 'Training',
    'Inglés avanzado', 'Inglés intermedio', 'Francés', 'Alemán', 'Italiano',
    'Portugués', 'Chino mandarín', 'Japonés', 'Customer Service',
    'Team Management', 'Budgeting', 'Quality Assurance', 'Testing',
    'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Asana',
    'Public Speaking', 'Training', 'Mentoring', 'Strategic Planning',
    'Business Development', 'Supply Chain', 'Logistics', 'Inventory Management',
    'Healthcare', 'Patient Care', 'Education', 'Teaching', 'Legal',
    'Compliance', 'Contract Management', 'Real Estate', 'Hospitality',
    'Tourism', 'Event Planning', 'Agriculture', 'Sustainability',
    'Manufacturing', 'Quality Control', 'Lean', 'Retail', 'Merchandising'
];*/

// URL de la API REAL de Hacienda de Costa Rica (SIN espacios)
const HACIENDA_API_URL = 'https://api.hacienda.go.cr/fe/ae';

// Proxy CORS para desarrollo (usa en producción tu propio backend)
const CORS_PROXY = 'https://corsproxy.io/?';

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM completamente cargado');
    console.log('🔍 Buscando elemento exportBtn:', document.getElementById('exportBtn'));
    
    initializeEventListeners();
    loadSavedData();
    populateSkillSuggestions();
    updateCVPreview();
    loadDataFromURL();
});

// =====================================
// INICIALIZACIÓN Y EVENT LISTENERS
// =====================================

function initializeEventListeners() {
    // Botones principales - con verificación de existencia
    const exportBtn = document.getElementById('exportBtn');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    const addReferenceBtn = document.getElementById('addReferenceBtn');
    const addEducationBtn = document.getElementById('addEducationBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const validateCedulaBtn = document.getElementById('validateCedulaBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');

    if (exportBtn) exportBtn.addEventListener('click', exportToPDF);
    else console.warn('⚠️ Elemento #exportBtn no encontrado');

    if (saveBtn) saveBtn.addEventListener('click', saveData);
    else console.warn('⚠️ Elemento #saveBtn no encontrado');

    if (clearBtn) clearBtn.addEventListener('click', clearAllData);
    else console.warn('⚠️ Elemento #clearBtn no encontrado');

    if (addSkillBtn) addSkillBtn.addEventListener('click', addSkillInput);
    else console.warn('⚠️ Elemento #addSkillBtn no encontrado');

    if (addExperienceBtn) addExperienceBtn.addEventListener('click', addExperienceItem);
    else console.warn('⚠️ Elemento #addExperienceBtn no encontrado');

    if (addReferenceBtn) addReferenceBtn.addEventListener('click', addReferenceItem);
    else console.warn('⚠️ Elemento #addReferenceBtn no encontrado');

    if (addEducationBtn) addEducationBtn.addEventListener('click', addEducationItem);
    else console.warn('⚠️ Elemento #addEducationBtn no encontrado');

    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', function() {
            const fotoInput = document.getElementById('foto');
            if (fotoInput) fotoInput.click();
        });
    } else console.warn('⚠️ Elemento #uploadPhotoBtn no encontrado');

    if (validateCedulaBtn) validateCedulaBtn.addEventListener('click', validateCedulaWithHacienda);
    else console.warn('⚠️ Elemento #validateCedulaBtn no encontrado');

    if (exportDataBtn) exportDataBtn.addEventListener('click', exportData);
    else console.warn('⚠️ Elemento #exportDataBtn no encontrado');

    if (importDataBtn) importDataBtn.addEventListener('click', importData);
    else console.warn('⚠️ Elemento #importDataBtn no encontrado');

    if (importFileInput) importFileInput.addEventListener('change', handleImportFile);
    else console.warn('⚠️ Elemento #importFileInput no encontrado');

    // Botones de upload de documentos
    document.querySelectorAll('.upload-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput) targetInput.click();
        });
    });

    // Inputs del formulario
    const nombre = document.getElementById('nombre');
    const cedula = document.getElementById('cedula');
    const direccion = document.getElementById('direccion');
    const telefono = document.getElementById('telefono');
    const email = document.getElementById('email');
    const foto = document.getElementById('foto');
    const templateSelect = document.getElementById('templateSelect');

    if (nombre) nombre.addEventListener('input', updateCVPreview);
    if (cedula) cedula.addEventListener('input', updateCVPreview);
    if (direccion) direccion.addEventListener('input', updateCVPreview);
    if (telefono) telefono.addEventListener('input', updateCVPreview);
    if (email) email.addEventListener('input', updateCVPreview);
    if (foto) foto.addEventListener('change', handlePhotoUpload);
    if (templateSelect) templateSelect.addEventListener('change', changeTemplate);

    // Documentos adjuntos
    const docCedula = document.getElementById('docCedula');
    const docDiplomas = document.getElementById('docDiplomas');
    const docRecomendaciones = document.getElementById('docRecomendaciones');
    const docOtros = document.getElementById('docOtros');

    if (docCedula) {
        docCedula.addEventListener('change', function(e) {
            handleDocumentUpload(e, 'cedula', 'docCedulaInfo', 'docCedulaLabel');
        });
    }

    if (docDiplomas) {
        docDiplomas.addEventListener('change', function(e) {
            handleDocumentUpload(e, 'diplomas', 'docDiplomasInfo', 'docDiplomasLabel', true);
        });
    }

    if (docRecomendaciones) {
        docRecomendaciones.addEventListener('change', function(e) {
            handleDocumentUpload(e, 'recomendaciones', 'docRecomendacionesInfo', 'docRecomendacionesLabel', true);
        });
    }

    if (docOtros) {
        docOtros.addEventListener('change', function(e) {
            handleDocumentUpload(e, 'otros', 'docOtrosInfo', 'docOtrosLabel', true);
        });
    }

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
        // Eliminar habilidad
        if (e.target.classList.contains('skill-remove') || 
            e.target.closest('.skill-remove')) {
            const button = e.target.classList.contains('skill-remove') ? 
                e.target : e.target.closest('.skill-remove');
            removeSkillInput(button);
        }
        
        // Agregar habilidad sugerida
        if (e.target.classList.contains('suggestion-btn')) {
            addSuggestedSkill(e.target.textContent);
        }
        
        // Eliminar experiencia
        if (e.target.classList.contains('exp-remove') || 
            e.target.closest('.exp-remove')) {
            const button = e.target.classList.contains('exp-remove') ? 
                e.target : e.target.closest('.exp-remove');
            removeExperienceItem(button);
        }
        
        // Eliminar referencia
        if (e.target.classList.contains('ref-remove') || 
            e.target.closest('.ref-remove')) {
            const button = e.target.classList.contains('ref-remove') ? 
                e.target : e.target.closest('.ref-remove');
            removeReferenceItem(button);
        }
        
        // Eliminar educación
        if (e.target.classList.contains('edu-remove') || 
            e.target.closest('.edu-remove')) {
            const button = e.target.classList.contains('edu-remove') ? 
                e.target : e.target.closest('.edu-remove');
            removeEducationItem(button);
        }
    });

    // Event delegation for inputs
    document.addEventListener('input', function(e) {
        // Experiencia laboral
        if (e.target.classList.contains('exp-empresa') || 
            e.target.classList.contains('exp-cargo') ||
            e.target.classList.contains('exp-inicio') ||
            e.target.classList.contains('exp-fin') ||
            e.target.classList.contains('exp-responsabilidades')) {
            updateCVPreview();
        }
        
        // Referencias
        if (e.target.classList.contains('ref-nombre') ||
            e.target.classList.contains('ref-cargo') ||
            e.target.classList.contains('ref-empresa') ||
            e.target.classList.contains('ref-telefono') ||
            e.target.classList.contains('ref-email')) {
            updateCVPreview();
        }
        
        // Educación
        if (e.target.classList.contains('edu-tipo') || 
            e.target.classList.contains('edu-titulo') ||
            e.target.classList.contains('edu-institucion') ||
            e.target.classList.contains('edu-inicio') ||
            e.target.classList.contains('edu-fin') ||
            e.target.classList.contains('edu-detalle')) {
            updateCVPreview();
        }
    });
}

// =====================================
// API DE HACIENDA - VALIDACIÓN DE CÉDULA
// =====================================

async function validateCedulaWithHacienda() {
    const cedulaInput = document.getElementById('cedula');
    const nombreInput = document.getElementById('nombre');
    const messageDiv = document.getElementById('cedulaMessage');
    
    if (!cedulaInput || !nombreInput || !messageDiv) return;

    // Limpiar cédula: eliminar todo lo que no sea dígito
    const cedula = cedulaInput.value.trim().replace(/\D/g, "");
    
    // Limpiar mensaje anterior
    messageDiv.textContent = "";
    messageDiv.style.display = 'none';
    messageDiv.className = 'validation-message';

    // Validar longitud (solo 9 dígitos para cédulas físicas)
    if (cedula.length !== 9) {
        if (cedula.length > 0) {
            messageDiv.textContent = "ℹ️ Solo cédulas físicas (9 dígitos) se consultan en Hacienda";
            messageDiv.className = 'validation-message error';
            messageDiv.style.display = 'block';
        }
        return;
    }

    // Mostrar loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    messageDiv.textContent = "⏳ Buscando en Hacienda...";
    messageDiv.className = 'validation-message';
    messageDiv.style.display = 'block';

    try {
        // Construir URL con parámetro
        const apiUrl = `${HACIENDA_API_URL}?identificacion=${cedula}`;
        
        // Intentar primero SIN proxy (producción)
        let res;
        let usedProxy = false;
        
        try {
            res = await fetch(apiUrl);
            if (!res.ok) throw new Error('API no respondió');
        } catch (err) {
            // Si falla CORS, usar proxy
            console.warn('Intentando con proxy CORS...');
            res = await fetch(CORS_PROXY + encodeURIComponent(apiUrl));
            usedProxy = true;
        }
        
        const data = await res.json();
        
        // Obtener nombre de la respuesta
        const nombre = data.nombre || data.nombre_completo || data.datos?.nombre || data.response?.nombre || data.name;
        
        if (nombre) {
            nombreInput.value = nombre;
            messageDiv.textContent = `✅ ${nombre}`;
            messageDiv.className = 'validation-message success';
            messageDiv.style.display = 'block';
            updateCVPreview();
            showToast(`Datos obtenidos exitosamente ${usedProxy ? '(con proxy)' : ''}`);
        } else {
            messageDiv.textContent = "⚠️ Cédula válida, pero no se encontró el nombre";
            messageDiv.className = 'validation-message error';
            messageDiv.style.display = 'block';
        }
    } catch (err) {
        console.error("Error al consultar Hacienda:", err);
        
        // Manejar diferentes tipos de errores
        if (err.message.includes('404') || err.message.includes('No encontrado')) {
            messageDiv.textContent = "❌ Cédula no encontrada en Hacienda";
        } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
            messageDiv.textContent = "❌ Formato de cédula incorrecto";
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            messageDiv.textContent = "❌ Error de conexión. Intente nuevamente.";
        } else {
            messageDiv.textContent = "⚠️ No se pudo contactar a Hacienda. Intente nuevamente.";
        }
        
        messageDiv.className = 'validation-message error';
        messageDiv.style.display = 'block';
        showToast('Error al conectar con Hacienda');
    } finally {
        // Ocultar loading
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }
}

// =====================================
// CARGAR Y GUARDAR DATOS
// =====================================

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
        
        // Restaurar educación
        if (data.education && data.education.length > 0) {
            const eduContainer = document.getElementById('educationContainer');
            if (eduContainer) {
                eduContainer.innerHTML = '';
                data.education.forEach(edu => {
                    addEducationItem(edu);
                });
            }
        } else {
            // Asegurar al menos un item vacío
            if (document.querySelectorAll('.education-item').length === 0) {
                addEducationItem();
            }
        }
        
        // Restaurar habilidades
        if (data.skills && data.skills.length > 0) {
            const skillsContainer = document.getElementById('skillsContainer');
            if (skillsContainer) {
                skillsContainer.innerHTML = '';
                data.skills.forEach(skill => {
                    addSkillInput(skill);
                });
            }
        }
        
        // Restaurar experiencia laboral
        if (data.experiencia && data.experiencia.length > 0) {
            const expContainer = document.getElementById('experienceContainer');
            if (expContainer) {
                expContainer.innerHTML = '';
                data.experiencia.forEach(exp => {
                    addExperienceItem(exp);
                });
            }
        } else {
            // Asegurar al menos un item vacío
            if (document.querySelectorAll('.experience-item').length === 0) {
                addExperienceItem();
            }
        }
        
        // Restaurar referencias
        if (data.referencias && data.referencias.length > 0) {
            const refContainer = document.getElementById('referencesContainer');
            if (refContainer) {
                refContainer.innerHTML = '';
                data.referencias.forEach(ref => {
                    addReferenceItem(ref);
                });
            }
        } else {
            // Asegurar al menos un item vacío
            if (document.querySelectorAll('.reference-item').length === 0) {
                addReferenceItem();
            }
        }
        
        // Restaurar foto
        if (data.fotoURL) {
            fotoURL = data.fotoURL;
            updatePhotoPreview(fotoURL);
        }
        
        // Restaurar documentos
        if (data.documents) {
            documents = data.documents;
            updateDocumentPreviews();
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
    } else {
        // Inicializar con items vacíos
        if (document.querySelectorAll('.education-item').length === 0) {
            addEducationItem();
        }
        if (document.querySelectorAll('.experience-item').length === 0) {
            addExperienceItem();
        }
        if (document.querySelectorAll('.reference-item').length === 0) {
            addReferenceItem();
        }
        if (document.querySelectorAll('.skill-input-group').length === 0) {
            addSkillInput();
        }
    }
}

function saveData() {
    const data = {
        nombre: document.getElementById('nombre').value,
        cedula: document.getElementById('cedula').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        education: getEducationData(),
        skills: getSkillsFromInputs(),
        experiencia: getExperienceData(),
        referencias: getReferencesData(),
        fotoURL: fotoURL,
        documents: documents,
        selectedColor: selectedColor,
        selectedTemplate: selectedTemplate
    };
    
    localStorage.setItem('cvData', JSON.stringify(data));
    showToast('Datos guardados exitosamente');
}

// =====================================
// LIMPIAR DATOS
// =====================================

function clearAllData() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos?')) {
        clearAllDataWithoutConfirm();
        updateCVPreview();
        showToast('Todos los datos han sido limpiados');
    }
}

function clearAllDataWithoutConfirm() {
    document.querySelectorAll('input:not([type="file"]), select, textarea').forEach(input => {
        input.value = '';
    });
    
    // Limpiar mensaje de validación
    const cedulaMessage = document.getElementById('cedulaMessage');
    if (cedulaMessage) {
        cedulaMessage.style.display = 'none';
    }
    
    // Limpiar contenedores
    const skillsContainer = document.getElementById('skillsContainer');
    const expContainer = document.getElementById('experienceContainer');
    const refContainer = document.getElementById('referencesContainer');
    const eduContainer = document.getElementById('educationContainer');
    
    if (skillsContainer) skillsContainer.innerHTML = '';
    if (expContainer) expContainer.innerHTML = '';
    if (refContainer) refContainer.innerHTML = '';
    if (eduContainer) eduContainer.innerHTML = '';
    
    // Agregar items vacíos
    addSkillInput();
    addExperienceItem();
    addReferenceItem();
    addEducationItem();
    
    // Limpiar documentos
    documents = {
        cedula: null,
        diplomas: [],
        recomendaciones: [],
        otros: []
    };
    updateDocumentPreviews();
    
    // Limpiar foto
    fotoURL = null;
    const fotoPreview = document.getElementById('fotoPreview');
    if (fotoPreview) {
        fotoPreview.innerHTML = `
            <i class="fas fa-camera"></i>
        `;
    }
    
    localStorage.removeItem('cvData');
}

// =====================================
// FOTO DE PERFIL
// =====================================

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
    if (preview) {
        preview.innerHTML = `<img src="${url}" alt="Foto de perfil" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }
}

// =====================================
// DOCUMENTOS ADJUNTOS
// =====================================

function handleDocumentUpload(e, docType, infoId, labelId, isMultiple = false) {
    const files = e.target.files;
    const infoDiv = document.getElementById(infoId);
    const labelSpan = document.getElementById(labelId);
    
    if (files.length > 0) {
        if (isMultiple) {
            documents[docType] = [];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    documents[docType].push({
                        name: file.name,
                        url: event.target.result,
                        type: file.type,
                        size: file.size
                    });
                    updateDocumentInfo(docType, infoId, labelId);
                };
                reader.readAsDataURL(file);
            });
        } else {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                documents[docType] = {
                    name: file.name,
                    url: event.target.result,
                    type: file.type,
                    size: file.size
                };
                updateDocumentInfo(docType, infoId, labelId);
                showToast(`Documento ${docType} cargado exitosamente`);
            };
            reader.readAsDataURL(file);
        }
    }
}

function updateDocumentInfo(docType, infoId, labelId) {
    const infoDiv = document.getElementById(infoId);
    const labelSpan = document.getElementById(labelId);
    
    if (!infoDiv || !labelSpan) return;
    
    if (Array.isArray(documents[docType]) && documents[docType].length > 0) {
        // Múltiples archivos
        const count = documents[docType].length;
        infoDiv.className = 'file-info has-file';
        infoDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> ${count} archivo${count > 1 ? 's' : ''} seleccionado${count > 1 ? 's' : ''}
            <br><small>${formatFileSize(documents[docType].reduce((sum, file) => sum + file.size, 0))}</small>
        `;
        labelSpan.textContent = `Cambiar Archivos (${count})`;
    } else if (documents[docType]) {
        // Un solo archivo
        infoDiv.className = 'file-info has-file';
        infoDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> ${documents[docType].name}
            <br><small>${formatFileSize(documents[docType].size)}</small>
        `;
        labelSpan.textContent = 'Cambiar Archivo';
    } else {
        // Sin archivo
        infoDiv.className = 'file-info';
        infoDiv.innerHTML = '';
        labelSpan.textContent = docType === 'cedula' ? 'Seleccionar Archivo' : 'Seleccionar Archivos';
    }
}

function updateDocumentPreviews() {
    updateDocumentInfo('cedula', 'docCedulaInfo', 'docCedulaLabel');
    updateDocumentInfo('diplomas', 'docDiplomasInfo', 'docDiplomasLabel');
    updateDocumentInfo('recomendaciones', 'docRecomendacionesInfo', 'docRecomendacionesLabel');
    updateDocumentInfo('otros', 'docOtrosInfo', 'docOtrosLabel');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// =====================================
// HABILIDADES
// =====================================

function getSkillsFromInputs() {
    const skills = [];
    document.querySelectorAll('.skill-input').forEach(input => {
        if (input.value.trim() !== '') {
            skills.push(input.value.trim());
        }
    });
    return skills;
}

function addSkillInput(skill = '') {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
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

function removeSkillInput(button) {
    const group = button.closest('.skill-input-group');
    if (document.querySelectorAll('.skill-input-group').length > 1) {
        group.remove();
    } else {
        group.querySelector('.skill-input').value = '';
    }
    updateCVPreview();
}

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

function populateSkillSuggestions() {
    const grid = document.getElementById('suggestionsGrid');
    
    if (!grid) {
        console.warn('⚠️ Elemento #suggestionsGrid no encontrado');
        return;
    }

    grid.innerHTML = '';
    
    suggestedSkills.forEach(skill => {
        const button = document.createElement('button');
        button.className = 'suggestion-btn';
        button.textContent = skill;
        button.title = `Agregar: ${skill}`;
        grid.appendChild(button);
    });
    
    console.log('✅ Sugerencias de habilidades cargadas:', suggestedSkills.length);
}

// =====================================
// EDUCACIÓN
// =====================================

function addEducationItem(eduData = null) {
    const container = document.getElementById('educationContainer');
    if (!container) {
        console.warn('⚠️ Elemento #educationContainer no encontrado');
        return;
    }
    
    const div = document.createElement('div');
    div.className = 'education-item';
    div.innerHTML = `
        <div class="form-group">
            <label><i class="fas fa-graduation-cap"></i> Tipo de Estudio</label>
            <select class="form-control edu-tipo">
                <option value="">Seleccione...</option>
                <option value="Bachillerato" ${eduData?.tipo === 'Bachillerato' ? 'selected' : ''}>Bachillerato</option>
                <option value="Universitario" ${eduData?.tipo === 'Universitario' ? 'selected' : ''}>Universitario</option>
                <option value="Técnico" ${eduData?.tipo === 'Técnico' ? 'selected' : ''}>Técnico</option>
                <option value="Curso" ${eduData?.tipo === 'Curso' ? 'selected' : ''}>Curso</option>
                <option value="Certificación" ${eduData?.tipo === 'Certificación' ? 'selected' : ''}>Certificación</option>
                <option value="Diplomado" ${eduData?.tipo === 'Diplomado' ? 'selected' : ''}>Diplomado</option>
                <option value="Maestría" ${eduData?.tipo === 'Maestría' ? 'selected' : ''}>Maestría</option>
                <option value="Doctorado" ${eduData?.tipo === 'Doctorado' ? 'selected' : ''}>Doctorado</option>
                <option value="Otro" ${eduData?.tipo === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
        </div>
        <div class="form-group">
            <label><i class="fas fa-book"></i> Título o Nombre</label>
            <input type="text" class="form-control edu-titulo" placeholder="Ej: Ingeniería en Sistemas, Curso de Marketing Digital" value="${eduData?.titulo || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-university"></i> Institución</label>
            <input type="text" class="form-control edu-institucion" placeholder="Nombre de la institución" value="${eduData?.institucion || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> Período</label>
            <div class="periodo-group">
                <input type="text" class="form-control edu-inicio" placeholder="Desde (Ej: 2018)" value="${eduData?.inicio || ''}">
                <span>a</span>
                <input type="text" class="form-control edu-fin" placeholder="Hasta (Ej: 2022 o Presente)" value="${eduData?.fin || ''}">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-trophy"></i> Logros o Detalles (Opcional)</label>
            <textarea class="form-control edu-detalle" rows="2" placeholder="Menciones honoríficas, proyectos destacados, etc.">${eduData?.detalle || ''}</textarea>
        </div>
        <button class="btn btn-sm btn-danger edu-remove">
            <i class="fas fa-trash"></i> Eliminar Estudio
        </button>
        <hr>
    `;
    container.appendChild(div);
    
    // Si es nuevo, hacer focus en el primer campo
    if (!eduData) {
        div.querySelector('.edu-titulo').focus();
    }
}

function removeEducationItem(button) {
    const item = button.closest('.education-item');
    const container = document.getElementById('educationContainer');
    
    if (!container || !item) return;
    
    if (container.querySelectorAll('.education-item').length > 1) {
        item.remove();
        updateCVPreview();
    } else {
        showToast('Debe mantener al menos un estudio');
    }
}

function getEducationData() {
    const education = [];
    const container = document.getElementById('educationContainer');
    
    if (!container) return education;
    
    // Buscar SOLO dentro del contenedor de educación del formulario
    container.querySelectorAll('.education-item').forEach(item => {
        const tipoEl = item.querySelector('.edu-tipo');
        const tituloEl = item.querySelector('.edu-titulo');
        
        if (!tipoEl || !tituloEl) return;
        
        const tipo = tipoEl.value.trim();
        const titulo = tituloEl.value.trim();
        
        if (titulo || tipo) {
            education.push({
                tipo: tipo,
                titulo: titulo,
                institucion: item.querySelector('.edu-institucion')?.value.trim() || '',
                inicio: item.querySelector('.edu-inicio')?.value.trim() || '',
                fin: item.querySelector('.edu-fin')?.value.trim() || '',
                detalle: item.querySelector('.edu-detalle')?.value.trim() || ''
            });
        }
    });
    return education;
}
// =====================================
// EXPERIENCIA LABORAL
// =====================================

function addExperienceItem(expData = null) {
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.innerHTML = `
        <div class="form-group">
            <label><i class="fas fa-building"></i> Empresa</label>
            <input type="text" class="form-control exp-empresa" placeholder="Nombre de la empresa" value="${expData?.empresa || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-user-tie"></i> Cargo</label>
            <input type="text" class="form-control exp-cargo" placeholder="Cargo o posición" value="${expData?.cargo || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> Período</label>
            <div class="periodo-group">
                <input type="text" class="form-control exp-inicio" placeholder="Desde (Ej: Ene 2020)" value="${expData?.inicio || ''}">
                <span>a</span>
                <input type="text" class="form-control exp-fin" placeholder="Hasta (Ej: Dic 2023)" value="${expData?.fin || ''}">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-tasks"></i> Responsabilidades</label>
            <textarea class="form-control exp-responsabilidades" rows="3" placeholder="Describa sus responsabilidades y logros">${expData?.responsabilidades || ''}</textarea>
        </div>
        <button class="btn btn-sm btn-danger exp-remove">
            <i class="fas fa-trash"></i> Eliminar Experiencia
        </button>
        <hr>
    `;
    container.appendChild(div);
}

function removeExperienceItem(button) {
    const item = button.closest('.experience-item');
    const container = document.getElementById('experienceContainer');
    
    if (container.querySelectorAll('.experience-item').length > 1) {
        item.remove();
        updateCVPreview();
    } else {
        showToast('Debe mantener al menos una experiencia laboral');
    }
}

function getExperienceData() {
    const experiences = [];
    const container = document.getElementById('experienceContainer');
    
    if (!container) return experiences;
    
    // Buscar SOLO dentro del contenedor del formulario
    container.querySelectorAll('.experience-item').forEach(item => {
        const empresaEl = item.querySelector('.exp-empresa');
        const cargoEl = item.querySelector('.exp-cargo');
        
        if (!empresaEl || !cargoEl) return;
        
        const empresa = empresaEl.value.trim();
        const cargo = cargoEl.value.trim();
        
        if (empresa || cargo) {
            experiences.push({
                empresa: empresa,
                cargo: cargo,
                inicio: item.querySelector('.exp-inicio')?.value.trim() || '',
                fin: item.querySelector('.exp-fin')?.value.trim() || '',
                responsabilidades: item.querySelector('.exp-responsabilidades')?.value.trim() || ''
            });
        }
    });
    return experiences;
}

// =====================================
// REFERENCIAS
// =====================================

function addReferenceItem(refData = null) {
    const container = document.getElementById('referencesContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'reference-item';
    div.innerHTML = `
        <div class="form-group">
            <label><i class="fas fa-user"></i> Nombre del Referente</label>
            <input type="text" class="form-control ref-nombre" placeholder="Nombre completo" value="${refData?.nombre || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-briefcase"></i> Cargo/Posición</label>
            <input type="text" class="form-control ref-cargo" placeholder="Cargo o relación" value="${refData?.cargo || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-building"></i> Empresa/Organización</label>
            <input type="text" class="form-control ref-empresa" placeholder="Empresa o institución" value="${refData?.empresa || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-phone"></i> Teléfono</label>
            <input type="tel" class="form-control ref-telefono" placeholder="Número de contacto" value="${refData?.telefono || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-envelope"></i> Correo Electrónico</label>
            <input type="email" class="form-control ref-email" placeholder="Correo electrónico" value="${refData?.email || ''}">
        </div>
        <div class="form-group">
            <label><i class="fas fa-comment"></i> Relación</label>
            <select class="form-control ref-relacion">
                <option value="">Seleccione la relación...</option>
                <option value="Jefe Directo" ${refData?.relacion === 'Jefe Directo' ? 'selected' : ''}>Jefe Directo</option>
                <option value="Supervisor" ${refData?.relacion === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
                <option value="Colega" ${refData?.relacion === 'Colega' ? 'selected' : ''}>Colega</option>
                <option value="Profesor" ${refData?.relacion === 'Profesor' ? 'selected' : ''}>Profesor</option>
                <option value="Cliente" ${refData?.relacion === 'Cliente' ? 'selected' : ''}>Cliente</option>
                <option value="Proveedor" ${refData?.relacion === 'Proveedor' ? 'selected' : ''}>Proveedor</option>
                <option value="Otro" ${refData?.relacion === 'Otro' ? 'selected' : ''}>Otro</option>
            </select>
        </div>
        <button class="btn btn-sm btn-danger ref-remove">
            <i class="fas fa-trash"></i> Eliminar Referencia
        </button>
        <hr>
    `;
    container.appendChild(div);
}

function removeReferenceItem(button) {
    const item = button.closest('.reference-item');
    const container = document.getElementById('referencesContainer');
    
    if (container.querySelectorAll('.reference-item').length > 1) {
        item.remove();
        updateCVPreview();
    } else {
        showToast('Debe mantener al menos una referencia');
    }
}

function getReferencesData() {
    const references = [];
    const container = document.getElementById('referencesContainer');
    
    if (!container) return references;
    
    // Buscar SOLO dentro del contenedor del formulario
    container.querySelectorAll('.reference-item').forEach(item => {
        const nombreEl = item.querySelector('.ref-nombre');
        
        if (!nombreEl) return;
        
        const nombre = nombreEl.value.trim();
        
        if (nombre) {
            references.push({
                nombre: nombre,
                cargo: item.querySelector('.ref-cargo')?.value.trim() || '',
                empresa: item.querySelector('.ref-empresa')?.value.trim() || '',
                telefono: item.querySelector('.ref-telefono')?.value.trim() || '',
                email: item.querySelector('.ref-email')?.value.trim() || '',
                relacion: item.querySelector('.ref-relacion')?.value || ''
            });
        }
    });
    return references;
}

// =====================================
// VISTA PREVIA DEL CV
// =====================================

function updateCVPreview() {
    const nombre = document.getElementById('nombre').value || 'Tu Nombre Completo';
    const cedula = document.getElementById('cedula').value || 'XXXXXXXX';
    const direccion = document.getElementById('direccion').value || 'Dirección';
    const telefono = document.getElementById('telefono').value || 'Teléfono';
    const email = document.getElementById('email').value || 'Correo';
    
    // Educación
    const education = getEducationData();
    
    // Habilidades
    const skills = getSkillsFromInputs();
    
    // Experiencia laboral
    const experiencia = getExperienceData();
    
    // Referencias
    const referencias = getReferencesData();
    
    // Actualizar CV
    const cvName = document.getElementById('cvName');
    const cvCedula = document.getElementById('cvCedula');
    const cvDireccion = document.getElementById('cvDireccion');
    const cvTelefono = document.getElementById('cvTelefono');
    const cvEmail = document.getElementById('cvEmail');
    
    if (cvName) cvName.textContent = nombre;
    if (cvCedula) cvCedula.textContent = cedula;
    if (cvDireccion) cvDireccion.textContent = direccion;
    if (cvTelefono) cvTelefono.textContent = telefono;
    if (cvEmail) cvEmail.textContent = email;
    
    // Actualizar educación
    const educationList = document.getElementById('cvEducation');
    if (educationList) {
        educationList.innerHTML = '';
        
        if (education.length > 0) {
            education.forEach(edu => {
                const eduDiv = document.createElement('div');
                eduDiv.className = 'cv-education-item';
                
                // Icono según tipo
                let icon = '🎓';
                if (edu.tipo === 'Curso') icon = '📚';
                else if (edu.tipo === 'Certificación') icon = '🏆';
                else if (edu.tipo === 'Técnico') icon = '🔧';
                else if (edu.tipo === 'Maestría') icon = '🎓';
                else if (edu.tipo === 'Doctorado') icon = '🎓';
                
                // Construir HTML
                let html = `
                    <div class="edu-header">
                        <span class="edu-icon">${icon}</span>
                        <div class="edu-content">
                            <div class="edu-title">${edu.titulo || 'Título no especificado'}</div>
                            <div class="edu-institution">${edu.institucion || 'Institución no especificada'}</div>
                            <div class="edu-period">
                                ${edu.inicio || ''}${edu.inicio && edu.fin ? ' - ' : ''}${edu.fin || ''}
                                ${edu.tipo ? `<span class="edu-type">${edu.tipo}</span>` : ''}
                            </div>
                `;
                
                // Agregar detalles si existen
                if (edu.detalle) {
                    html += `<div class="edu-detail">${edu.detalle}</div>`;
                }
                
                html += `</div></div>`;
                eduDiv.innerHTML = html;
                educationList.appendChild(eduDiv);
            });
        } else {
            educationList.innerHTML = '<p class="no-data">Sin estudios registrados</p>';
        }
    }
    
    // Actualizar habilidades
    const skillsList = document.getElementById('cvSkills');
    if (skillsList) {
        skillsList.innerHTML = '';
        
        if (skills.length > 0) {
            skills.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'skill-tag';
                span.textContent = skill;
                skillsList.appendChild(span);
            });
        } else {
            skillsList.innerHTML = '<span class="no-data">Sin habilidades registradas</span>';
        }
    }
    
    // Actualizar experiencia laboral
    const expList = document.getElementById('cvExperience');
    if (expList) {
        expList.innerHTML = '';
        
        if (experiencia.length > 0) {
            experiencia.forEach(exp => {
                const expDiv = document.createElement('div');
                expDiv.className = 'cv-experience-item'; // ← Clase diferente
                
                // Procesar responsabilidades como lista
                let responsibilitiesHTML = '';
                if (exp.responsabilidades) {
                    const responsibilities = exp.responsabilidades
                        .split('\n')
                        .filter(r => r.trim() !== '')
                        .map(r => `<li>${r.trim()}</li>`)
                        .join('');
                    responsibilitiesHTML = `<ul>${responsibilities}</ul>`;
                }
                
                expDiv.innerHTML = `
                    <div class="exp-title">${exp.cargo || 'Cargo'} - ${exp.empresa || 'Empresa'}</div>
                    <div class="exp-period">${exp.inicio || ''}${exp.inicio && exp.fin ? ' - ' : ''}${exp.fin || ''}</div>
                    <div class="exp-responsibilities">
                        ${responsibilitiesHTML || '<p class="no-data">Sin responsabilidades especificadas</p>'}
                    </div>
                `;
                expList.appendChild(expDiv);
            });
        } else {
            expList.innerHTML = '<p class="no-data">Sin experiencia laboral registrada</p>';
        }
    }
    
    // Actualizar referencias
    const refList = document.getElementById('cvReferences');
    if (refList) {
        refList.innerHTML = '';
        
        if (referencias.length > 0) {
            referencias.forEach(ref => {
                const refDiv = document.createElement('div');
                refDiv.className = 'cv-reference-item'; // ← Clase diferente
                refDiv.innerHTML = `
                    <div class="ref-name">${ref.nombre}</div>
                    <div class="ref-position">${ref.cargo || 'Cargo'} - ${ref.empresa || 'Empresa'}</div>
                    <div class="ref-contact">
                        ${ref.telefono ? `<span><i class="fas fa-phone"></i> ${ref.telefono}</span>` : ''}
                        ${ref.email ? `<span><i class="fas fa-envelope"></i> ${ref.email}</span>` : ''}
                    </div>
                `;
                refList.appendChild(refDiv);
            });
        } else {
            refList.innerHTML = '<p class="no-data">Sin referencias registradas</p>';
        }
    }
    
    // Actualizar foto
    const cvPhoto = document.getElementById('cvPhoto');
    if (cvPhoto) {
        if (fotoURL) {
            cvPhoto.innerHTML = `<img src="${fotoURL}" alt="Foto">`;
        } else {
            cvPhoto.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    }
}

// =====================================
// TEMPLATES Y ESTILOS
// =====================================

function changeTemplate() {
    selectedTemplate = document.getElementById('templateSelect').value;
    const cvTemplate = document.getElementById('cvTemplate');
    
    if (cvTemplate) {
        // Remover todas las clases de template
        cvTemplate.className = 'cv-template';
        // Agregar la clase del template seleccionado
        cvTemplate.classList.add(selectedTemplate);
        
        updateCVStyling();
        showToast(`Template cambiado a ${selectedTemplate}`);
    }
}

function updateCVStyling() {
    const cvTemplate = document.getElementById('cvTemplate');
    const cvName = document.getElementById('cvName');
    const cvSections = document.querySelectorAll('.cv-section h3');
    const skillTags = document.querySelectorAll('.skill-tag');
    const educationItems = document.querySelectorAll('.cv-education-item');
    const experienceItems = document.querySelectorAll('.cv-experience-item'); // ← Clase diferente
    const referenceItems = document.querySelectorAll('.cv-reference-item'); // ← Clase diferente
    
    if (cvName) cvName.style.color = selectedColor;
    
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
    
    experienceItems.forEach(item => {
        item.style.borderColor = selectedColor;
    });
    
    referenceItems.forEach(item => {
        item.style.borderColor = selectedColor;
    });
}

// =====================================
// EXPORTAR A PDF
// =====================================

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
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Importar html2pdf desde CDN
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', function() {
        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save().then(() => {
                showToast('PDF generado exitosamente');
            });
        } else {
            showToast('Error: No se pudo cargar html2pdf');
        }
    });
}

function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = function() {
        console.error('Error al cargar script:', url);
    };
    document.head.appendChild(script);
}

// =====================================
// EXPORTAR/IMPORTAR DATOS COMPLETOS
// =====================================

function exportData() {
    try {
        // Obtener todos los datos
        const exportData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            personalInfo: {
                nombre: document.getElementById('nombre').value,
                cedula: document.getElementById('cedula').value,
                direccion: document.getElementById('direccion').value,
                telefono: document.getElementById('telefono').value,
                email: document.getElementById('email').value
            },
            education: getEducationData(),
            skills: getSkillsFromInputs(),
            experiencia: getExperienceData(),
            referencias: getReferencesData(),
            foto: fotoURL,
            documents: documents,
            config: {
                selectedColor: selectedColor,
                selectedTemplate: selectedTemplate
            }
        };

        // Preguntar si incluir documentos (pueden ser grandes)
        const includeDocuments = confirm(
            '¿Incluir documentos adjuntos en la exportación?\n\n' +
            '⚠️ Los documentos pueden hacer el archivo muy grande.\n' +
            'Selecciona "Cancelar" para exportar sin documentos.'
        );

        if (!includeDocuments) {
            delete exportData.documents;
            delete exportData.foto;
            showToast('Exportando sin documentos y foto...');
        }

        // Calcular tamaño aproximado
        const dataSize = new TextEncoder().encode(JSON.stringify(exportData)).length;
        const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);

        if (dataSizeMB > 10) {
            const proceed = confirm(
                `⚠️ El archivo será muy grande (${dataSizeMB} MB)\n\n` +
                `Esto puede causar problemas al importar.\n` +
                `¿Desea continuar?`
            );
            if (!proceed) {
                showToast('Exportación cancelada');
                return;
            }
        }

        // Descargar archivo
        downloadJSON(exportData, `cv_data_${new Date().getTime()}.json`);
        
        showToast(`✅ Datos exportados (${dataSizeMB} MB)`);
        
    } catch (error) {
        console.error('Error al exportar datos:', error);
        showToast('❌ Error al exportar datos');
    }
}

function importData() {
    document.getElementById('importFileInput').click();
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showToast('❌ Por favor seleccione un archivo JSON válido');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validar estructura
            if (!importedData.personalInfo) {
                throw new Error('Archivo no válido: estructura incorrecta');
            }

            if (confirm('⚠️ Esto reemplazará todos los datos actuales.\n\n¿Desea continuar?')) {
                // Limpiar datos actuales
                clearAllDataWithoutConfirm();
                
                // Restaurar datos personales
                if (importedData.personalInfo) {
                    document.getElementById('nombre').value = importedData.personalInfo.nombre || '';
                    document.getElementById('cedula').value = importedData.personalInfo.cedula || '';
                    document.getElementById('direccion').value = importedData.personalInfo.direccion || '';
                    document.getElementById('telefono').value = importedData.personalInfo.telefono || '';
                    document.getElementById('email').value = importedData.personalInfo.email || '';
                }

                // Restaurar educación
                if (importedData.education && importedData.education.length > 0) {
                    const eduContainer = document.getElementById('educationContainer');
                    if (eduContainer) {
                        eduContainer.innerHTML = '';
                        importedData.education.forEach(edu => {
                            addEducationItem(edu);
                        });
                    }
                }

                // Restaurar habilidades
                if (importedData.skills && importedData.skills.length > 0) {
                    const skillsContainer = document.getElementById('skillsContainer');
                    if (skillsContainer) {
                        skillsContainer.innerHTML = '';
                        importedData.skills.forEach(skill => {
                            addSkillInput(skill);
                        });
                    }
                }

                // Restaurar experiencia
                if (importedData.experiencia && importedData.experiencia.length > 0) {
                    const expContainer = document.getElementById('experienceContainer');
                    if (expContainer) {
                        expContainer.innerHTML = '';
                        importedData.experiencia.forEach(exp => {
                            addExperienceItem(exp);
                        });
                    }
                }

                // Restaurar referencias
                if (importedData.referencias && importedData.referencias.length > 0) {
                    const refContainer = document.getElementById('referencesContainer');
                    if (refContainer) {
                        refContainer.innerHTML = '';
                        importedData.referencias.forEach(ref => {
                            addReferenceItem(ref);
                        });
                    }
                }

                // Restaurar foto
                if (importedData.foto) {
                    fotoURL = importedData.foto;
                    updatePhotoPreview(fotoURL);
                }

                // Restaurar documentos
                if (importedData.documents) {
                    documents = importedData.documents;
                    updateDocumentPreviews();
                }

                // Restaurar configuración
                if (importedData.config) {
                    selectedColor = importedData.config.selectedColor || '#FFD700';
                    selectedTemplate = importedData.config.selectedTemplate || 'classic';
                    
                    // Actualizar UI
                    document.querySelectorAll('.color-option').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.color === selectedColor) {
                            btn.classList.add('active');
                        }
                    });
                    
                    const templateSelect = document.getElementById('templateSelect');
                    if (templateSelect) {
                        templateSelect.value = selectedTemplate;
                    }
                }

                // Actualizar preview y guardar
                updateCVPreview();
                updateCVStyling();
                saveData();
                
                showToast('✅ Datos importados exitosamente');
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            showToast('❌ Error al importar: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =====================================
// COMPARTIR Y CARGAR DESDE URL
// =====================================

function shareData() {
    const exportData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        personalInfo: {
            nombre: document.getElementById('nombre').value,
            cedula: document.getElementById('cedula').value
        },
        skills: getSkillsFromInputs(),
        experiencia: getExperienceData(),
        referencias: getReferencesData(),
        education: getEducationData()
    };

    const jsonStr = JSON.stringify(exportData);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    
    const shareUrl = `${window.location.href}?data=${encodeURIComponent(base64)}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('✅ Enlace copiado al portapapeles');
        
        // Mostrar diálogo de compartir
        const shareOptions = confirm(
            '🔗 Enlace de compartir generado\n\n' +
            '¿Desea abrir WhatsApp para compartir?'
        );
        
        if (shareOptions) {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                `¡Mira mi CV! ${shareUrl}`
            )}`;
            window.open(whatsappUrl, '_blank');
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
        showToast('❌ Error al copiar enlace');
    });
}

function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(dataParam)));
            const importedData = JSON.parse(jsonStr);
            
            if (confirm('¿Desea cargar los datos del enlace?')) {
                // Cargar datos básicos
                if (importedData.personalInfo) {
                    document.getElementById('nombre').value = importedData.personalInfo.nombre || '';
                    document.getElementById('cedula').value = importedData.personalInfo.cedula || '';
                }
                
                // Cargar educación
                if (importedData.education && importedData.education.length > 0) {
                    const eduContainer = document.getElementById('educationContainer');
                    if (eduContainer) {
                        eduContainer.innerHTML = '';
                        importedData.education.forEach(edu => {
                            addEducationItem(edu);
                        });
                    }
                }
                
                // Cargar habilidades
                if (importedData.skills && importedData.skills.length > 0) {
                    const skillsContainer = document.getElementById('skillsContainer');
                    if (skillsContainer) {
                        skillsContainer.innerHTML = '';
                        importedData.skills.forEach(skill => {
                            addSkillInput(skill);
                        });
                    }
                }
                
                // Cargar experiencia
                if (importedData.experiencia && importedData.experiencia.length > 0) {
                    const expContainer = document.getElementById('experienceContainer');
                    if (expContainer) {
                        expContainer.innerHTML = '';
                        importedData.experiencia.forEach(exp => {
                            addExperienceItem(exp);
                        });
                    }
                }
                
                // Cargar referencias
                if (importedData.referencias && importedData.referencias.length > 0) {
                    const refContainer = document.getElementById('referencesContainer');
                    if (refContainer) {
                        refContainer.innerHTML = '';
                        importedData.referencias.forEach(ref => {
                            addReferenceItem(ref);
                        });
                    }
                }
                
                updateCVPreview();
                showToast('✅ Datos cargados desde URL');
            }
            
            // Limpiar el parámetro de la URL
            history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error al cargar datos desde URL:', error);
        }
    }
}

// =====================================
// NOTIFICACIONES Y UTILIDADES
// =====================================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        console.log('Toast:', message);
    }
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