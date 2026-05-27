# Sprint Backlog Asistido por IA

### HCI-SW-05
### Sistema de Pruebas de Usabilidad

---

# 📋 Agenda

1. Visión General del Módulo
2. Arquitectura del Sistema
3. Flujo de Generación IA
4. Esquema de Datos
5. Edición en Tiempo Real
6. Exportación MD y PDF
7. Parámetros de Configuración
8. Stack Tecnológico

---

# 🎯 1. Visión General

## ¿Qué es el Sprint Backlog AI?

El módulo transforma automáticamente hallazgos de pruebas de usabilidad en un Sprint Backlog estructurado.

| Aspecto | Descripción |
|---------|-------------|
| Propósito | Transformar hallazgos de usabilidad en Sprint Backlog |
| Motor IA | MiniMax-M2.7 Chat Completion |
| Gestión | Edición inline + persistencia en Supabase |
| Salidas | Markdown (editables) + PDF (imprimibles) |

---

## Flujo Completo del Módulo

```
Plan --> Guia (Tasks) --> Registro (Observ.) --> Sintesis (Findings) --> Sprint Backlog IA
                                                                                |
                                                                +-------------+-------------+
                                                                |                           |
                                                            Exportable               Editable
                                                          MD + PDF                    SI
```

---

# 🏗️ 2. Arquitectura del Sistema

## Arquitectura Hexagonal

```
PRESENTATION LAYER
  SprintBacklogPage.tsx (Header | Editor | Sidebar)
          |
          v
DOMAIN LAYER
  SprintBacklogGenerator.ts | types.ts
          |
          v
INFRASTRUCTURE LAYER
  Supabase Repository | AI (MiniMax-M2.7)
```

---

## Componentes Principales

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|-----------------|
| SprintBacklogPage | presentation/pages/ | UI completa, editor, export |
| SprintBacklogGenerator | domain/services/ | Prompt building, API call, parsing |
| types.ts | domain/entities/ | Interfaces: SprintBacklog, UserStory, Task |
| SupabaseRepositories | infrastructure/ | Persistencia JSONB |
| chatCompletion | lib/ai.ts | Wrapper de API MiniMax |

---

# 🔮 3. Flujo de Generación IA

## Paso 1: Construcción del Prompt

```
FullTestPlan
  product_name, module_name, objective --> CONTEXTO
  tasks[] --> GUIA DE TAREAS
  observations[] (top 10) --> REGISTRO DE OBSERVACIONES
  findings[] --> SINTESIS DE HALLAZGOS
```

## Paso 2: Llamada a API

```typescript
const response = await chatCompletion(
  [{ role: "user", content: buildPrompt(plan) }],
  {
    model: "MiniMax-M2.7",
    temperature: 0.3,
    max_tokens: 8192,
    system: "Eres un Product Owner experto en Scrum..."
  }
);
```

## Paso 3: Parsing y Validación

```
1. Limpiar bloques ```json ... ```
2. JSON.parse(response)
3. Validar campos obligatorios
4. Asignar defaults
5. Devolver SprintBacklog
```

---

# 📦 4. Esquema de Datos

## Estructura JSON del Sprint Backlog

```json
{
  "sprint_nombre": "Sprint 1: Mejora de Facturación",
  "objetivo_sprint": "Mejorar validación de campos",
  "duracion_sprint_dias": 14,
  "notas_organizacion": "Asignar Frontend para T1.1",
  "historias_usuario": [
    {
      "id": "US1",
      "titulo": "Validación en Tiempo Real",
      "descripcion": "Como cajero, quiero...",
      "criterio_aceptacion": ["RFC válido", "Cantidad > 0"],
      "prioridad": "Alta",
      "esfuerzo": "3 pts",
      "tipo": "feature",
      "tareas_tecnicas": [
        { "id": "T1.1", "descripcion": "Regex RFC", "estimado_horas": 4 }
      ]
    }
  ]
}
```

---

## Jerarquía 1:N (US → Tasks)

```
SprintBacklog
  historias_usuario[]
    US1
      T1.1 (Regex RFC, 4h)
      T1.2 (Validación rango, 2h)
    US2
      T2.1 (Mensajes error, 3h)
      T2.2 (Animaciones éxito, 1h)
    US3
      T3.1 (Notificaciones, 2h)
      T3.2 (Tests unitarios, 4h)
```

---

# ✏️ 5. Edición en Tiempo Real

## Operaciones de Edición

| Operación | Función | Ubicación |
|-----------|---------|-----------|
| Editar título US | updateStory(id, 'titulo', val) | Inline input |
| Editar descripción US | updateStory(id, 'descripcion', val) | Inline textarea |
| Cambiar prioridad | updateStory(id, 'prioridad', val) | Select dropdown |
| Agregar AC | handleAddAC(storyId) | Button + array push |
| Editar AC inline | Direct array manipulation | Inline input |
| Eliminar AC | handleRemoveAC(storyId, idx) | Delete button |
| Agregar tarea | handleAddNestedTask(storyId) | Button en US |
| Eliminar tarea | handleRemoveNestedTask(sId, tId) | Delete button |
| Editar tarea | updateNestedTask(sId, tId, field, val) | Inline inputs |
| Eliminar US | handleRemoveStory(id) | Delete button |

---

## Vista Consolidada de Tareas

```
CONSOLIDATED TASKS VIEW
-------------------------------------
US1 - Validación en Tiempo Real
  T1.1 - Regex validación RFC - 4h
  T1.2 - Validación de rango - 2h

US2 - Mejora de Feedback Visual
  T2.1 - Mensajes de error - 3h
  T2.2 - Animaciones de éxito - 1h
-------------------------------------
TOTAL: 10 horas
```

---

# 📝 6. Exportación

## Exportar a Markdown

```typescript
function handleExportMarkdown() {
  let md = `# Sprint Backlog: ${backlog.sprint_nombre}`;
  md += `## Historias de Usuario`;
  backlog.historias_usuario.forEach(us => {
    md += `### [${us.id}] ${us.titulo}`;
    md += `**Criterios:** ${us.criterio_aceptacion.join(' | ')}`;
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  link.download = `backlog-${sprint_nombre}.md`;
  link.click();
}
```

## Exportar a PDF

```typescript
function handleExportPDF() {
  const doc = new jsPDF();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.save(`backlog-${sprint_nombre}.pdf`);
}
```

---

## Comparación: MD vs PDF

| Aspecto | Markdown | PDF |
|---------|----------|-----|
| Editable | SI | NO |
| Portable | SI | SI |
| Estilo visual | Basico | Rico |
| Links | SI | NO |
| Print | Manual | Auto |

---

# ⚙️ 7. Parámetros IA

## Configuración de Llamada

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| model | MiniMax-M2.7 | Modelo configurado |
| temperature | 0.3 | Balance creatividad/consistencia |
| max_tokens | 8192 | Contexto amplio para JSON |
| system | PO Experto Scrum | Define rol y formato |

## Reglas Impuestas al Modelo

```
REGLAS CRITICAS:
- NO texto introductorio
- NO bloques markdown
- SOLO JSON puro
- 3-6 Historias de Usuario
- 2-4 Tareas Tecnicas por US
- Prioridad: Alta | Media | Baja
- Tipo: feature | bugfix | improvement | spike
```

---

# 🛠️ 8. Stack Tecnológico

## Tecnologías del Proyecto

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Estado | React hooks (useState/useCallback) |
| UI | shadcn/ui + Lucide React |
| PDF | jsPDF + jspdf-autotable |
| Backend | Supabase (PostgreSQL) |
| Storage | JSONB para SprintBacklog |
| AI | MiniMax-M2.7 API |
| Arquitectura | Hexagonal (Domain/Infrastructure/Presentation) |

---

## Estructura de Archivos

```
src/
├── domain/
│   ├── entities/types.ts        (SprintBacklog interfaces)
│   └── services/SprintBacklogGenerator.ts  (AI logic)
├── presentation/
│   └── pages/SprintBacklogPage.tsx  (UI completa)
├── infrastructure/
│   └── repositories/SupabaseRepositories.ts  (Persistence)
└── lib/ai.ts  (chatCompletion wrapper)

documentacion/
├── README.md
├── SPRINT-BACKLOG-IA.md
├── SPRINT-BACKLOG-ARQUITECTURA.md
├── SPRINT-BACKLOG-DIAPOS.md
└── DIAPOSITIVAS/PRESENTACION-SPRINT-BACKLOG.md
```

---

# Resumen

## Capacidades del Modulo

- Generacion automatica de Sprint Backlog
- Integracion de Tasks + Observations + Findings
- Edicion inline completa
- Persistencia en Supabase (JSONB)
- Exportacion Markdown (editables)
- Exportacion PDF (imprimibles)
- Vista consolidada de tareas
- Jerarquia US - Tasks (1:N)

Listo para integracion Scrum

---

# Gracias

### HCI-SW-05
### Sistema de Pruebas de Usabilidad con IA