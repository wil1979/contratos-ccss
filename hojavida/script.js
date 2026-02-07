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

// Lista de habilidades para el selector
const availableSkills = [
    "Trabajo en equipo", "Comunicación asertiva", "Liderazgo", "Resolución de problemas",
    "Adaptabilidad", "Pensamiento crítico", "Gestión del tiempo", "Creatividad",
    "Empatía", "Negociación", "Orientación al cliente", "Proactividad",
    "Toma de decisiones", "Resiliencia", "Ética profesional", "Capacidad analítica"
];

// URL de la API REAL de Hacienda de Costa Rica
const HACIENDA_API_URL = 'https://api.hacienda.go.cr/fe/ae';

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSavedData();
    renderSkillsSelector();
    updateCVPreview();
});

// Inicializar Event Listeners
function initializeEventListeners() {
    // Botones principales
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    document.getElementById('addExperienceBtn').addEventListener('click', () => addExperienceItem());
    document.getElementById('addReferenceBtn').addEventListener('click', () => addReferenceItem());
    document.getElementById('uploadPhotoBtn').addEventListener('click', () => document.getElementById('foto').click());
    document.getElementById('validateCedulaBtn').addEventListener('click', validateCedulaWithHacienda);

    // Botones de upload de documentos
    document.querySelectorAll('.upload-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            document.getElementById(targetId).click();
        });
    });

    // Inputs del formulario - Actualización en tiempo real
    const inputs = ['nombre', 'cedula', 'direccion', 'telefono', 'email', 'nivelEstudio', 'institucion', 'titulo', 'anioGraduacion'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateCVPreview);
    });

    document.getElementById('foto').addEventListener('change', handlePhotoUpload);
    document.getElementById('templateSelect').addEventListener('change', changeTemplate);

    // Documentos adjuntos
    document.getElementById('docCedula').addEventListener('change', (e) => handleDocumentUpload(e, 'cedula', 'docCedulaInfo', 'docCedulaLabel'));
    document.getElementById('docDiplomas').addEventListener('change', (e) => handleDocumentUpload(e, 'diplomas', 'docDiplomasInfo', 'docDiplomasLabel', true));
    document.getElementById('docRecomendaciones').addEventListener('change', (e) => handleDocumentUpload(e, 'recomendaciones', 'docRecomendacionesInfo', 'docRecomendacionesLabel', true));
    document.getElementById('docOtros').addEventListener('change', (e) => handleDocumentUpload(e, 'otros', 'docOtrosInfo', 'docOtrosLabel', true));

    // Color picker
    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', function() {
            selectedColor = this.dataset.color;
            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateCVStyling();
        });
    });

    // Event delegation para elementos dinámicos
    document.addEventListener('click', function(e) {
        if (e.target.closest('.exp-remove')) {
            removeExperienceItem(e.target.closest('.exp-remove'));
        }
        if (e.target.closest('.ref-remove')) {
            removeReferenceItem(e.target.closest('.ref-remove'));
        }
    });

    // Delegación para inputs dinámicos
    document.addEventListener('input', function(e) {
        if (e.target.matches('.exp-empresa, .exp-cargo, .exp-inicio, .exp-fin, .exp-responsabilidades, .ref-nombre, .ref-cargo, .ref-empresa, .ref-telefono, .ref-email')) {
            updateCVPreview();
        }
    });
}

// ===============================
// ✅ Selector de Habilidades (Desplegable con Checkbox)
// ===============================
function renderSkillsSelector() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="skills-dropdown">
            <button type="button" class="btn btn-secondary btn-block dropdown-toggle" id="skillsDropdownBtn">
                Seleccionar Habilidades <i class="fas fa-chevron-down"></i>
            </button>
            <div class="skills-dropdown-content" id="skillsDropdownContent" style="display:none; border: 1px solid #ccc; padding: 10px; max-height: 200px; overflow-y: auto; background: white; position: absolute; z-index: 100; width: 100%;">
                ${availableSkills.map(skill => `
                    <div class="skill-option" style="margin-bottom: 5px;">
                        <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal;">
                            <input type="checkbox" class="skill-checkbox" value="${skill}" style="margin-right: 10px;"> ${skill}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
        <div id="selectedSkillsBadges" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px;"></div>
    `;

    const btn = document.getElementById('skillsDropdownBtn');
    const content = document.getElementById('skillsDropdownContent');
    
    btn.onclick = () => {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };

    // Cerrar al hacer clic fuera
    window.onclick = (event) => {
        if (!event.target.matches('#skillsDropdownBtn') && !event.target.closest('.skills-dropdown-content')) {
            content.style.display = 'none';
        }
    };

    document.querySelectorAll('.skill-checkbox').forEach(cb => {
        cb.onchange = () => {
            updateSelectedSkillsBadges();
            updateCVPreview();
        };
    });
}

function updateSelectedSkillsBadges() {
    const badgesContainer = document.getElementById('selectedSkillsBadges');
    const selected = Array.from(document.querySelectorAll('.skill-checkbox:checked')).map(cb => cb.value);
    badgesContainer.innerHTML = selected.map(skill => `
        <span class="badge badge-info" style="background: #17a2b8; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8em;">
            ${skill}
        </span>
    `).join('');
}

function getSkillsFromInputs() {
    return Array.from(document.querySelectorAll('.skill-checkbox:checked')).map(cb => cb.value);
}

// ===============================
// ✅ API Hacienda
// ===============================
async function validateCedulaWithHacienda() {
    const cedulaInput = document.getElementById('cedula');
    const nombreInput = document.getElementById('nombre');
    const messageDiv = document.getElementById('cedulaMessage');
    const overlay = document.getElementById('loadingOverlay');
    
    const cedula = cedulaInput.value.trim().replace(/\D/g, "");
    
    if (cedula.length !== 9) {
        showToast("ℹ️ Solo cédulas físicas (9 dígitos)");
        return;
    }

    try {
        if (overlay) overlay.style.display = 'flex';
        const res = await fetch(`${HACIENDA_API_URL}?identificacion=${cedula}`);
        if (!res.ok) throw new Error("No encontrado");
        
        const data = await res.json();
        const nombre = data.nombre || data.nombre_completo;
        
        if (nombre) {
            nombreInput.value = nombre;
            messageDiv.textContent = `✅ ${nombre}`;
            messageDiv.className = 'validation-message success';
            updateCVPreview();
        }
    } catch (err) {
        showToast("No se pudo validar la cédula");
    } finally {
        if (overlay) overlay.style.display = 'none';
    }
}

// ===============================
// ✅ Manejo de Fotos y Documentos
// ===============================
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            fotoURL = event.target.result;
            updatePhotoPreview(fotoURL);
            updateCVPreview();
        };
        reader.readAsDataURL(file);
    }
}

function updatePhotoPreview(url) {
    const preview = document.getElementById('fotoPreview');
    if (preview) {
        preview.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
}

function handleDocumentUpload(e, type, infoId, labelId, multiple = false) {
    const files = e.target.files;
    const infoDiv = document.getElementById(infoId);
    const labelSpan = document.getElementById(labelId);
    
    if (files.length > 0) {
        if (multiple) {
            documents[type] = Array.from(files).map(f => f.name);
            infoDiv.textContent = `${files.length} archivo(s) seleccionados`;
        } else {
            documents[type] = files[0].name;
            infoDiv.textContent = files[0].name;
        }
        labelSpan.textContent = "Cambiar Archivo";
    }
}

// ===============================
// ✅ Experiencia y Referencias
// ===============================
function addExperienceItem(expData = null) {
    const container = document.getElementById('experienceContainer');
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Empresa</label>
            <input type="text" class="form-control exp-empresa" value="${expData?.empresa || ''}">
        </div>
        <div class="form-group">
            <label>Cargo</label>
            <input type="text" class="form-control exp-cargo" value="${expData?.cargo || ''}">
        </div>
        <div class="form-group">
            <label>Período</label>
            <div class="periodo-group" style="display:flex; gap:5px; align-items:center;">
                <input type="text" class="form-control exp-inicio" placeholder="Desde" value="${expData?.inicio || ''}">
                <span>a</span>
                <input type="text" class="form-control exp-fin" placeholder="Hasta" value="${expData?.fin || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Responsabilidades</label>
            <textarea class="form-control exp-responsabilidades" rows="2">${expData?.responsabilidades || ''}</textarea>
        </div>
        <button class="btn btn-sm btn-danger exp-remove"><i class="fas fa-trash"></i> Eliminar</button>
        <hr>
    `;
    container.appendChild(div);
    updateCVPreview();
}

function removeExperienceItem(button) {
    button.closest('.experience-item').remove();
    updateCVPreview();
}

function addReferenceItem(refData = null) {
    const container = document.getElementById('referencesContainer');
    const div = document.createElement('div');
    div.className = 'reference-item';
    div.innerHTML = `
        <div class="form-group">
            <label>Nombre</label>
            <input type="text" class="form-control ref-nombre" value="${refData?.nombre || ''}">
        </div>
        <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" class="form-control ref-telefono" value="${refData?.telefono || ''}">
        </div>
        <button class="btn btn-sm btn-danger ref-remove"><i class="fas fa-trash"></i> Eliminar</button>
        <hr>
    `;
    container.appendChild(div);
    updateCVPreview();
}

function removeReferenceItem(button) {
    button.closest('.reference-item').remove();
    updateCVPreview();
}

// ===============================
// ✅ Vista Previa y PDF
// ===============================
function updateCVPreview() {
    // Datos Personales
    document.getElementById('cvName').textContent = document.getElementById('nombre').value || 'Tu Nombre Completo';
    document.getElementById('cvCedula').textContent = `Cédula: ${document.getElementById('cedula').value || 'XXXXXXXX'}`;
    document.getElementById('cvDireccion').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${document.getElementById('direccion').value || 'Dirección'}`;
    document.getElementById('cvTelefono').innerHTML = `<i class="fas fa-phone"></i> ${document.getElementById('telefono').value || 'Teléfono'}`;
    document.getElementById('cvEmail').innerHTML = `<i class="fas fa-envelope"></i> ${document.getElementById('email').value || 'Correo'}`;
    
    // Educación
    document.getElementById('educationTitle').textContent = document.getElementById('titulo').value || 'Título';
    document.getElementById('educationInstitution').textContent = document.getElementById('institucion').value || 'Institución';
    document.getElementById('educationYear').textContent = document.getElementById('anioGraduacion').value || 'Año';
    
    // Habilidades
    const skillsList = document.getElementById('cvSkills');
    const selectedSkills = getSkillsFromInputs();
    skillsList.innerHTML = selectedSkills.map(s => `<span class="skill-tag" style="background:${selectedColor}; color:white; padding:2px 8px; border-radius:10px; margin:2px; display:inline-block;">${s}</span>`).join('') || 'Sin habilidades';

    // Experiencia
    const expList = document.getElementById('cvExperience');
    expList.innerHTML = '';
    document.querySelectorAll('#experienceContainer .experience-item').forEach(item => {
        const empresa = item.querySelector('.exp-empresa').value;
        const cargo = item.querySelector('.exp-cargo').value;
        if (empresa || cargo) {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${cargo}</strong> en <em>${empresa}</em><br><small>${item.querySelector('.exp-inicio').value} - ${item.querySelector('.exp-fin').value}</small>`;
            expList.appendChild(div);
        }
    });

    // Referencias
    const refList = document.getElementById('cvReferences');
    refList.innerHTML = '';
    document.querySelectorAll('#referencesContainer .reference-item').forEach(item => {
        const nombre = item.querySelector('.ref-nombre').value;
        if (nombre) {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${nombre}</strong> - Tel: ${item.querySelector('.ref-telefono').value}`;
            refList.appendChild(div);
        }
    });

    // Foto
    const cvPhoto = document.getElementById('cvPhoto');
    if (fotoURL) {
        cvPhoto.innerHTML = `<img src="${fotoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
        cvPhoto.innerHTML = `<i class="fas fa-user-circle" style="font-size: 80px;"></i>`;
    }

    updateCVStyling();
}

function updateCVStyling() {
    const cvName = document.getElementById('cvName');
    if (cvName) cvName.style.color = selectedColor;
    document.querySelectorAll('.cv-section h3').forEach(h3 => {
        h3.style.color = selectedColor;
        h3.style.borderBottom = `2px solid ${selectedColor}`;
    });
}

function changeTemplate() {
    selectedTemplate = document.getElementById('templateSelect').value;
    const cvTemplate = document.getElementById('cvTemplate');
    cvTemplate.className = `cv-template ${selectedTemplate}`;
    showToast(`Diseño cambiado a: ${selectedTemplate}`);
}

function exportToPDF() {
    const element = document.getElementById('cvTemplate');
    const nombre = document.getElementById('nombre').value || 'CV';
    
    showToast('Generando PDF...');
    
    const opt = {
        margin: 10,
        filename: `CV_${nombre.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => html2pdf().set(opt).from(
(Content truncated due to size limit. Use line ranges to read remaining content)