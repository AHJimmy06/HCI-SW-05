# Sprint Backlog Asistido por IA - Guia Tecnica

## 1. Vision General

El modulo **Sprint Backlog AI** transforma automaticamente los hallazgos de pruebas de usabilidad en un Sprint Backlog estructurado y accionable, siguiendo las practicas de Scrum Senior con jerarquia **1:N** (Historias de Usuario -> Tareas Tecnicas).

### Caracteristicas Principales

- Generacion Automatica via MiniMax-M2.7 API
- Editable en Tiempo Real - Edicion inline de todos los campos
- Persistencia en Supabase - JSONB storage
- Exportacion Dual - Markdown (.md) y PDF
- Trazabilidad Completa - Cada tarea hereda de una Historia de Usuario

---

## 2. Flujo de Generacion

```
+---------------------------------------------------------------------+
|                     FULL TEST PLAN DATA                              |
|  { product_name, module_name, objective, tasks[], observations[],    |
|    findings[] }                                                      |
+---------------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------------+
|                   BUILD PROMPT (SprintBacklogGenerator)              |
|                                                                      |
|  1. GUIA DE TAREAS (Tasks)                                           |
|     -> "Tarea 1 [ID: T1]: [scenario]"                                  |
|                                                                      |
|  2. REGISTRO DE OBSERVACIONES (Observations)                         |
|     -> "- Problema en T1: [detected_problem]"                         |
|     -> Limitado a top 10 para optimizar contexto                      |
|                                                                      |
|  3. SINTESIS DE HALLAZGOS (Findings)                                 |
|     -> "Hallazgo 1: Problema, Severidad, Prioridad, Recomendacion"    |
+---------------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------------+
|              CHAT COMPLETION (MiniMax-M2.7)                           |
|                                                                      |
|  Model: MiniMax-M2.7                                                 |
|  Temperature: 0.3 (bajo para consistencia)                            |
|  Max Tokens: 8192                                                    |
|  System: "Eres un Product Owner experto en Scrum..."                 |
+---------------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------------+
|                 PARSING & VALIDATION                                  |
|                                                                      |
|  1. Limpiar bloques markdown (```json -> vacio)                      |
|  2. JSON.parse()                                                      |
|  3. Validar campos obligatorios                                      |
|  4. Asignar defaults si faltan                                       |
+---------------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------------+
|                    SPRINT BACKLOG (JSON)                              |
|                                                                      |
|  { sprint_nombre, objetivo_sprint, duracion_sprint_dias,             |
|    notas_organizacion, historias_usuario[] }                        |
+---------------------------------------------------------------------+
```

---

## 3. Parametros del Prompt IA

### 3.1 Datos de Entrada (Context)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| product_name | string | Nombre del producto evaluado |
| module_name | string | Modulo especifico del producto |
| objective | string | Objetivo del plan de pruebas |
| tasks[] | Task[] | Guia de tareas evaluadas |
| observations[] | Observation[] | Registro de observaciones de campo |
| findings[] | Finding[] | Sintesis de problemas detectados |

### 3.2 Parametros de Llamada API

```typescript
await chatCompletion(messages, {
  model: "MiniMax-M2.7",
  temperature: 0.3,    // Bajo = mas deterministico
  max_tokens: 8192,    // Contexto amplio para JSON complejo
  system: "Eres un Product Owner experto en Scrum..."
});
```

| Parametro | Valor | Justificacion |
|------------|-------|---------------|
| model | MiniMax-M2.7 | Modelo configurado en src/lib/ai.ts |
| temperature | 0.3 | Balance entre creatividad y consistencia |
| max_tokens | 8192 | Suficiente para 3-6 US con 2-4 tareas cada una |

### 3.3 Reglas de Formato Impuestas al Modelo

```
REGLAS DE FORMATO (CRITICO):
1. Responde UNICAMENTE con el objeto JSON. SIN texto introductorio.
2. Cantidad: Entre 3 y 6 Historias de Usuario.
3. Tareas Tecnicas: Cada US DEBE tener entre 2 y 4 tareas tecnicas anidadas.
4. Prioridad: "Alta", "Media" o "Baja".
5. Tipo: "feature", "bugfix", "improvement" o "spike".
```

---

## 4. Esquema JSON del Sprint Backlog

```typescript
interface SprintBacklog {
  sprint_nombre: string;              // ej: "Sprint 1: Mejora de Facturacion"
  objetivo_sprint: string;             // Descripcion del objetivo
  duracion_sprint_dias: number;        // ej: 14
  notas_organizacion: string;           // Asignaciones sugeridas
  historias_usuario: BacklogUserStory[];
}

interface BacklogUserStory {
  id: string;                          // ej: "US1"
  titulo: string;                      // ej: "Validacion de Campos"
  descripcion: string;                 // Formato: "Como [rol], quiero [accion]..."
  criterio_aceptacion: string[];       // Lista de criterios
  prioridad: "Alta" | "Media" | "Baja";
  esfuerzo: string;                    // ej: "3 pts"
  tipo: "feature" | "bugfix" | "improvement" | "spike";
  tareas_tecnicas: BacklogTask[];      // Relacion 1:N
}

interface BacklogTask {
  id: string;                          // ej: "T1.1"
  descripcion: string;                 // Descripcion tecnica
  estimado_horas: number;              // ej: 4
}
```

---

## 5. Edicion en Tiempo Real

El estado del Sprint Backlog se mantiene en React state:

```typescript
const [backlog, setBacklog] = useState<SprintBacklog | null>(null);
```

### 5.1 Operaciones de Edicion

| Operacion | Funcion | Efecto |
|-----------|---------|--------|
| Editar Historia | updateStory(id, field, value) | Actualiza campos de US |
| Editar Tarea | updateNestedTask(storyId, taskId, field, value) | Actualiza tarea anidada |
| Anadir US | handleAddStory() | Agrega nueva US al array |
| Eliminar US | handleRemoveStory(id) | Filtra US del array |
| Anadir Tarea | handleAddNestedTask(storyId) | Agrega tarea a US especifica |
| Eliminar Tarea | handleRemoveNestedTask(storyId, taskId) | Filtra tarea de US |
| Editar AC | Actualizacion inline en array | Modifica criterio |
| Editar Nota AC | handleAddAC(storyId) / handleRemoveAC(storyId, idx) | Gestiona criterios |

### 5.2 Agregacion de Esfuerzo

```typescript
// Vista consolidada: todas las tareas aplanadas
const consolidatedTasks = backlog.historias_usuario.flatMap(s => 
  s.tareas_tecnicas.map(t => ({
    ...t,
    parentStoryId: s.id,
    parentStoryTitle: s.titulo
  }))
);

// Total de horas por Historia de Usuario
const totalHoras = story.tareas_tecnicas.reduce((acc, t) => acc + t.estimado_horas, 0);
```

---

## 6. Persistencia en Supabase

### 6.1 Almacenamiento

```typescript
// Guardar Sprint Backlog
await repo.saveSprintBacklog(testPlanId, backlog);

// Recuperar Sprint Backlog
const existingBacklog = await repo.getSprintBacklog(testPlanId);
```

### 6.2 Estrategia de Persistencia

- **Formato**: JSONB en columna sprint_backlog de tabla sprint_backlogs
- **Trigger**: Auto-guardado al generar + guardado manual
- **Reutilizacion**: Si existe backlog previo, se carga y muestra sin regenerar

---

## 7. Exportacion

### 7.1 Exportacion a Markdown

```typescript
function handleExportMarkdown() {
  // Genera string Markdown
  let md = `# Sprint Backlog: ${backlog.sprint_nombre}\n\n`;
  md += `**Objetivo:** ${backlog.objetivo_sprint}\n\n`;
  md += `**Duracion:** ${backlog.duracion_sprint_dias} dias\n\n`;
  
  backlog.historias_usuario.forEach(us => {
    md += `### [${us.id}] ${us.titulo}\n`;
    md += `**Prioridad:** ${us.prioridad} | **Esfuerzo:** ${us.esfuerzo}\n`;
    md += `${us.descripcion}\n\n`;
    md += `**Criterios de Aceptacion:**\n`;
    us.criterio_aceptacion.forEach(ac => md += `- [ ] ${ac}\n`);
    md += `\n**Tareas Tecnicas:**\n`;
    md += `| ID | Descripcion | Estimado |\n|----|-------------|----------|\n`;
    us.tareas_tecnicas.forEach(t => {
      md += `| ${t.id} | ${t.descripcion} | ${t.estimado_horas}h |\n`;
    });
  });

  // Download como .md
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backlog-${sprint_nombre}.md`;
  link.click();
}
```

### 7.2 Estructura del Markdown Generado

```markdown
# Sprint Backlog: Sprint 1: Mejora de Facturacion

**Objetivo:** Mejorar la validacion de campos y el flujo de confirmacion

**Duracion:** 14 dias

## Historias de Usuario

### [US1] Validacion de Campos en Tiempo Real
**Prioridad:** Alta | **Esfuerzo:** 3 pts | **Tipo:** feature

Como cajero, quiero que los campos se validen automaticamente para reducir errores.

**Criterios de Aceptacion:**
- [ ] El campo RFC valida formato automaticamente
- [ ] El campo cantidad no permite valores negativos

**Tareas Tecnicas:**
| ID | Descripcion | Estimado |
|----|-------------|----------|
| T1.1 | Implementar regex de validacion RFC | 4h |
| T1.2 | Agregar validacion de rango en cantidad | 2h |
```

### 7.3 Exportacion a PDF

```typescript
function handleExportPDF() {
  const doc = new jsPDF();
  
  // Header con estilo
  doc.setFillColor(15, 23, 42);  // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Titulo
  doc.setTextColor(255, 255, 255);
  doc.text("Sprint Backlog Report", 20, 20);
  
  // Info del Sprint
  doc.text(backlog.sprint_nombre, 20, 55);
  
  // User Stories con autoTable
  backlog.historias_usuario.forEach((us) => {
    autoTable(doc, {
      head: [['ID', 'Tarea Tecnica', 'Horas']],
      body: us.tareas_tecnicas.map(t => [t.id, t.descripcion, `${t.estimado_horas}h`]),
      headStyles: { fillColor: [71, 85, 105] },
      theme: 'striped'
    });
  });
  
  doc.save(`backlog-${sprint_nombre}.pdf`);
}
```

### 7.4 Comparacion de Formatos

| Aspecto | Markdown | PDF |
|---------|----------|-----|
| Editable | SI (texto plano) | NO |
| Portabilidad | SI (Git, Notion, Confluence) | SI (Universal) |
| Estilo visual | Basico | Profesional |
| Integracion IA | SI (Compatible) | Requiere conversion |
| Print | Requiere render | Optimizado |

---

## 8. Archivos del Modulo

```
src/
├── domain/
│   ├── entities/
│   │   └── types.ts                    (Interfaces: SprintBacklog, BacklogUserStory, BacklogTask)
│   └── services/
│       └── SprintBacklogGenerator.ts    (Logica de generacion IA)
├── presentation/
│   └── pages/
│       └── SprintBacklogPage.tsx       (UI completa: editor + export)
└── infrastructure/
    └── repositories/
        └── SupabaseRepositories.ts     (Persistencia)
```

---

## 9. Notas de Implementacion

### Validacion Defensiva
- Si la IA no devuelve JSON valido, se lanza error y se pide reintentar
- Todos los campos tienen defaults (ej: duracion_sprint_dias: 14)
- Tipos de prioridad/tipo validados contra enumeraciones permitidas

### Optimizacion de Contexto
- Observaciones limitadas a top 10 (slice(0, 10))
- Solo se incluyen observaciones con !success o detected_problem

### Compatibilidad con Datos Heredados
- Tasks y nested tasks tienen guards contra undefined
- flatMap con || [] para evitar crashes en datos antiguos