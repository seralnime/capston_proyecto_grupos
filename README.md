# FourSight - Sistema de Distribución Equilibrada de Grupos

## 📋 Descripción General

Aplicación web desarrollada para automatizar la creación de grupos de trabajo balanceados basados en puntajes FourSight, garantizando diversidad cognitiva óptima mediante un algoritmo jerárquico multinivel.

**Desarrollado para:** Capstone Design Project  
**Tecnologías:** HTML5, CSS3, JavaScript (Vanilla), SheetJS  
**Tipo:** Single Page Application (SPA)

---

## 🎯 Problema que Resuelve

Como profesor de Capstone Design Project, necesitas distribuir estudiantes en grupos de trabajo que maximicen la diversidad cognitiva basándose en sus perfiles FourSight. El proceso manual es:
- ⏰ Consume mucho tiempo
- 📊 Difícil de optimizar manualmente
- ❌ Propenso a errores humanos
- 🔄 No considera múltiples niveles de preferencias

**Solución:** Esta aplicación automatiza completamente el proceso utilizando un algoritmo de 4 niveles que analiza preferencias primarias, secundarias y terciarias, gestiona saturación de roles, y optimiza la distribución de "integradores".

---

## ✨ Características Principales

### 1. Validación Inteligente de Datos
- ✅ Lectura de archivos Excel (.xlsx/.xls)
- ✅ Validación de columnas requeridas
- ✅ Detección de filas con datos incompletos
- ✅ Verificación de puntaje mínimo (≥9)
- ✅ Confirmación interactiva para continuar con datos parciales

### 2. Algoritmo Jerárquico de 4 Niveles

#### **Nivel 1: Clasificación por Preferencia Primaria**
- Identifica el rol con puntaje más alto para cada estudiante
- Calcula delta (diferencia entre 1° y 2° preferencia)
- Clasifica inicialmente por rol primario

#### **Nivel 2: Gestión de Saturación**
- Detecta roles con exceso de estudiantes
- Identifica necesidad de reasignación
- Prepara estudiantes para redistribución

#### **Nivel 3: Análisis de Delta (Brecha)**
- Estudiantes con **delta alto** = perfiles "puros" → permanecen en rol primario
- Estudiantes con **delta bajo** = perfiles flexibles → se reasignan a rol secundario
- Prioriza especialización vs. flexibilidad

#### **Nivel 4: Integradores y Balance Final**
- **Integradores**: Estudiantes con delta ≤ 2 (puntajes empatados)
- Usados como "piezas flexibles" para completar grupos
- Identificados visualmente con badges especiales

### 3. Formación Dinámica de Grupos
- 📊 Calcula número óptimo de grupos automáticamente
- ⚖️ Garantiza diferencia máxima de 1 persona entre grupos
- 🎯 Tamaño ideal: 4 personas
- 📏 Rango: 3-6 personas por grupo
- 👥 Distribución round-robin para diversidad cognitiva

### 4. Interfaz Premium
- 🌙 Modo oscuro moderno
- 💎 Efectos glassmorphism
- ✨ Animaciones suaves
- 🎨 Badges color-coded por rol
- 📱 Diseño responsivo

---

## 🏗️ Arquitectura de la Aplicación

### Estructura de Archivos

```
capston inicio/
├── index.html           # Estructura HTML principal
├── styles.css           # Estilos premium con dark mode
├── app.js              # Lógica del algoritmo
├── README.md           # Documentación (este archivo)
├── Puntajes foursight.xlsx  # Datos reales
└── test_*.csv          # Archivos de prueba
```

### Componentes Principales

#### **1. index.html**
- **Sección de carga:** Drag-and-drop + explorador de archivos
- **Validación:** Mensajes de estado en tiempo real
- **Resultados:** Grid de tarjetas de grupos
- **Estadísticas:** Resumen de distribución de roles

#### **2. styles.css**
- **Variables CSS:** Sistema de colores consistente
- **Glassmorphism:** `backdrop-filter: blur(20px)`
- **Animaciones:** Keyframes para entrada y hover
- **Responsive:** Grid adaptativo con media queries
- **Color coding:**
  - Clarificador: `#ff6b9d` (Rosa)
  - Ideador: `#ffd93d` (Amarillo)
  - Desarrollador: `#6bcf7f` (Verde)
  - Implementador: `#4d9de0` (Azul)

#### **3. app.js**
Funciones principales:

```javascript
// Validación
validateData(data)           // Valida estructura y contenido
handleFile(file)             // Procesa archivo Excel

// Algoritmo
classifyStudents(students)   // Nivel 1: Clasificación primaria
detectIntegrators(students)  // Detecta perfiles empatados
balanceRoles(classified)     // Niveles 2-3: Balance y delta
formGroups(students)         // Nivel 4: Formación final
calculateOptimalGroups(n)    // Calcula configuración óptima

// Visualización
displayResults(groups)       // Renderiza resultados
createGroupCard(group)       // Crea tarjeta de grupo
createMemberCard(member)     // Crea tarjeta de miembro
```

---

## 🧮 Algoritmo Detallado

### Flujo Completo

```
1. CARGA → Excel Parser (SheetJS)
           ↓
2. VALIDACIÓN → ¿Completo y válido?
                ↓ Sí
3. NORMALIZACIÓN → Parsear puntajes
                   ↓
4. CLASIFICACIÓN → Asignar roles primarios
                   ↓
5. ANÁLISIS DELTA → Calcular brechas
                    ↓
6. DETECCIÓN → Identificar integradores
               ↓
7. BALANCE → Redistribuir saturación
             ↓
8. CONFIGURACIÓN → Calcular grupos óptimos
                   ↓
9. DISTRIBUCIÓN → Round-robin por roles
                  ↓
10. VISUALIZACIÓN → Renderizar resultados
```

### Cálculo de Grupos Óptimos

**Objetivo:** Grupos de tamaño similar (diferencia máx 1)

**Fórmula:**
```javascript
baseSize = floor(totalEstudiantes / numGrupos)
remainder = totalEstudiantes % numGrupos

// remainder grupos tendrán (baseSize + 1)
// (numGrupos - remainder) grupos tendrán baseSize
```

**Ejemplo con 13 estudiantes:**
```
Probar numGrupos = 3:
  baseSize = floor(13/3) = 4
  remainder = 13 % 3 = 1
  
  Resultado: [5, 4, 4]
  ✅ Diferencia máxima = 1
```

### Distribución Round-Robin

Garantiza que cada grupo reciba variedad de roles:

```javascript
Por cada rol (Clarificador, Ideador, etc.):
  estudiantes.forEach((estudiante, index) => {
    grupoIndex = index % numGrupos
    grupos[grupoIndex].push(estudiante)
  })
```

**Ejemplo con 3 grupos:**
```
Clarificadores: [A, B, C, D]
  A → Grupo 0 (índice 0 % 3)
  B → Grupo 1 (índice 1 % 3)
  C → Grupo 2 (índice 2 % 3)
  D → Grupo 0 (índice 3 % 3)

Resultado: Cada grupo tiene diversidad de roles
```

---

## 📊 Validaciones Implementadas

### 1. Validación de Archivo
```javascript
✓ Extensión: .xlsx o .xls
✓ Lectura: SheetJS puede parsear
✓ Contenido: No vacío
```

### 2. Validación de Estructura
```javascript
Columnas requeridas:
  - Nombre (o "Nombre Estudiante")
  - Clarificador
  - Ideador
  - Desarrollador
  - Implementador
```

### 3. Validación de Datos
```javascript
Por cada estudiante:
  ✓ Nombre presente
  ✓ Todos los puntajes son números
  ✓ Al menos un puntaje ≥ 9
```

### 4. Confirmación de Usuario
```javascript
Si hay filas inválidas:
  1. Mostrar lista de problemas
  2. Contar estudiantes válidos
  3. Preguntar: "¿Desea continuar?"
  4. Si acepta → procesar solo válidos
  5. Si cancela → reiniciar
```

---

## 💻 Cómo Usar la Aplicación

### Paso 1: Preparar Datos

**Formato del Excel:**
```
| Nombre Estudiante | Clarificador | Ideador | Desarrollador | Implementador |
|------------------|--------------|---------|---------------|---------------|
| Juan Pérez       | 25           | 18      | 12            | 15            |
| María López      | 10           | 22      | 20            | 18            |
```

**Reglas:**
- Columnas en cualquier orden
- Nombres de columnas case-insensitive
- Al menos un puntaje ≥ 9 por estudiante

### Paso 2: Abrir Aplicación

```bash
# Simplemente abre en el navegador:
index.html
```

### Paso 3: Cargar Archivo

**Opción A:** Drag and drop  
**Opción B:** Click "Explorar Archivos"

### Paso 4: Revisar Validación

**Caso exitoso:**
```
✓ Archivo válido: 22 estudiantes detectados
[Botón: Procesar y Crear Grupos]
```

**Caso con problemas:**
```
Se encontraron las siguientes filas con problemas:

• Fila 6: Datos incompletos
• Fila 11: Datos incompletos
• Fila 17: Puntaje máximo (8) es menor a 9

19 estudiantes válidos encontrados.

¿Desea continuar ignorando estas 3 fila(s)?
```

### Paso 5: Ver Resultados

**Información mostrada:**
- Número total de grupos
- Estadísticas por rol (cuántos Clarificadores, etc.)
- Tarjetas individuales de cada grupo
- Para cada estudiante:
  - Nombre
  - Rol asignado (color-coded)
  - Preferencia (1°, 2°, 3°)
  - Delta score
  - Badge "Integrador" (si aplica)

---

## 📐 Ejemplos de Distribución

### Ejemplo 1: 22 Estudiantes (Caso Ideal)
```
Entrada: 22 estudiantes válidos
Salida: 6 grupos

Distribución: [4, 4, 4, 4, 5, 5]

Grupo 1: 4 miembros
Grupo 2: 4 miembros
Grupo 3: 4 miembros
Grupo 4: 4 miembros
Grupo 5: 5 miembros
Grupo 6: 5 miembros
```

### Ejemplo 2: 13 Estudiantes
```
Entrada: 13 estudiantes válidos
Salida: 3 grupos

Distribución: [5, 4, 4]

Grupo 1: 5 miembros (1 Clarif, 2 Ideadores, 1 Desar, 1 Implem)
Grupo 2: 4 miembros (1 Clarif, 1 Ideador, 1 Desar, 1 Implem)
Grupo 3: 4 miembros (1 Clarif, 1 Ideador, 1 Desar, 1 Implem)
```

### Ejemplo 3: 10 Estudiantes
```
Entrada: 10 estudiantes válidos
Salida: 2 grupos

Distribución: [5, 5]

Ambos grupos perfectamente balanceados
```

---

## 🔧 Proceso de Desarrollo

### Fase 1: Planificación
1. Análisis de requisitos (Historia de Usuario)
2. Diseño de algoritmo multinivel
3. Definición de criterios de aceptación
4. Creación de plan de implementación

### Fase 2: Implementación Core
1. **Estructura HTML**
   - Layout principal
   - Zona de carga
   - Contenedor de resultados

2. **Estilos Premium**
   - Sistema de variables CSS
   - Dark mode con gradientes
   - Glassmorphism effects
   - Animaciones y transiciones

3. **Algoritmo Básico**
   - Parser de Excel (integración SheetJS)
   - Clasificación por preferencia primaria
   - Formación de grupos fijos (6 grupos)

### Fase 3: Validación Inteligente
1. Detección de filas incompletas
2. Validación de puntaje mínimo
3. Sistema de confirmación de usuario
4. Procesamiento de datos parciales

### Fase 4: Algoritmo Avanzado
1. **Análisis de Delta**
   - Cálculo de brechas entre preferencias
   - Priorización por "pureza" de perfil

2. **Detección de Integradores**
   - Identificación de empates (delta ≤ 2)
   - Asignación flexible

3. **Balance de Saturación**
   - Redistribución inteligente
   - Reasignación a roles secundarios

### Fase 5: Grupos Dinámicos
1. **Algoritmo de Configuración Óptima**
   - Cálculo automático de número de grupos
   - Garantía de diferencia máxima de 1
   - Optimización hacia tamaño ideal (4)

2. **Ajuste de Visualización**
   - Display de conteo real de miembros
   - Badges dinámicos de tamaño

### Fase 6: Testing y Refinamiento
1. Creación de datasets de prueba
2. Corrección de bugs
3. Optimización de UX
4. Documentación completa

---

## 🧪 Archivos de Prueba

### test_data_with_errors.csv
**Propósito:** Probar validación y manejo de errores  
**Contenido:** 23 filas con 3 inválidas  
**Resultado esperado:** 20 válidos → 5 grupos de 4

### test_8_students.csv
**Propósito:** Grupos pequeños balanceados  
**Contenido:** 8 estudiantes  
**Resultado esperado:** 2 grupos de 4

### test_10_students.csv
**Propósito:** Distribución perfecta  
**Contenido:** 10 estudiantes  
**Resultado esperado:** 2 grupos de 5

### test_13_students.csv
**Propósito:** Diferencia máxima de 1  
**Contenido:** 13 estudiantes  
**Resultado esperado:** 3 grupos [5, 4, 4]

### test_15_students.csv
**Propósito:** Grupos grandes balanceados  
**Contenido:** 15 estudiantes  
**Resultado esperado:** 3 grupos de 5

---

## 🎨 Decisiones de Diseño

### Color Palette
```css
Primary Background: #0a0e27 (Navy)
Secondary Background: #1a1f3a (Dark Navy)
Accent Purple: #7c3aed
Accent Green: #10b981
Accent Amber: #f59e0b

Role Colors:
  Clarificador: #ff6b9d (Pink)
  Ideador: #ffd93d (Yellow)
  Desarrollador: #6bcf7f (Green)
  Implementador: #4d9de0 (Blue)
```

### Typography
- **Font:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800
- **Jerarquía:** Títulos grandes (3rem), subtítulos (1.5rem), texto (1rem)

### Spacing
- **Container:** max-width 1400px, padding 2rem
- **Cards:** padding 2-3rem, gap 1.5-2rem
- **Border radius:** 8px (sm), 12px (md), 16px (lg), 24px (xl)

### Animations
```css
fadeInDown: Entrada desde arriba (header)
fadeInUp: Entrada desde abajo (contenido)
fadeInScale: Escala desde 90% (grupos)
float: Movimiento vertical sutil (iconos)
```

---

## ⚠️ Limitaciones y Consideraciones

### Limitaciones Técnicas
1. **Browser compatibility:** Requiere navegador moderno (ES6+)
2. **File size:** SheetJS puede tener límites con archivos muy grandes
3. **Client-side only:** No hay almacenamiento persistente

### Limitaciones Funcionales
1. **Tamaño de grupos:** Fijo entre 3-6 personas
2. **Roles:** Exactamente 4 roles (FourSight estándar)
3. **Balance perfecto:** No siempre posible con números primos

### Recomendaciones de Uso
- ✅ Ideal: 20-30 estudiantes
- ⚠️ Aceptable: 10-50 estudiantes
- ❌ No recomendado: <6 o >60 estudiantes

---

## 🚀 Mejoras Futuras Potenciales

### Corto Plazo
- [ ] Exportar resultados a Excel
- [ ] Permitir edición manual post-generación
- [ ] Guardar configuraciones en LocalStorage
- [ ] Imprimir resultados en PDF

### Medio Plazo
- [ ] Modo de visualización: lista vs. grid
- [ ] Filtros y búsqueda de estudiantes
- [ ] Generación de múltiples configuraciones alternativas
- [ ] Historial de grupos anteriores

### Largo Plazo
- [ ] Backend para persistencia de datos
- [ ] Autenticación de usuarios
- [ ] Análisis estadístico de distribuciones
- [ ] Integración con LMS (Canvas, Moodle)
- [ ] Algoritmos alternativos (ML-based)

---

## 📚 Tecnologías Utilizadas

### Frontend
- **HTML5:** Semántico, accesible
- **CSS3:** Variables, Grid, Flexbox, Animations
- **JavaScript (ES6+):** Async/await, Arrow functions, Modules

### Librerías
- **SheetJS (xlsx.js):** Parser de archivos Excel
  - Versión: 0.20.1
  - CDN: `https://cdn.sheetjs.com/`

### Herramientas de Desarrollo
- Editor: VS Code
- Browser DevTools: Chrome/Edge
- Testing: Manual con datasets de prueba

---

## 📖 Referencias

### FourSight Framework
- **Clarificador:** Identifica problemas, hace preguntas
- **Ideador:** Genera ideas, piensa creativamente
- **Desarrollador:** Analiza opciones, evalúa viabilidad
- **Implementador:** Ejecuta planes, toma acción

### Fundamentos Pedagógicos
- Aprendizaje colaborativo
- Diversidad cognitiva en equipos
- Grupos heterogéneos vs. homogéneos
- Tamaño óptimo de equipos de proyecto

---

## 👨‍💻 Autor y Contexto

**Proyecto:** Capstone Design Project - Formación de Equipos  
**Cliente:** Profesor de Capstone  
**Desarrollador:** Antigravity AI Assistant  
**Fecha:** Enero 2026  
**Versión:** 1.0

---

## 📄 Licencia

Desarrollado para uso educativo en el contexto de Capstone Design Project.

---

## 🆘 Soporte y Troubleshooting

### Problema: "No se puede leer el archivo"
**Solución:** Verifica que sea .xlsx o .xls válido

### Problema: "Datos incompletos en la fila X"
**Solución:** Revisa que todas las columnas tengan valores

### Problema: "Puntaje máximo menor a 9"
**Solución:** Verifica que los datos sean correctos, o acepta ignorar esa fila

### Problema: "Los grupos no se ven balanceados"
**Solución:** El algoritmo garantiza diferencia máxima de 1 persona. Si los roles están muy desbalanceados en los datos de entrada, algunos grupos pueden tener más de un mismo rol.

---

## 📞 Contacto

Para preguntas, mejoras o reportar bugs, consulta la documentación técnica en:
- `walkthrough.md` - Guía completa de características
- `implementation_plan.md` - Plan técnico original
- `dynamic_groups.md` - Documentación del algoritmo dinámico

---

**¡Gracias por usar FourSight Group Assignment!** 🎓✨
