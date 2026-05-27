# 📚 Documentación del Proyecto HCI-SW-05

> Sistema de Pruebas de Usabilidad con Asistente IA para Generación de Sprint Backlogs

## 📂 Estructura de Documentación

```
documentacion/
├── README.md                              # Este archivo - Índice principal
├── SPRINT-BACKLOG-IA.md                   # Documentación técnica del módulo IA
├── SPRINT-BACKLOG-ARQUITITECTURA.md       # Diagramas de arquitectura (Mermaid)
├── SPRINT-BACKLOG-DIAPOS.md               # Presentación visual para GitHub
└── DIAPOSITIVAS/
    └── PRESENTACION-SPRINT-BACKLOG.md     # Presentación completa para diapositivas
```

## 🎯 Módulos Documentados

### 1. Sprint Backlog Asistido por IA

| Recurso | Descripción |
|---------|-------------|
| [SPRINT-BACKLOG-IA.md](./SPRINT-BACKLOG-IA.md) | Guía técnica: parámetros, prompts, JSON schema, exportación |
| [SPRINT-BACKLOG-ARQUITECTURA.md](./SPRINT-BACKLOG-ARQUITECTURA.md) | Diagramas de flujo, estado y arquitectura (Mermaid) |
| [SPRINT-BACKLOG-DIAPOS.md](./SPRINT-BACKLOG-DIAPOS.md) | Presentación visual formateada para GitHub |
| [DIAPOSITIVAS/PRESENTACION-SPRINT-BACKLOG.md](./DIAPOSITIVAS/PRESENTACION-SPRINT-BACKLOG.md) | Diapositivas completas para presentación |

## 🚀 Quick Start

### Flujo del Módulo IA
```
Plan de Prueba → Guía (Tareas) → Registro (Observaciones) → Síntesis (Findings) → Sprint Backlog
     ↑─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                              Generación IA
                                      │
                         ┌────────────┴────────────┐
                         ↓                         ↓
                   Editable ✓                 Exportable ✓
                   (JSON state)               (MD / PDF)
```

### Comandos de Exportación

```typescript
// Exportar a Markdown
handleExportMarkdown() // Genera archivo .md descargable

// Exportar a PDF
handleExportPDF() // Genera archivo .pdf con jsPDF
```

---

*Generado automáticamente para el proyecto HCI-SW-05*
*Sistema de Pruebas de Usabilidad con IA*