---
theme: default
paginate: true
marp: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  header {
    color: #0f172a;
  }
  section.title {
    justify-content: center;
    align-items: center;
  }
---

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

| Aspecto | Descripción |
|---------|-------------|
| **Propósito** | Transformar hallazgos de usabilidad en Sprint Backlog |
| **Motor IA** | MiniMax-M2.7 Chat Completion |
| **Gestión** | Edición inline + persistencia en Supabase |
| **Salidas** | Markdown (editables) + PDF (imprimibles) |

---

## Flujo Completo del Módulo

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│   Plan   │───▶│  Guía    │───▶│ Registro │───▶│ Síntesis │───▶│   Sprint     │
│          │    │ (Tasks)  │    │(Observ.) │    │(Findings)│    │   Backlog IA │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────┬───────┘
                                                                      │
                                                              ┌───────┴───────┐
                                                              ▼               ▼
                                                         Exportable      Editable
                                                         📝 MD 📄 PDF      ✅ SI

```

---

# 🏗️ 2. Arquitectura del Sistema

## Arquitectura Hexagonal

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              SprintBacklogPage.tsx                 │  │
│  │  Header | Editor (US/Tasks) | Sidebar Config     │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│                           ▼                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    DOMAIN LAYER                   │  │
│  │  SprintBacklogGenerator.ts | types.ts            │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│                           ▼                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │                INFRASTRUCTURE LAYER                │  │
│  │  Supabase Repository  |  AI (MiniMax-M2.7)       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

| Componente | Ubicación | Responsabilidad |
|------------|-----------|-----------------|
| `SprintBacklogPage` | `presentation/pages/` | UI completa, editor, export |
| `SprintBacklogGenerator` | `domain/services/` | Prompt building, API call, parsing |
| `types.ts` | `domain/entities/` | Interfaces: SprintBacklog, UserStory, Task |
| `SupabaseRepositories` | `infrastructure/` | Persistencia JSONB |
| `chatCompletion` | `lib/ai.ts` | Wrapper de API MiniMax |

---

# 🔮 3. Flujo de Generación IA

## Paso 1: Construcción del Prompt

```
FullTestPlan
├── product_name    ──┐
├── module_name     ──┼──▶ CONTEXTO DEL PRODUCTO
└── objective       ──┘

plan.tasks[]        ───▶ 1. GUÍA DE TAREAS
                         "Tarea 1 [ID: T1]: [scenario]"
                         "Tarea 2 [ID: T2]: [scenario]"

plan.observations   ───▶ 2. REGISTRO DE OBSERVACIONES (Top 10)
.filter(!success)  ───▶ "- Problema en T1: [detected_problem]"
.slice(0,10)       ───▶ "- Problema en T2: [key_comments]"

plan.findings[]     ───▶ 3. SÍNTESIS DE HALLAZGOS
                         "Hallazgo 1: Problema, Severidad..."
```

---

## Paso 2: Llamada a API

```typescript
const response = await chatCompletion(
  [{ role: "user", content: buildPrompt(plan) }],
  {
    model: "MiniMax-M2.7",
    temperature: 0.3,    // Bajo = determinístico
    max_tokens: 8192,    // Amplio para JSON complejo
    system: "Eres un Product Owner experto en Scrum..."
  }
);
```

## Paso 3: Parsing y Validación

```
1. Limpiar bloques ```json ... ```
2. JSON.parse(response)
3. Validar campos obligatorios
4. Asignar defaults (duracion: 14)
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
        { "id": "T1.1", "descripcion": "Regex RFC", "estimado_horas": 4 },
        { "id": "T1.2", "descripcion": "Validación rango", "estimado_horas": 2 }
      ]
    }
  ]
}
```

---

## Jerarquía 1:N (US → Tasks)

```
SprintBacklog
└── historias_usuario[]
    │
    ├── US1 ──┬── T1.1 (Regex RFC, 4h)
    │         └── T1.2 (Validación rango, 2h)
    │
    ├── US2 ──┬── T2.1 (Mensajes error, 3h)
    │         └── T2.2 (Animaciones éxito, 1h)
    │
    └── US3 ──┬── T3.1 (Notificaciones, 2h)
              └── T3.2 (Tests unitarios, 4h)
```

---

# ✏️ 5. Edición en Tiempo Real

## Operaciones de Edición

| Operación | Función | Ubicación |
|-----------|---------|-----------|
| Editar título US | `updateStory(id, 'titulo', val)` | Inline input |
| Editar descripción US | `updateStory(id, 'descripcion', val)` | Inline textarea |
| Cambiar prioridad | `updateStory(id, 'prioridad', val)` | Select dropdown |
| Agregar AC | `handleAddAC(storyId)` | Button + array push |
| Editar AC inline | Direct array manipulation | Inline input |
| Eliminar AC | `handleRemoveAC(storyId, idx)` | Delete button |
| Agregar tarea | `handleAddNestedTask(storyId)` | Button en US |
| Eliminar tarea | `handleRemoveNestedTask(sId, tId)` | Delete button |
| Editar tarea | `updateNestedTask(sId, tId, field, val)` | Inline inputs |
| Eliminar US | `handleRemoveStory(id)` | Delete button |

---

## Vista Consolidada de Tareas

```
┌──────────────────────────────────────────────────────────────┐
│  CONSOLIDATED TASKS VIEW                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  US1 ── Validación en Tiempo Real                            │
│  ├── T1.1 ── Regex validación RFC        ── 4h               │
│  └── T1.2 ── Validación de rango        ── 2h               │
│                                                              │
│  US2 ── Mejora de Feedback Visual                            │
│  ├── T2.1 ── Mensajes de error          ── 3h               │
│  └── T2.2 ── Animaciones de éxito       ── 1h               │
│                                                              │
│  ─────────────────────────────────────────                   │
│  TOTAL: 10 horas                                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 📝 6. Exportación

## Exportar a Markdown

```typescript
function handleExportMarkdown() {
  // Genera estructura:
  // # Sprint Backlog: {sprint_nombre}
  // ## Historias de Usuario
  // ### [US1] {titulo}
  // **Criterios:**
  // - [ ] {criterio}
  // **Tareas:**
  // | ID | Desc | Horas |
  // | T1.1 | desc | 4h |

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  link.download = `backlog-{sprint_nombre}.md`;
  link.click();
}
```

## Exportar a PDF

```typescript
function handleExportPDF() {
  const doc = new jsPDF();
  // Header con estilo slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  // Título, info sprint
  // User Stories con autoTable
  doc.save(`backlog-{sprint_nombre}.pdf`);
}
```

---

## Comparación: MD vs PDF

| Aspecto | Markdown | PDF |
|---------|:-------:|:---:|
| Editable | ✅ | ❌ |
| Portable | ✅ | ✅ |
| Estilo visual | ⚠️ | ✅ |
| Links | ✅ | ❌ |
| Print | ⚠️ | ✅ |

---

# ⚙️ 7. Parámetros IA

## Configuración de Llamada

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| `model` | `MiniMax-M2.7` | Modelo configurado |
| `temperature` | `0.3` | Balance creatividad/consistencia |
| `max_tokens` | `8192` | Contexto amplio para JSON |
| `system` | PO Experto Scrum | Define rol y formato |

## Reglas Impuestas al Modelo

```
REGLAS CRÍTICAS:
• NO texto introductorio
• NO bloques markdown
• SOLO JSON puro
• 3-6 Historias de Usuario
• 2-4 Tareas Técnicas por US
• Prioridad: Alta | Media | Baja
• Tipo: feature | bugfix | improvement | spike
```

---

# 🛠️ 8. Stack Tecnológico

## Tecnologías del Proyecto

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estado** | React hooks (useState/useCallback) |
| **UI** | shadcn/ui + Lucide React |
| **PDF** | jsPDF + jspdf-autotable |
| **Backend** | Supabase (PostgreSQL) |
| **Storage** | JSONB para SprintBacklog |
| **AI** | MiniMax-M2.7 API |
| **Arquitectura** | Hexagonal (Domain/Infrastructure/Presentation) |

---

## Estructura de Archivos

```
src/
├── domain/
│   ├── entities/
│   │   └── types.ts              ← SprintBacklog interfaces
│   └── services/
│       └── SprintBacklogGenerator.ts  ← AI logic
│
├── presentation/
│   └── pages/
│       └── SprintBacklogPage.tsx  ← UI completa
│
├── infrastructure/
│   └── repositories/
│       └── SupabaseRepositories.ts ← Persistence
│
└── lib/
    └── ai.ts                     ← chatCompletion wrapper

documentacion/
├── README.md
├── SPRINT-BACKLOG-IA.md          ← Guía técnica
├── SPRINT-BACKLOG-ARQUITECTURA.md ← Diagramas Mermaid
└── DIAPOSITIVAS/
    └── PRESENTACION-SPRINT-BACKLOG.md ← Esta presentación
```

---

# ✅ Resumen

## Capacidades del Módulo

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ✅ Generación automática de Sprint Backlog             │
│   ✅ Integración de Tasks + Observations + Findings     │
│   ✅ Edición inline completa                            │
│   ✅ Persistencia en Supabase (JSONB)                   │
│   ✅ Exportación Markdown (editables)                  │
│   ✅ Exportación PDF (imprimibles)                     │
│   ✅ Vista consolidada de tareas                       │
│   ✅ Jerarquía US → Tasks (1:N)                        │
│                                                         │
│   🚀 Listo para integración Scrum                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 🎉 ¡Gracias!

## Preguntas

### HCI-SW-05
### Sistema de Pruebas de Usabilidad con IA