# Sprint Backlog AI - Arquitectura y Diagramas

> Documentación visual usando Mermaid para GitHub y herramientas compatibles

---

## 1. Arquitectura de Componentes

```mermaid
graph TB
    subgraph Presentation["Capa de Presentación"]
        SBP[SprintBacklogPage.tsx]
        HDR[Header Bar]
        SID[Sidebar Config]
        EDT[Editor Area]
        TABS[Tabs: Stories or Tasks]
    end

    subgraph Domain["Capa de Dominio"]
        SBG[SprintBacklogGenerator.ts]
        TYPES[types.ts]
    end

    subgraph Infrastructure["Capa de Infraestructura"]
        REPO[SupabaseTestPlanRepository]
        DB[(Supabase JSONB)]
        AI[chatCompletion - MiniMax]
    end

    SBP -->|1. Load Plan| REPO
    REPO -->|2. getFullPlan| DB
    SBP -->|3. Generate| SBG
    SBG -->|4. Chat| AI
    AI -->|5. JSON Backlog| SBG
    SBG -->|6. SprintBacklog| SBP
    SBP -->|7. Save| REPO
    REPO -->|8. JSONB| DB

    HDR ---|Config UI| SID
    SID ---|State| EDT
    EDT --> TABS
```

---

## 2. Flujo de Generación de Sprint Backlog

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as SprintBacklogPage
    participant G as SprintBacklogGenerator
    participant AI as MiniMax-M2.7
    participant R as Supabase Repo

    U->>P: Accede a /sprint-backlog/:testPlanId
    P->>R: getFullPlan(testPlanId)
    R-->>P: FullTestPlan { tasks, observations, findings }
    P->>P: ¿Existe backlog previo?
    alt No existe
        P->>G: generateSprintBacklog(fullPlan)
        G->>G: buildPrompt(plan)
        Note over G: 1. Tasks (Guía)<br/>2. Observations (Registro)<br/>3. Findings (Síntesis)
        G->>AI: chatCompletion(messages)
        AI-->>G: JSON String
        G->>G: JSON.parse() + validación
        G-->>P: SprintBacklog
        P->>R: saveSprintBacklog(testPlanId, backlog)
    else Existe
        P-->>P: Muestra backlog cargado
    end
    U->>P: Edita campos (inline)
    P->>P: updateState()
    U->>P: Exportar (MD/PDF)
    P->>P: Genera y descarga archivo
```

---

## 3. Modelo de Datos (Relación Jerárquica)

```mermaid
classDiagram
    class SprintBacklog {
        +string sprint_nombre
        +string objetivo_sprint
        +number duracion_sprint_dias
        +string notas_organizacion
        +BacklogUserStory[] historias_usuario
    }

    class BacklogUserStory {
        +string id
        +string titulo
        +string descripcion
        +string[] criterio_aceptacion
        +string prioridad
        +string esfuerzo
        +string tipo
        +BacklogTask[] tareas_tecnicas
    }

    class BacklogTask {
        +string id
        +string descripcion
        +number estimado_horas
    }

    SprintBacklog "1" o-- "N" BacklogUserStory : contiene
    BacklogUserStory "1" o-- "N" BacklogTask : desglosa
```

---

## 4. Estados de la UI

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Error: API fail / load error
    Loading --> Generating: No backlog exists
    Loading --> Ready: Backlog found
    Generating --> Ready: AI returns valid JSON
    Generating --> Error: Invalid JSON / timeout
    Ready --> Editing: User edits field
    Editing --> Ready: Field updated
    Ready --> Exporting: User clicks export
    Exporting --> Ready: Download complete
    Error --> Loading: Retry
```

---

## 5. Flujo de Exportación

```mermaid
flowchart LR
    A[SprintBacklog State] --> B{Formato?}
    B -->|Markdown| C[buildMarkdownString]
    B -->|PDF| D[jsPDF + autoTable]
    C --> E[Blob + URL.createObjectURL]
    D --> F[doc.save]
    E --> G[anchor.download]
    F --> G
    G --> H[Download File]
```

---

## 6. Estructura de Archivos

```mermaid
graph TD
    DOC[documentacion/]
    DOC --> README
    DOC --> SPRINT_IA[SPRINT-BACKLOG-IA.md]
    DOC --> SPRINT_ARQ[SPRINT-BACKLOG-ARQUITECTURA.md]
    DOC --> SPRINT_DIAP[SPRINT-BACKLOG-DIAPOS.md]
    DOC --> DIAP[DIAPOSITIVAS/]
    DIAP --> PRES[PRESENTACION-SPRINT-BACKLOG.md]

    SRC[src/]
    SRC --> DOMAIN[domain/]
    DOMAIN --> TYPES[entities/types.ts]
    DOMAIN --> SBG[services/SprintBacklogGenerator.ts]
    SRC --> PRESENT[presentation/]
    PRESENT --> SBP[pages/SprintBacklogPage.tsx]
    SRC --> INFRA[infrastructure/]
    INFRA --> REPO[repositories/SupabaseRepositories.ts]
```

---

## 7. Esquema JSON - Campos Obligatorios

```mermaid
erDiagram
    SprintBacklog ||--o{ BacklogUserStory : "historias_usuario"
    BacklogUserStory ||--o{ BacklogTask : "tareas_tecnicas"

    SprintBacklog {
        string sprint_nombre PK
        string objetivo_sprint
        number duracion_sprint_dias
        string notas_organizacion
    }

    BacklogUserStory {
        string id PK
        string titulo
        string descripcion
        string[] criterio_aceptacion
        string prioridad
        string esfuerzo
        string tipo
    }

    BacklogTask {
        string id PK
        string descripcion
        number estimado_horas
    }
```

---

## 8. Diagrama de Flujo de Datos

```mermaid
flowchart TB
    subgraph Input["Entrada: FullTestPlan"]
        P["product_name"]
        M["module_name"]
        O["objective"]
    end

    subgraph Guide["Guía - Tasks"]
        T1["Tarea 1"]
        T2["Tarea 2"]
        Tn["Tarea N"]
    end

    subgraph Record["Registro - Observations"]
        OBS1["Observation 1"]
        OBS2["Observation 2"]
        OBSn["Observation N"]
    end

    subgraph Synthesis["Síntesis - Findings"]
        F1["Finding 1"]
        F2["Finding 2"]
        Fn["Finding N"]
    end

    subgraph AI["MiniMax-M2.7"]
        PROMPT["buildPrompt()"]
        RESP["JSON Response"]
    end

    subgraph Output["Salida: SprintBacklog"]
        SN["sprint_nombre"]
        OS["objetivo_sprint"]
        DSD["duracion_sprint_dias"]
        NO["notas_organizacion"]
        US1["US1 + Tasks"]
        US2["US2 + Tasks"]
        USn["USn + Tasks"]
    end

    P & M & O --> PROMPT
    T1 & T2 & Tn --> PROMPT
    OBS1 & OBS2 & OBSn --> PROMPT
    F1 & F2 & Fn --> PROMPT
    PROMPT --> AI
    AI --> RESP
    RESP --> SN & OS & DSD & NO
    RESP --> US1 & US2 & USn
```

---

## 9. Endpoints de Supabase (Implicados)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant SB as Supabase
    participant PG as PostgreSQL

    FE->>SB: saveSprintBacklog(testPlanId, backlog)
    SB->>PG: INSERT/UPDATE sprint_backlogs
    PG-->>SB: JSONB stored
    SB-->>FE: success

    FE->>SB: getSprintBacklog(testPlanId)
    SB->>PG: SELECT sprint_backlogs
    PG-->>SB: JSONB retrieved
    SB-->>FE: SprintBacklog
```

---

## 10. Parámetros de Configuración IA

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `model` | `MiniMax-M2.7` | Modelo de chat |
| `temperature` | `0.3` | Baja variabilidad |
| `max_tokens` | `8192` | Contexto amplio |
| `system_role` | PO Experto Scrum | Define comportamiento |

---

*Diagramas generados con Mermaid para compatibilidad con GitHub Markdown*