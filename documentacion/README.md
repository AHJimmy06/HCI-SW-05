# Documentacion del Proyecto HCI-SW-05

Sistema de Pruebas de Usabilidad con Asistente IA para Generacion de Sprint Backlogs

## Estructura de Documentacion

```
documentacion/
├── README.md                              (Este archivo - Indice principal)
├── SPRINT-BACKLOG-IA.md                   (Documentacion tecnica del modulo IA)
├── SPRINT-BACKLOG-ARQUITECTURA.md         (Diagramas de arquitectura - Mermaid)
├── SPRINT-BACKLOG-DIAPOS.md               (Presentacion visual para GitHub)
└── DIAPOSITIVAS/
    └── PRESENTACION-SPRINT-BACKLOG.md     (Presentacion completa para diapositivas)
```

## Modulos Documentados

### 1. Sprint Backlog Asistido por IA

| Recurso | Descripcion |
|---------|-------------|
| SPRINT-BACKLOG-IA.md | Guia tecnica: parametros, prompts, JSON schema, exportacion |
| SPRINT-BACKLOG-ARQUITECTURA.md | Diagramas de flujo, estado y arquitectura (Mermaid) |
| SPRINT-BACKLOG-DIAPOS.md | Presentacion visual formateada para GitHub |
| DIAPOSITIVAS/PRESENTACION-SPRINT-BACKLOG.md | Diapositivas completas para presentacion |

## Quick Start

### Flujo del Modulo IA

```
Plan de Prueba -> Guia (Tareas) -> Registro (Observaciones) -> Sintesis (Findings) -> Sprint Backlog
     ^-----------------------------------------------------------------------------------------------------+
                                      |
                              Generacion IA
                                      |
                         +------------+------------+
                         |                         |
                   Editable                   Exportable
                   (JSON state)               (MD / PDF)
```

### Comandos de Exportacion

```typescript
// Exportar a Markdown
handleExportMarkdown() // Genera archivo .md descargable

// Exportar a PDF
handleExportPDF() // Genera archivo .pdf con jsPDF
```

---

Generado automaticamente para el proyecto HCI-SW-05
Sistema de Pruebas de Usabilidad con IA