# 🎯 Sprint Backlog AI - Presentación del Módulo

> Presentación visual para GitHub con formato optimizado para lectura

---

## 📋 Índice de Diapositivas

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Flujo de Generación IA](#3-flujo-de-generación-ia)
4. [Esquema de Datos](#4-esquema-de-datos)
5. [Edición en Tiempo Real](#5-edición-en-tiempo-real)
6. [Exportación MD y PDF](#6-exportación-md-y-pdf)
7. [Parámetros IA](#7-parámetros-ia)
8. [Stack Tecnológico](#8-stack-tecnológico)

---

## 1. Visión General

### 🎯 ¿Qué es el Sprint Backlog AI?

| Característica | Descripción |
|----------------|-------------|
| **Propósito** | Transformar hallazgos de usabilidad en Sprint Backlog accionable |
| **Motor** | MiniMax-M2.7 API de Chat Completion |
| **Gestión** | Edición inline completa + persistencia Supabase |
| **Salidas** | Markdown (editables) + PDF (imprimibles) |

### 📊 Estadísticas del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Historias de Usuario        3-6 por Sprint               │
│   Tareas Técnicas/US           2-4 anidadas                 │
│   Contexto IA utilizado        Tasks + Observations + Findings │
│   Tokens máximos respuesta    8192                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Flujo Completo

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
│   Plan   │──▶│  Guía    │──▶│ Registro │──▶│ Síntesis │──▶│ Sprint       │
│          │   │ (Tasks)  │   │(Observ.) │   │(Findings)│   │ Backlog IA   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────────┘
                                                                    │
                                              ┌─────────────────────┘
                                              ▼
                                    ┌─────────────────┐
                                    │ Exportable      │
                                    │ 📝 MD + 📄 PDF  │
                                    └─────────────────┘
```

---

## 2. Arquitectura del Sistema

### 🏗️ Arquitectura Hexagonal

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   PRESENTATION LAYER                                            │
│   ┌────────────────────────────────────────────────────────┐   │
│   │           SprintBacklogPage.tsx                         │   │
│   │  ┌─────────┐  ┌──────────────────────┐  ┌───────────┐  │   │
│   │  │ Header  │  │  Editor Area (US/Tasks)│  │  Sidebar  │  │   │
│   │  └─────────┘  └──────────────────────┘  └───────────┘  │   │
│   └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────│────────────────────────────────┐ │
│                              ▼                                  │
│   DOMAIN LAYER                                                  │
│   ┌─────────────────────┐  ┌────────────────────────────────┐  │
│   │  SprintBacklogGenerator.ts   │  types.ts (Interfaces)     │  │
│   │  - buildPrompt()    │  │  - SprintBacklog              │  │
│   │  - generateBacklog()│  │  - BacklogUserStory          │  │
│   └─────────────────────┘  │  - BacklogTask                │  │
│                            └────────────────────────────────┘  │
│                              │                                  │
│   ┌──────────────────────────│────────────────────────────────┐ │
│                              ▼                                  │
│   INFRASTRUCTURE LAYER                                         │
│   ┌──────────────────────┐  ┌────────────────────────────────┐  │
│   │  Supabase Repository  │  │  AI (MiniMax-M2.7)            │  │
│   │  - saveSprintBacklog │  │  - chatCompletion()           │  │
│   │  - getSprintBacklog  │  │                                │  │
│   └──────────────────────┘  └────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Generación IA

### 🔮 Pipeline de Generación

```
STEP 1: Construcción del Prompt
═══════════════════════════════

┌────────────────────────────────────────────────────────────┐
│  CONTEXTO DEL PRODUCTO                                     │
│  - Producto: {product_name}                               │
│  - Módulo: {module_name}                                  │
│  - Objetivo: {objective}                                  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  1. GUÍA DE TAREAS                                        │
│  "Tarea 1 [ID: T1]: [scenario del task]"                  │
│  "Tarea 2 [ID: T2]: [scenario del task]"                  │
│  ...                                                       │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  2. REGISTRO DE OBSERVACIONES (Top 10)                     │
│  "- Problema en T1: [detected_problem]"                   │
│  "- Problema en T2: [key_comments]"                       │
│  ...                                                       │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  3. SÍNTESIS DE HALLAZGOS                                 │
│  "Hallazgo 1: Problema, Severidad, Prioridad, Recomenda." │
│  "Hallazgo 2: ..."                                        │
└────────────────────────────────────────────────────────────┘

STEP 2: Llamada a API
═════════════════════

┌────────────────────────────────────────────────────────────┐
│  chatCompletion(messages, {                               │
│    model: "MiniMax-M2.7",                                 │
│    temperature: 0.3,                                      │
│    max_tokens: 8192                                       │
│  })                                                       │
└────────────────────────────────────────────────────────────┘

STEP 3: Parsing y Validación
════════════════════════════

┌────────────────────────────────────────────────────────────┐
│  1. Limpiar bloques ```json ... ```                        │
│  2. JSON.parse()                                          │
│  3. Validar campos obligatorios                           │
│  4. Asignar defaults (ej: duracion_sprint_dias: 14)        │
│  5. Devolver SprintBacklog                                 │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Esquema de Datos

### 📦 Estructura JSON

```json
{
  "sprint_nombre": "Sprint 1: Mejora de Facturación",
  "objetivo_sprint": "Mejorar validación y flujo de confirmación",
  "duracion_sprint_dias": 14,
  "notas_organizacion": "Asignar Frontend para T1.1, Backend para T1.2",
  "historias_usuario": [
    {
      "id": "US1",
      "titulo": "Validación en Tiempo Real",
      "descripcion": "Como cajero, quiero que los campos se validen...",
      "criterio_aceptacion": [
        "RFC con formato válido",
        "Cantidad mayor a cero"
      ],
      "prioridad": "Alta",
      "esfuerzo": "3 pts",
      "tipo": "feature",
      "tareas_tecnicas": [
        {
          "id": "T1.1",
          "descripcion": "Implementar regex de validación RFC",
          "estimado_horas": 4
        },
        {
          "id": "T1.2",
          "descripcion": "Agregar validación de rango",
          "estimado_horas": 2
        }
      ]
    }
  ]
}
```

### 🔗 Jerarquía 1:N

```
SprintBacklog
└── historias_usuario (array)
    ├── US1 ──┬── T1.1 (desc, 4h)
    │         └── T1.2 (desc, 2h)
    │
    ├── US2 ──┬── T2.1 (desc, 3h)
    │         └── T2.2 (desc, 1h)
    │
    └── US3 ──┬── T3.1 (desc, 2h)
              └── T3.2 (desc, 4h)
```

---

## 5. Edición en Tiempo Real

### ✏️ Operaciones Soportadas

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  STORIES (Historias de Usuario)                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ✏️ Editar título          │ updateStory(id, 'titulo', val) │ │
│  │ ✏️ Editar descripción     │ updateStory(id, 'descripcion') │ │
│  │ ✏️ Cambiar prioridad      │ updateStory(id, 'prioridad')  │ │
│  │ ➕ Agregar AC            │ handleAddAC(storyId)          │ │
│  │ ✏️ Editar AC inline      │ Update array directly         │ │
│  │ ❌ Eliminar AC           │ handleRemoveAC(storyId, idx)  │ │
│  │ ➕ Agregar tarea         │ handleAddNestedTask(storyId)   │ │
│  │ ❌ Eliminar US           │ handleRemoveStory(id)         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  TASKS (Tareas Técnicas Anidadas)                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ✏️ Editar descripción  │ updateNestedTask(sId, tId, ...) │ │
│  │ ✏️ Editar horas        │ updateNestedTask(..., 'estimado_horas')│ │
│  │ ❌ Eliminar tarea      │ handleRemoveNestedTask(sId, tId)│ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  SPRINT (Configuración)                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ✏️ Nombre del Sprint   │ Direct state update            │ │
│  │ ✏️ Objetivo            │ Direct state update            │ │
│  │ ✏️ Duración (días)     │ Direct state update            │ │
│  │ ✏️ Notas de Org.       │ Direct state update            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  💾 Auto-guardado: Se guarda en Supabase al regenerar o手动     │
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Vista Consolidada

```
┌────────────────────────────────────────────────────────────────┐
│                     CONSOLIDATED TASKS VIEW                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  US1 ── Validación en Tiempo Real                             │
│  ├──── T1.1 ── Implementar regex RFC          ── 4h           │
│  └──── T1.2 ── Validación de rango           ── 2h           │
│                                                                │
│  US2 ── Mejora de Feedback Visual                             │
│  ├──── T2.1 ── Agregar mensajes de error  ── 3h             │
│  └──── T2.2 ── Animaciones de éxito      ── 1h             │
│                                                                │
│  Total: 10 horas                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Exportación MD y PDF

### 📝 Exportar a Markdown

```typescript
// Función: handleExportMarkdown()
//
// Genera archivo .md con estructura:
// # Sprint Backlog: {sprint_nombre}
//
// ## Historias de Usuario
// ### [US1] {titulo}
// **Prioridad:** Alta | **Esfuerzo:** 3 pts
//
// **Criterios de Aceptación:**
// - [ ] {criterio_1}
// - [ ] {criterio_2}
//
// **Tareas Técnicas:**
// | ID | Descripción | Estimado |
// | T1.1 | desc | 4h |
```

### 📄 Exportar a PDF

```typescript
// Función: handleExportPDF()
//
// Usa jsPDF + jspdf-autotable
//
// Diseño:
// ┌─────────────────────────────────────────┐
// │ ████ Sprint Backlog Report ████████████│
// │ Generado por IHC Dashboard · 27/05/2026  │
// ├─────────────────────────────────────────┤
// │ Sprint 1: Mejora de Facturación         │
// │ Objetivo: Mejorar validación...          │
// ├─────────────────────────────────────────┤
// │ [US1] Validación en Tiempo Real         │
// │ Prioridad: Alta | Esfuerzo: 3 pts       │
// │                                         │
// │ Criterios de Aceptación:               │
// │ • RFC con formato válido               │
// │                                         │
// │ ┌─────────────────────────────┬────┐   │
// │ │ ID   │ Tarea Técnica    │ H  │   │
// │ ├─────────────────────────────┼────┤   │
// │ │ T1.1 │ Regex validación │ 4 │   │
// │ │ T1.2 │ Validación rango│ 2 │   │
// │ └─────────────────────────────┴────┘   │
// └─────────────────────────────────────────┘
```

### 📊 Comparación de Formatos

```
┌───────────────┬────────────┬────────────┐
│    Aspecto    │   Markdown  │     PDF    │
├───────────────┼────────────┼────────────┤
│ ✏️ Editable   │    ✅ Sí     │    ❌ No   │
│ 📁 Portable   │    ✅ Sí     │    ✅ Sí   │
│ 🎨 Estilo     │    ⚠️ Básico │    ✅ Rico  │
│ 🔗 Links      │    ✅ Sí     │    ❌ No   │
│ 📐 Print      │    ⚠️ Manual │    ✅ Auto │
│ 💰 Costo      │    $0        │    $0      │
└───────────────┴────────────┴────────────┘
```

---

## 7. Parámetros IA

### ⚙️ Configuración de la Llamada

```
┌────────────────────────────────────────────────────────────────┐
│                    PARÁMETROS DE API                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  MODEL          MiniMax-M2.7                                   │
│  TEMPERATURE    0.3 (bajo = más determinístico)               │
│  MAX_TOKENS     8192 (contexto amplio)                        │
│                                                                │
│  SYSTEM ROLE:                                                  │
│  "Eres un Product Owner experto en Scrum. Generas Sprint      │
│   Backlogs exclusivamente en formato JSON estricto con tareas  │
│   técnicas anidadas dentro de cada historia de usuario.       │
│   No incluyas explicaciones ni bloques de código."           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 🎯 Reglas de Formato Impuestas

```
REGLAS CRÍTICAS PARA EL MODELO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ❌ NO texto introductorio
2. ❌ NO bloques markdown (```json)
3. ✅ SOLO objeto JSON puro

CANTIDAD:
• 3-6 Historias de Usuario
• 2-4 Tareas Técnicas por US

ENUMERACIONES:
• Prioridad: "Alta" | "Media" | "Baja"
• Tipo: "feature" | "bugfix" | "improvement" | "spike"
• Duración: número de días (recomendado: 10-14)
```

### 📥 Datos de Contexto Enviados

```
FullTestPlan (input):
├── product_name      "Factura Pro"
├── module_name       "Pantalla de Facturación"
├── objective         "Evaluar facilidad de uso del flujo de venta"
├── tasks[]           → Guía de tareas evaluadas (T1, T2, ...)
├── observations[]    → Registro de campo (top 10 filtrados)
└── findings[]        → Síntesis de problemas

Output esperado:
SprintBacklog {
  sprint_nombre
  objetivo_sprint
  duracion_sprint_dias
  notas_organizacion
  historias_usuario[] → [US1, US2, ... USn]
}
```

---

## 8. Stack Tecnológico

### 🛠️ Tecnologías Usadas

```
┌────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Framework      React 18 + TypeScript                          │
│  Router         React Router v6                                │
│  State          React useState/useCallback                     │
│  UI Components  Custom + shadcn/ui                             │
│  Icons          Lucide React                                    │
│  PDF Gen        jsPDF + jspdf-autotable                         │
│  Build          Vite                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      BACKEND / DATA                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Database       Supabase (PostgreSQL)                          │
│  Storage        JSONB para SprintBacklog                       │
│  AI Provider    MiniMax-M2.7 (chat completion)                 │
│  Auth           Supabase Auth                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Pattern        Arquitectura Hexagonal                         │
│  Layers         Domain → Infrastructure → Presentation        │
│  Types          src/domain/entities/types.ts                   │
│  Services       src/domain/services/                           │
│  Repositories   src/infrastructure/repositories/               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 📁 Estructura de Archivos

```
src/
├── domain/
│   ├── entities/
│   │   └── types.ts              ← SprintBacklog interfaces
│   └── services/
│       └── SprintBacklogGenerator.ts  ← AI generation logic
│
├── presentation/
│   └── pages/
│       └── SprintBacklogPage.tsx  ← Full UI (editor + export)
│
├── infrastructure/
│   └── repositories/
│       └── SupabaseRepositories.ts ← Persistence
│
└── lib/
    └── ai.ts                     ← chatCompletion wrapper

documentacion/
├── README.md                      ← Índice
├── SPRINT-BACKLOG-IA.md           ← Guía técnica
├── SPRINT-BACKLOG-ARQUITECTURA.md ← Diagramas Mermaid
└── DIAPOSITIVAS/
    └── PRESENTACION-SPRINT-BACKLOG.md  ← Esta presentación
```

---

## ✅ Resumen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   SPRINT BACKLOG AI - CAPABILIDADES                             │
│                                                                 │
│   ✅ Generación automática de Sprint Backlog                    │
│   ✅ Integración de Tasks + Observations + Findings             │
│   ✅ Edición inline completa                                   │
│   ✅ Persistencia en Supabase (JSONB)                          │
│   ✅ Exportación Markdown (editables)                          │
│   ✅ Exportación PDF (imprimibles)                             │
│   ✅ Vista consolidada de tareas técnicas                       │
│   ✅ Jerarquía US → Tasks (1:N)                                │
│                                                                 │
│   🚀 Listo para integración con flujos Scrum                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Presentacion generada para HCI-SW-05 | Sistema de Pruebas de Usabilidad con IA*