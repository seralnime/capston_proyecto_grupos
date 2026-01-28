// FourSight Group Assignment Application
// Main JavaScript Logic

// Global variables
let studentsData = [];
let groups = [];

// Role names mapping
const ROLES = {
    CLARIFICADOR: 'Clarificador',
    IDEADOR: 'Ideador',
    DESARROLLADOR: 'Desarrollador',
    IMPLEMENTADOR: 'Implementador'
};

// DOM Elements
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const browseBtn = document.getElementById('browse-btn');
const fileInfo = document.getElementById('file-info');
const validationStatus = document.getElementById('validation-status');
const processBtn = document.getElementById('process-btn');
const uploadSection = document.getElementById('upload-section');
const resultsSection = document.getElementById('results-section');
const removeFileBtn = document.getElementById('remove-file');
const resetBtn = document.getElementById('reset-btn');

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
removeFileBtn.addEventListener('click', resetUpload);
processBtn.addEventListener('click', processData);
resetBtn.addEventListener('click', resetApplication);

// Drag and drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        showValidation('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)', 'error');
        return;
    }

    // Show file info
    fileInfo.classList.remove('hidden');
    fileInfo.querySelector('.file-name').textContent = file.name;

    // Read and validate file
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Validate data
            const validation = await validateData(jsonData);
            if (validation.valid) {
                studentsData = validation.students;
                showValidation(`✓ Archivo válido: ${studentsData.length} estudiantes detectados`, 'success');
                processBtn.classList.remove('hidden');
            } else if (validation.valid === null) {
                // User cancelled
                processBtn.classList.add('hidden');
            } else {
                showValidation(validation.message, 'error');
                processBtn.classList.add('hidden');
            }
        } catch (error) {
            showValidation('Error al leer el archivo. Verifica el formato.', 'error');
            processBtn.classList.add('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
}

// Validate Excel data
async function validateData(data) {
    // Check if data exists
    if (!data || data.length === 0) {
        return { valid: false, message: 'El archivo está vacío' };
    }

    // Normalize column names and collect validation issues
    const normalizedData = [];
    const invalidRows = [];
    const MIN_SCORE = 9;

    data.forEach((row, index) => {
        const normalized = {};
        Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            if (normalizedKey.includes('nombre') || normalizedKey.includes('estudiante')) {
                normalized.Nombre = row[key];
            } else if (normalizedKey.includes('clarificador')) {
                normalized.Clarificador = parseFloat(row[key]);
            } else if (normalizedKey.includes('ideador')) {
                normalized.Ideador = parseFloat(row[key]);
            } else if (normalizedKey.includes('desarrollador')) {
                normalized.Desarrollador = parseFloat(row[key]);
            } else if (normalizedKey.includes('implementador')) {
                normalized.Implementador = parseFloat(row[key]);
            }
        });

        // Check if student has complete data
        const hasCompleteData = normalized.Nombre &&
            !isNaN(normalized.Clarificador) &&
            !isNaN(normalized.Ideador) &&
            !isNaN(normalized.Desarrollador) &&
            !isNaN(normalized.Implementador);

        if (!hasCompleteData) {
            invalidRows.push({
                rowNumber: index + 2,
                reason: 'Datos incompletos'
            });
        } else {
            // Check if at least one score is >= 9
            const maxScore = Math.max(
                normalized.Clarificador,
                normalized.Ideador,
                normalized.Desarrollador,
                normalized.Implementador
            );

            if (maxScore < MIN_SCORE) {
                invalidRows.push({
                    rowNumber: index + 2,
                    reason: `Puntaje máximo (${maxScore}) es menor a ${MIN_SCORE}`,
                    student: normalized
                });
            } else {
                // Valid student
                normalizedData.push(normalized);
            }
        }
    });

    // If there are invalid rows, ask user if they want to continue
    if (invalidRows.length > 0) {
        let alertMessage = 'Se encontraron las siguientes filas con problemas:\n\n';
        invalidRows.forEach(invalid => {
            alertMessage += `• Fila ${invalid.rowNumber}: ${invalid.reason}\n`;
        });
        alertMessage += `\n${normalizedData.length} estudiantes válidos encontrados.`;
        alertMessage += `\n\n¿Desea continuar ignorando estas ${invalidRows.length} fila(s)?`;

        const userConfirmed = confirm(alertMessage);

        if (!userConfirmed) {
            // User cancelled - return null to indicate cancellation
            return { valid: null, message: 'Operación cancelada por el usuario' };
        }
    }

    // Check if we have at least some valid students
    if (normalizedData.length === 0) {
        return { valid: false, message: 'No se encontraron estudiantes válidos en el archivo' };
    }

    // Adjust group count based on valid students
    let message = `✓ ${normalizedData.length} estudiantes válidos`;
    if (invalidRows.length > 0) {
        message += ` (${invalidRows.length} fila(s) ignoradas)`;
    }

    return {
        valid: true,
        students: normalizedData,
        message: message
    };
}

// Show validation message
function showValidation(message, type) {
    validationStatus.textContent = message;
    validationStatus.className = `validation-status ${type}`;
    validationStatus.classList.remove('hidden');
}

// Reset upload
function resetUpload() {
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    validationStatus.classList.add('hidden');
    processBtn.classList.add('hidden');
    studentsData = [];
}

// Reset application
function resetApplication() {
    resetUpload();
    uploadSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    groups = [];
}

// MAIN PROCESSING ALGORITHM
function processData() {
    if (studentsData.length === 0) {
        alert('Error: No hay estudiantes válidos para procesar');
        return;
    }

    // Step 1: Classify students by primary preference
    const classified = classifyStudents(studentsData);

    // Step 2: Detect integrators (students with tied scores)
    const integrators = detectIntegrators(classified.all);

    // Step 3: Balance roles using multi-level algorithm
    const balanced = balanceRoles(classified, integrators);

    // Step 4: Form 6 groups (4 groups of 4, 2 groups of 5)
    groups = formGroups(balanced);

    // Step 5: Display results
    displayResults(groups, integrators);

    // Hide upload section, show results
    uploadSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Level 1: Classify students by primary preference
function classifyStudents(students) {
    const classified = {
        [ROLES.CLARIFICADOR]: [],
        [ROLES.IDEADOR]: [],
        [ROLES.DESARROLLADOR]: [],
        [ROLES.IMPLEMENTADOR]: [],
        all: []
    };

    students.forEach(student => {
        const scores = {
            [ROLES.CLARIFICADOR]: student.Clarificador,
            [ROLES.IDEADOR]: student.Ideador,
            [ROLES.DESARROLLADOR]: student.Desarrollador,
            [ROLES.IMPLEMENTADOR]: student.Implementador
        };

        // Find primary preference (highest score)
        const sortedRoles = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const primaryRole = sortedRoles[0][0];
        const secondaryRole = sortedRoles[1][0];
        const tertiaryRole = sortedRoles[2][0];

        // Calculate delta (difference between 1st and 2nd)
        const delta = sortedRoles[0][1] - sortedRoles[1][1];

        const enrichedStudent = {
            ...student,
            scores: scores,
            primaryRole: primaryRole,
            secondaryRole: secondaryRole,
            tertiaryRole: tertiaryRole,
            delta: delta,
            assignedRole: primaryRole, // Initially assign to primary
            preferenceLevel: 1 // 1 = primary, 2 = secondary, 3 = tertiary
        };

        classified[primaryRole].push(enrichedStudent);
        classified.all.push(enrichedStudent);
    });

    return classified;
}

// Level 2 & 3: Detect integrators and calculate deltas
function detectIntegrators(students) {
    const integrators = [];
    const THRESHOLD = 2; // If difference between top scores ≤ 2, consider it a tie

    students.forEach(student => {
        if (student.delta <= THRESHOLD) {
            integrators.push(student);
            student.isIntegrator = true;
        } else {
            student.isIntegrator = false;
        }
    });

    return integrators;
}

// Level 2 & 3: Balance roles using multi-level hierarchical algorithm
function balanceRoles(classified, integrators) {
    const TARGET_PER_ROLE = 6; // We need 6 groups
    const balanced = {
        [ROLES.CLARIFICADOR]: [],
        [ROLES.IDEADOR]: [],
        [ROLES.DESARROLLADOR]: [],
        [ROLES.IMPLEMENTADOR]: []
    };

    // Process each role
    Object.keys(ROLES).forEach(roleKey => {
        const role = ROLES[roleKey];
        const students = [...classified[role]];

        if (students.length <= TARGET_PER_ROLE) {
            // No saturation, keep all in primary role
            balanced[role] = students;
        } else {
            // Saturation detected - need to reassign overflow
            // Sort by delta (descending) - highest delta stays in primary role
            students.sort((a, b) => b.delta - a.delta);

            // Keep top TARGET_PER_ROLE with highest delta
            balanced[role] = students.slice(0, TARGET_PER_ROLE);

            // Reassign overflow to secondary roles
            const overflow = students.slice(TARGET_PER_ROLE);
            overflow.forEach(student => {
                student.assignedRole = student.secondaryRole;
                student.preferenceLevel = 2;
            });
        }
    });

    // Collect all reassigned students
    const allBalanced = [];
    Object.values(balanced).forEach(group => {
        allBalanced.push(...group);
    });

    // Add reassigned students to their new roles
    classified.all.forEach(student => {
        if (!allBalanced.includes(student)) {
            balanced[student.assignedRole].push(student);
        }
    });

    // If still imbalanced, use integrators as flexible pieces
    Object.keys(ROLES).forEach(roleKey => {
        const role = ROLES[roleKey];

        while (balanced[role].length < TARGET_PER_ROLE) {
            // Find an integrator not yet assigned
            const integrator = integrators.find(i => !allBalanced.includes(i));
            if (integrator) {
                integrator.assignedRole = role;
                integrator.preferenceLevel = 2; // Flexible assignment
                balanced[role].push(integrator);
                allBalanced.push(integrator);
            } else {
                break;
            }
        }
    });

    return classified.all;
}

// Level 4: Form balanced groups dynamically based on student count
function formGroups(students) {
    const totalStudents = students.length;

    // Calculate optimal group configuration
    const groupConfig = calculateOptimalGroups(totalStudents);

    if (!groupConfig) {
        // If we can't form good groups, put everyone in one group
        return [{
            id: 1,
            size: totalStudents,
            members: students
        }];
    }

    // Create group structure
    const groups = [];
    for (let i = 0; i < groupConfig.numGroups; i++) {
        groups.push({
            id: i + 1,
            size: groupConfig.sizes[i],
            members: []
        });
    }

    // Separate students by assigned role
    const byRole = {
        [ROLES.CLARIFICADOR]: students.filter(s => s.assignedRole === ROLES.CLARIFICADOR),
        [ROLES.IDEADOR]: students.filter(s => s.assignedRole === ROLES.IDEADOR),
        [ROLES.DESARROLLADOR]: students.filter(s => s.assignedRole === ROLES.DESARROLLADOR),
        [ROLES.IMPLEMENTADOR]: students.filter(s => s.assignedRole === ROLES.IMPLEMENTADOR)
    };

    // Distribute each role across all groups (round-robin for diversity)
    Object.keys(ROLES).forEach(roleKey => {
        const role = ROLES[roleKey];
        const roleStudents = byRole[role];

        roleStudents.forEach((student, index) => {
            const groupIndex = index % groupConfig.numGroups;
            groups[groupIndex].members.push(student);
        });
    });

    // Handle any remaining students (should be minimal due to round-robin)
    const assigned = groups.flatMap(g => g.members);
    const remaining = students.filter(s => !assigned.includes(s));

    // Distribute remaining students to groups with space
    remaining.forEach((student, index) => {
        // Add to groups that are still below their target size
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].members.length < groups[i].size) {
                groups[i].members.push(student);
                break;
            }
        }
    });

    return groups;
}

// Calculate optimal group configuration based on number of students
function calculateOptimalGroups(numStudents) {
    const MIN_GROUP_SIZE = 3;  // Minimum to avoid students being alone
    const MAX_GROUP_SIZE = 6;  // Maximum for effective group dynamics
    const IDEAL_GROUP_SIZE = 4; // Preferred group size

    // Handle edge cases
    if (numStudents < MIN_GROUP_SIZE) {
        return {
            numGroups: 1,
            sizes: [numStudents]
        };
    }

    // Strategy: Find the number of groups that gives us sizes closest to IDEAL_GROUP_SIZE
    // while ensuring all groups are between MIN and MAX, and difference is at most 1

    let bestConfig = null;
    let bestScore = Infinity;

    // Try different numbers of groups
    for (let numGroups = 1; numGroups <= Math.floor(numStudents / MIN_GROUP_SIZE); numGroups++) {
        const baseSize = Math.floor(numStudents / numGroups);
        const remainder = numStudents % numGroups;

        // With this number of groups:
        // - (numGroups - remainder) groups will have baseSize students
        // - remainder groups will have (baseSize + 1) students
        // This GUARANTEES max difference of 1

        // Check if base size is within acceptable range
        if (baseSize < MIN_GROUP_SIZE || baseSize > MAX_GROUP_SIZE) {
            continue;
        }

        // Check if larger groups (base + 1) are still acceptable
        if (remainder > 0 && (baseSize + 1) > MAX_GROUP_SIZE) {
            continue;
        }

        // Calculate how close we are to ideal size
        // Score is the average deviation from IDEAL_GROUP_SIZE
        const smallGroupCount = numGroups - remainder;
        const largeGroupCount = remainder;
        const score = (
            smallGroupCount * Math.abs(baseSize - IDEAL_GROUP_SIZE) +
            largeGroupCount * Math.abs((baseSize + 1) - IDEAL_GROUP_SIZE)
        ) / numGroups;

        if (score < bestScore) {
            bestScore = score;

            // Build sizes array: larger groups first, then smaller
            const sizes = [];
            for (let i = 0; i < remainder; i++) {
                sizes.push(baseSize + 1);
            }
            for (let i = 0; i < numGroups - remainder; i++) {
                sizes.push(baseSize);
            }

            bestConfig = {
                numGroups: numGroups,
                sizes: sizes
            };
        }
    }

    return bestConfig;
}

// Display results
function displayResults(groups, integrators) {
    // Update summary
    const summary = document.getElementById('results-summary');
    summary.textContent = `Se han formado ${groups.length} grupos con distribución óptima de perfiles cognitivos`;

    // Display statistics
    displayStatistics(groups);

    // Display groups
    const container = document.getElementById('groups-container');
    container.innerHTML = '';

    groups.forEach((group, index) => {
        const groupCard = createGroupCard(group, index);
        container.appendChild(groupCard);
    });

    // Display integrators if any
    if (integrators.length > 0) {
        displayIntegrators(integrators);
    }
}

// Display statistics
function displayStatistics(groups) {
    const stats = document.getElementById('statistics');
    stats.innerHTML = '';

    // Count roles across all groups
    const roleCounts = {
        [ROLES.CLARIFICADOR]: 0,
        [ROLES.IDEADOR]: 0,
        [ROLES.DESARROLLADOR]: 0,
        [ROLES.IMPLEMENTADOR]: 0
    };

    groups.forEach(group => {
        group.members.forEach(member => {
            roleCounts[member.assignedRole]++;
        });
    });

    // Create stat cards
    Object.entries(roleCounts).forEach(([role, count]) => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-value">${count}</div>
            <div class="stat-label">${role}es</div>
        `;
        stats.appendChild(statCard);
    });
}

// Create group card
function createGroupCard(group, index) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const header = document.createElement('div');
    header.className = 'group-header';
    header.innerHTML = `
        <h3 class="group-title">Grupo ${group.id}</h3>
        <span class="group-size">${group.members.length} miembros</span>
    `;
    card.appendChild(header);

    const membersList = document.createElement('div');
    membersList.className = 'members-list';

    group.members.forEach(member => {
        const memberCard = createMemberCard(member);
        membersList.appendChild(memberCard);
    });

    card.appendChild(membersList);
    return card;
}

// Create member card
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = `member-card ${member.assignedRole.toLowerCase()}`;

    const roleClass = member.assignedRole.toLowerCase();
    const preferenceText = member.preferenceLevel === 1 ? '1° Preferencia' :
        member.preferenceLevel === 2 ? '2° Preferencia' : '3° Preferencia';

    card.innerHTML = `
        <div class="member-header">
            <span class="member-name">${member.Nombre}</span>
            <div class="member-badges">
                ${member.isIntegrator ? '<span class="integrator-badge">Integrador</span>' : ''}
            </div>
        </div>
        <div class="member-info">
            <span class="role-badge ${roleClass}">${member.assignedRole}</span>
            <span class="preference-badge">${preferenceText}</span>
            <span class="delta-info">Δ: ${member.delta.toFixed(1)}</span>
        </div>
    `;

    return card;
}

// Display integrators section
function displayIntegrators(integrators) {
    const section = document.getElementById('integrators-section');
    const list = document.getElementById('integrators-list');

    section.classList.remove('hidden');
    list.innerHTML = '';

    integrators.forEach(integrator => {
        const item = document.createElement('div');
        item.className = 'integrator-item';
        item.innerHTML = `
            <strong>${integrator.Nombre}</strong><br>
            <small>Perfiles empatados con Δ = ${integrator.delta.toFixed(1)}</small>
        `;
        list.appendChild(item);
    });
}
