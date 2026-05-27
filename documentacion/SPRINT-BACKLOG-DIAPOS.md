# Sprint Backlog AI - Presentacion del Modulo

Presentacion visual para GitHub con formato optimizado para lectura

---

## Indice de Diapositivas

1. Vision General
2. Arquitectura del Sistema
3. Flujo de Generacion IA
4. Esquema de Datos
5. Edicion en Tiempo Real
6. Exportacion MD y PDF
7. Parametros IA
8. Stack Tecnologico

---

## 1. Vision General

### Que es el Sprint Backlog AI?

| Caracteristica | Descripcion |
|----------------|-------------|
| Proposito | Transformar hallazgos de usabilidad en Sprint Backlog accionable |
| Motor | MiniMax-M2.7 API de Chat Completion |
| Gestion | Edicion inline completa + persistencia Supabase |
| Salidas | Markdown (editables) + PDF (imprimibles) |

### Estadisticas del Modulo

```
Historias de Usuario: 3-6 por Sprint
Tareas Tecnicas/US: 2-4 anidadas
Contexto IA utilizado: Tasks + Observations + Findings
Tokens maximos respuesta: 8192
```

### Flujo Completo

```
Plan --> Guia (Tasks) --> Registro (Observ.) --> Sintesis (Findings) --> Sprint Backlog IA
                                                                                  |
                                                              +-------------+-------------+
                                                              |                           |
                                                          Exportable               Editable
                                                        MD + PDF                    SI
```

---

## 2. Arquitectura del Sistema

### Arquitectura Hexagonal

```
PRESENTATION LAYER
  SprintBacklogPage.tsx
  Header | Editor Area (US/Tasks) | Sidebar
           |
           v
DOMAIN LAYER
  SprintBacklogGenerator.ts | types.ts (Interfaces)
  - buildPrompt()
  - generateBacklog()
           |
           v
INFRASTRUCTURE LAYER
  Supabase Repository | AI (MiniMax-M2.7)
  - saveSprintBacklog / - getSprintBacklog | - chatCompletion()
```

---

## 3. Flujo de Generacion IA

### Pipeline de Generacion

```
STEP 1: Construccion del Prompt
================================

CONTEXTO DEL PRODUCTO
- Producto: {product_name}
- Modulo: {module_name}
- Objetivo: {objective}

1. GUIA DE TAREAS
"Tarea 1 [ID: T1]: [scenario del task]"
"Tarea 2 [ID: T2]: [scenario del task]"

2. REGISTRO DE OBSERVACIONES (Top 10)
"- Problema en T1: [detected_problem]"
"- Problema en T2: [key_comments]"

3. SINTESIS DE HALLAZGOS
"Hallazgo 1: Problema, Severidad, Prioridad, Recomendacion"

STEP 2: Llamada a API
======================

chatCompletion(messages, {
  model: "MiniMax-M2.7",
  temperature: 0.3,
  max_tokens: 8192
})

STEP 3: Parsing y Validacion
=============================

1. Limpiar bloques ```json ... ```
2. JSON.parse()
3. Validar campos obligatorios
4. Asignar defaults (ej: duracion_sprint_dias: 14)
5. Devolver SprintBacklog
```

---

## 4. Esquema de Datos

### Estructura JSON

```json
{
  "sprint_nombre": "Sprint 1: Mejora de Facturacion",
  "objetivo_sprint": "Mejorar validacion y flujo de confirmacion",
  "duracion_sprint_dias": 14,
  "notas_organizacion": "Asignar Frontend para T1.1, Backend para T1.2",
  "historias_usuario": [
    {
      "id": "US1",
      "titulo": "Validacion en Tiempo Real",
      "descripcion": "Como cajero, quiero que los campos se validen...",
      "criterio_aceptacion": ["RFC con formato valido", "Cantidad mayor a cero"],
      "prioridad": "Alta",
      "esfuerzo": "3 pts",
      "tipo": "feature",
      "tareas_tecnicas": [
        { "id": "T1.1", "descripcion": "Implementar regex de validacion RFC", "estimado_horas": 4 },
        { "id": "T1.2", "descripcion": "Agregar validacion de rango", "estimado_horas": 2 }
      ]
    }
  ]
}
```

### Jerarquia 1:N

```
SprintBacklog
historias_usuario (array)
  US1
    T1.1 (desc, 4h)
    T1.2 (desc, 2h)
  US2
    T2.1 (desc, 3h)
    T2.2 (desc, 1h)
  US3
    T3.1 (desc, 2h)
    T3.2 (desc, 4h)
```

---

## 5. Edicion en Tiempo Real

### Operaciones Soportadas

```
STORIES (Historias de Usuario)
--------------------------------
- Editar titulo: updateStory(id, 'titulo', val)
- Editar descripcion: updateStory(id, 'descripcion', val)
- Cambiar prioridad: updateStory(id, 'prioridad', val)
- Agregar AC: handleAddAC(storyId)
- Editar AC inline: Update array directly
- Eliminar AC: handleRemoveAC(storyId, idx)
- Agregar tarea: handleAddNestedTask(storyId)
- Eliminar US: handleRemoveStory(id)

TASKS (Tareas Tecnicas Anidadas)
----------------------------------
- Editar descripcion: updateNestedTask(sId, tId, descripcion, val)
- Editar horas: updateNestedTask(sId, tId, 'estimado_horas', val)
- Eliminar tarea: handleRemoveNestedTask(sId, tId)

SPRINT (Configuracion)
-----------------------
- Nombre del Sprint: Direct state update
- Objetivo: Direct state update
- Duracion (dias): Direct state update
- Notas de Org.: Direct state update

Auto-guardado: Se guarda en Supabase al regenerar o manualmente
```

### Vista Consolidada

```
CONSOLIDATED TASKS VIEW
------------------------------------
US1 -- Validacion en Tiempo Real
  T1.1 -- Implementar regex RFC -- 4h
  T1.2 -- Validacion de rango -- 2h

US2 -- Mejora de Feedback Visual
  T2.1 -- Agregar mensajes de error -- 3h
  T2.2 -- Animaciones de exito -- 1h

Total: 10 horas
```

---

## 6. Exportacion MD y PDF

### Exportar a Markdown

```typescript
// Funcion: handleExportMarkdown()
//
// Genera archivo .md con estructura:
// # Sprint Backlog: {sprint_nombre}
//
// ## Historias de Usuario
// ### [US1] {titulo}
// **Prioridad:** Alta | **Esfuerzo:** 3 pts
//
// **Criterios de Aceptacion:**
// - [ ] {criterio_1}
// - [ ] {criterio_2}
//
// **Tareas Tecnicas:**
// | ID | Descripcion | Estimado |
// | T1.1 | desc | 4h |
```

### Exportar a PDF

```typescript
// Funcion: handleExportPDF()
//
// Usa jsPDF + jspdf-autotable
//
// Disenio:
// +------------------------------------+
// |  SPRINT BACKLOG REPORT             |
// |  Generado por IHC Dashboard        |
// +------------------------------------+
// | Sprint 1: Mejora de Facturacion   |
// | Objetivo: Mejorar validacion...    |
// +------------------------------------+
// | [US1] Validacion en Tiempo Real    |
// | Criterios: RFC valido, Cant > 0    |
// +------------------------------------+
// | ID   | Tarea Tecnica     | H       |
// | T1.1 | Regex validacion | 4        |
// | T1.2 | Validacion rango | 2        |
// +------------------------------------+
```

### Comparacion de Formatos

| Aspecto    | Markdown | PDF    |
|------------|----------|--------|
| Editable   | SI       | NO     |
| Portable   | SI       | SI     |
| Estilo     | Basico   | Rico   |
| Links      | SI       | NO     |
| Print      | Manual   | Auto   |

---

## 7. Parametros IA

### Configuracion de la Llamada

| Parametro    | Valor            | Descripcion                          |
|--------------|------------------|--------------------------------------|
| MODEL        | MiniMax-M2.7     | Modelo de chat                       |
| TEMPERATURE   | 0.3              | Bajo = mas deterministico            |
| MAX_TOKENS    | 8192             | Contexto amplio para JSON            |
| SYSTEM ROLE   | PO Experto Scrum | Define comportamiento y formato       |

### Reglas de Formato Impuestas

```
REGLAS CRITICAS PARA EL MODELO:
================================

1. NO texto introductorio
2. NO bloques markdown (```json)
3. SOLO objeto JSON puro

CANTIDAD:
- 3-6 Historias de Usuario
- 2-4 Tareas Tecnicas por US

ENUMERACIONES:
- Prioridad: "Alta" | "Media" | "Baja"
- Tipo: "feature" | "bugfix" | "improvement" | "spike"
- Duracion: numero de dias (recomendado: 10-14)
```

### Datos de Contexto Enviados

```
FullTestPlan (input):
- product_name: "Factura Pro"
- module_name: "Pantalla de Facturacion"
- objective: "Evaluar facilidad de uso del flujo de venta"
- tasks[]: Guia de tareas evaluadas (T1, T2, ...)
- observations[]: Registro de campo (top 10 filtrados)
- findings[]: Sintesis de problemas

Output esperado:
SprintBacklog {
  sprint_nombre
  objetivo_sprint
  duracion_sprint_dias
  notas_organizacion
  historias_usuario[] -> [US1, US2, ... USn]
}
```

---

## 8. Stack Tecnologico

### Tecnologias Usadas

```
FRONTEND
--------
Framework: React 18 + TypeScript
Router: React Router v6
State: React useState/useCallback
UI Components: Custom + shadcn/ui
Icons: Lucide React
PDF Gen: jsPDF + jspdf-autotable
Build: Vite

BACKEND / DATA
--------------
Database: Supabase (PostgreSQL)
Storage: JSONB para SprintBacklog
AI Provider: MiniMax-M2.7 (chat completion)
Auth: Supabase Auth

ARCHITECTURE
------------
Pattern: Arquitectura Hexagonal
Layers: Domain -> Infrastructure -> Presentation
Types: src/domain/entities/types.ts
Services: src/domain/services/
Repositories: src/infrastructure/repositories/
```

### Estructura de Archivos

```
src/
├── domain/
│   ├── entities/
│   │   └── types.ts              (SprintBacklog interfaces)
│   └── services/
│       └── SprintBacklogGenerator.ts  (AI generation logic)
│
├── presentation/
│   └── pages/
│       └── SprintBacklogPage.tsx  (Full UI - editor + export)
│
├── infrastructure/
│   └── repositories/
│       └── SupabaseRepositories.ts (Persistence)
│
└── lib/
    └── ai.ts                     (chatCompletion wrapper)

documentacion/
├── README.md                      (Indice)
├── SPRINT-BACKLOG-IA.md           (Guia tecnica)
├── SPRINT-BACKLOG-ARQUITECTURA.md (Diagramas Mermaid)
└── DIAPOSITIVAS/
    └── PRESENTACION-SPRINT-BACKLOG.md  (Esta presentacion)
```

---

## Resumen

```
SPRINT BACKLOG AI - CAPACIDADES

- Generacion automatica de Sprint Backlog
- Integracion de Tasks + Observations + Findings
- Edicion inline completa
- Persistencia en Supabase (JSONB)
- Exportacion Markdown (editables)
- Exportacion PDF (imprimibles)
- Vista consolidada de tareas tecnicas
- Jerarquia US -> Tasks (1:N)

Listo para integracion con flujos Scrum
```

---

Presentacion generada para HCI-SW-05 | Sistema de Pruebas de Usabilidad con IA