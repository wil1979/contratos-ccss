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

// URL de la API REAL de Hacienda de Costa Rica
const HACIENDA_API_URL = 'https://api.hacienda.go.cr/fe/ae';

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
    document.getElementById('addExperienceBtn').addEventListener('click', addExperienceItem);
    document.getElementById('addReferenceBtn').addEventListener('click', addReferenceItem);
    document.getElementById('uploadPhotoBtn').addEventListener('click', function() {
        document.getElementById('foto').click();
    });
    document.getElementById('validateCedulaBtn').addEventListener('click', validateCedulaWithHacienda);

    // Botones de upload de documentos
    document.querySelectorAll('.upload-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            document.getElementById(targetId).click();
        });
    });

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

    // Documentos adjuntos
    document.getElementById('docCedula').addEventListener('change', function(e) {
        handleDocumentUpload(e, 'cedula', 'docCedulaInfo', 'docCedulaLabel');
    });
    document.getElementById('docDiplomas').addEventListener('change', function(e) {
        handleDocumentUpload(e, 'diplomas', 'docDiplomasInfo', 'docDiplomasLabel', true);
    });
    document.getElementById('docRecomendaciones').addEventListener('change', function(e) {
        handleDocumentUpload(e, 'recomendaciones', 'docRecomendacionesInfo', 'docRecomendacionesLabel', true);
    });
    document.getElementById('docOtros').addEventListener('change', function(e) {
        handleDocumentUpload(e, 'otros', 'docOtrosInfo', 'docOtrosLabel', true);
    });

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
        if (e.target.classList.contains('skill-remove') || 
            e.target.closest('.skill-remove')) {
            const button = e.target.classList.contains('skill-remove') ? 
                e.target : e.target.closest('.skill-remove');
            removeSkillInput(button);
        }
        
        if (e.target.classList.contains('suggestion-btn')) {
            addSuggestedSkill(e.target.textContent);
        }
        
        if (e.target.classList.contains('exp-remove') || 
            e.target.closest('.exp-remove')) {
            const button = e.target.classList.contains('exp-remove') ? 
                e.target : e.target.closest('.exp-remove');
            removeExperienceItem(button);
        }
        
        if (e.target.classList.contains('ref-remove') || 
            e.target.closest('.ref-remove')) {
            const button = e.target.classList.contains('ref-remove') ? 
                e.target : e.target.closest('.ref-remove');
            removeReferenceItem(button);
        }
    });

    // Event delegation for experience and reference inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('exp-empresa') || 
            e.target.classList.contains('exp-cargo') ||
            e.target.classList.contains('exp-inicio') ||
            e.target.classList.contains('exp-fin') ||
            e.target.classList.contains('exp-responsabilidades') ||
            e.target.classList.contains('ref-nombre') ||
            e.target.classList.contains('ref-cargo') ||
            e.target.classList.contains('ref-empresa') ||
            e.target.classList.contains('ref-telefono') ||
            e.target.classList.contains('ref-email')) {
            updateCVPreview();
        }
    });
}

// ===============================
// ✅ Consultar nombre en API de Hacienda (solo cédulas físicas de 9 dígitos)
// ===============================
async function validateCedulaWithHacienda() {
    const cedulaInput = document.getElementById('cedula');
    const nombreInput = document.getElementById('nombre');
    const messageDiv = document.getElementById('cedulaMessage');
    
    // Limpiar cédula: eliminar todo lo que no sea dígito
    const cedula = cedulaInput.value.trim().replace(/\D/g, "");
    
    // Validar longitud (solo 9 dígitos para cédulas físicas)
    if (cedula.length !== 9) {
        if (cedula.length > 0) {
            messageDiv.textContent = "ℹ️ Solo cédulas físicas (9 dígitos) se consultan en Hacienda";
            messageDiv.className = 'validation-message error';
            messageDiv.style.display = 'block';
        }
        return;
    }

    // Llamar a la API de Hacienda
    const res = await fetch(`${HACIENDA_API_URL}?identificacion=${cedula}`);
    
    if (!res.ok) {
        throw new Error("No encontrado en Hacienda");
    }
    
    const data = await res.json();
    const nombre = data.nombre || data.nombre_completo || data.datos?.nombre || data.response?.nombre;
    
    if (nombre) {
        nombreInput.value = nombre;
        messageDiv.textContent = `✅ ${nombre}`;
        messageDiv.className = 'validation-message success';
    }
}

// Validar formato de cédula costarricense (simplificado)
function validateCostaRicanCedula(cedula) {
    const cedulaLimpia = cedula.replace(/\D/g, '');

    if (cedulaLimpia.length !== 9) return false;

    const primerDigito = parseInt(cedulaLimpia[0], 10);

    // Personas físicas en Costa Rica: 1–7
    return primerDigito >= 1 && primerDigito <= 7;
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
        
        // Restaurar experiencia laboral
        if (data.experiencia && data.experiencia.length > 0) {
            const expContainer = document.getElementById('experienceContainer');
            expContainer.innerHTML = '';
            data.experiencia.forEach(exp => {
                addExperienceItem(exp);
            });
        } else {
            // Asegurar al menos un item vacío
            if (document.querySelectorAll('.experience-item').length === 0) {
                addExperienceItem();
            }
        }
        
        // Restaurar referencias
        if (data.referencias && data.referencias.length > 0) {
            const refContainer = document.getElementById('referencesContainer');
            refContainer.innerHTML = '';
            data.referencias.forEach(ref => {
                addReferenceItem(ref);
            });
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
        // Inicializar con un item de experiencia y referencia vacíos
        if (document.querySelectorAll('.experience-item').length === 0) {
            addExperienceItem();
        }
        if (document.querySelectorAll('.reference-item').length === 0) {
            addReferenceItem();
        }
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

// Limpiar todos los datos
function clearAllData() {
    if (confirm('¿Está seguro de que desea limpiar todos los datos?')) {
        document.querySelectorAll('input:not([type="file"]), select, textarea').forEach(input => {
            input.value = '';
        });
        
        // Limpiar mensaje de validación
        document.getElementById('cedulaMessage').style.display = 'none';
        
        // Limpiar habilidades
        document.getElementById('skillsContainer').innerHTML = '';
        addSkillInput();
        
        // Limpiar experiencia
        document.getElementById('experienceContainer').innerHTML = '';
        addExperienceItem();
        
        // Limpiar referencias
        document.getElementById('referencesContainer').innerHTML = '';
        addReferenceItem();
        
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

// Manejar subida de documentos
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
    // Actualizar todos los previews de documentos
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
    updateCVPreview();
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

// Agregar item de experiencia laboral
function addExperienceItem(expData = null) {
    const container = document.getElementById('experienceContainer');
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

// Remover item de experiencia
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

// Obtener datos de experiencia
function getExperienceData() {
    const experiences = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        const empresa = item.querySelector('.exp-empresa').value.trim();
        const cargo = item.querySelector('.exp-cargo').value.trim();
        
        if (empresa || cargo) {
            experiences.push({
                empresa: empresa,
                cargo: cargo,
                inicio: item.querySelector('.exp-inicio').value.trim(),
                fin: item.querySelector('.exp-fin').value.trim(),
                responsabilidades: item.querySelector('.exp-responsabilidades').value.trim()
            });
        }
    });
    return experiences;
}

// Agregar item de referencia
function addReferenceItem(refData = null) {
    const container = document.getElementById('referencesContainer');
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

// Remover item de referencia
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

// Obtener datos de referencias
function getReferencesData() {
    const references = [];
    document.querySelectorAll('.reference-item').forEach(item => {
        const nombre = item.querySelector('.ref-nombre').value.trim();
        
        if (nombre) {
            references.push({
                nombre: nombre,
                cargo: item.querySelector('.ref-cargo').value.trim(),
                empresa: item.querySelector('.ref-empresa').value.trim(),
                telefono: item.querySelector('.ref-telefono').value.trim(),
                email: item.querySelector('.ref-email').value.trim(),
                relacion: item.querySelector('.ref-relacion').value
            });
        }
    });
    return references;
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
    
    // Experiencia laboral
    const experiencia = getExperienceData();
    
    // Referencias
    const referencias = getReferencesData();
    
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
    
    // Actualizar experiencia laboral
    const expList = document.getElementById('cvExperience');
    expList.innerHTML = '';
    
    if (experiencia.length > 0) {
        experiencia.forEach(exp => {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-item';
            
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
    
    // Actualizar referencias
    const refList = document.getElementById('cvReferences');
    refList.innerHTML = '';
    
    if (referencias.length > 0) {
        referencias.forEach(ref => {
            const refDiv = document.createElement('div');
            refDiv.className = 'reference-item';
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
    const experienceItems = document.querySelectorAll('.experience-item');
    const referenceItems = document.querySelectorAll('.reference-item');
    
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
    
    experienceItems.forEach(item => {
        item.style.borderColor = selectedColor;
    });
    
    referenceItems.forEach(item => {
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
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Importar html2pdf desde CDN
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', function() {
        html2pdf().set(opt).from(element).save().then(() => {
            showToast('PDF generado exitosamente');
        });
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