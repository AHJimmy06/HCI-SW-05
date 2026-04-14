# APE 2: Aplicación Detallada de Metáforas en la Interfaz de Usuario

**Institución:** Universidad Técnica de Ambato  
**Carrera:** Software  
**Asignatura:** Interacción Humano - Computador  
**Proyecto:** Usability Dashboard

---

## 1. Breve Conceptualización

Las metáforas de interfaz actúan como modelos mentales que permiten al usuario operar un sistema desconocido utilizando reglas de un dominio conocido. En este proyecto, transformamos la gestión técnica de datos de usabilidad en un flujo de trabajo de "Misión de Campo", haciendo que el investigador se sienta como un navegante o documentalista en lugar de un analista de datos.

---

## 2. Análisis Detallado por Metáfora

### 1. Tablero de Control (Dashboard)

| Metáfora               | Concepto del Mundo Real                      | Icono Sugerido    | Función en el Sistema                         |
| :--------------------- | :------------------------------------------- | :---------------- | :-------------------------------------------- |
| **Tablero de Control** | Panel de instrumentos de un vehículo o nave. | `LayoutDashboard` | Vista global de métricas y KPIs del proyecto. |

- **Análisis Lingüístico:** Se utiliza el término "Tablero" en lugar de "Index" o "Main Page". La palabra evoca la consola de mando donde se visualizan indicadores críticos de forma inmediata. Evita el uso de tecnicismos como "Vistas agregadas".
- **Análisis Computacional:** Es un módulo de agregación de datos que ejecuta consultas `COUNT` y `AVG` en la tabla `test_results` de Supabase. El estado se refresca en tiempo real para reflejar cambios en los indicadores de rendimiento.

---

### 2. Plan de Vuelo (Test Plan)

| Metáfora          | Concepto del Mundo Real                               | Icono Sugerido  | Función en el Sistema                         |
| :---------------- | :---------------------------------------------------- | :-------------- | :-------------------------------------------- |
| **Plan de Vuelo** | Preparación detallada de una ruta y logística previa. | `ClipboardList` | Formulario de configuración inicial del test. |

- **Análisis Lingüístico:** El término "Plan de Vuelo" sugiere que antes de iniciar el test (despegar), se deben definir coordenadas y objetivos. Sustituye al seco "Formulario de Configuración".
- **Análisis Computacional:** Implementa el patrón `Context` en React para capturar datos de formularios. Valida que los campos obligatorios estén llenos antes de permitir la transición a la siguiente página del wizard.

---

### 3. Guía del Capitán (Moderator Guide)

| Metáfora             | Concepto del Mundo Real                                  | Icono Sugerido | Función en el Sistema                                    |
| :------------------- | :------------------------------------------------------- | :------------- | :------------------------------------------------------- |
| **Guía del Capitán** | Manual de instrucciones paso a paso para la tripulación. | `BookOpen`     | Despliegue de guiones para el moderador durante el test. |

- **Análisis Lingüístico:** Transforma un guion estático en un manual de instrucciones de misión. La palabra "Capitán" otorga autoridad al moderador y sugiere que el éxito depende de seguir estos pasos.
- **Análisis Computacional:** Es una vista de solo lectura que consume datos filtrados por `test_plan_id`. Optimiza el renderizado para dispositivos móviles para lectura ágil durante la observación.

---

### 4. Bitácora de Campo (Observation Record)

| Metáfora              | Concepto del Mundo Real                            | Icono Sugerido | Función en el Sistema                                |
| :-------------------- | :------------------------------------------------- | :------------- | :--------------------------------------------------- |
| **Bitácora de Campo** | Diario de notas tomadas por un explorador en vivo. | `Edit3`        | Registro de observaciones durante la sesión de test. |

- **Análisis Lingüístico:** Evoca la imagen de un explorador tomando notas en un diario físico. Implica que el tiempo y la secuencia de los eventos son fundamentales para la validez de los datos.
- **Análisis Computacional:** Genera eventos de guardado automático (Auto-save) mediante suscripciones a cambios de estado. Mapea cada nota a una marca de tiempo relativa al inicio de la sesión.

---

### 5. El Tamiz (Synthesis)

| Metáfora                 | Concepto del Mundo Real                                 | Icono Sugerido |               Función en el Sistema               |
| :----------------------- | :------------------------------------------------------ | :------------- | :-----------------------------------------------: |
| **El Tamiz (Synthesis)** | Herramienta para separar material valioso de impurezas. | `Filter`       | Módulo de síntesis de hallazgos y categorización. |

- **Análisis Lingüístico:** En lugar de "Agrupar datos", usamos la idea de un Tamiz. Sugiere separar la "arena" (datos irrelevantes) del "oro" (hallazgos críticos de usabilidad).
- **Análisis Computacional:** Algoritmo de categorización. Permite al usuario mover elementos entre categorías, actualizando la clave foránea de cada observación en la base de datos de forma transaccional.

---

### 6. Semáforo de Gravedad (Metrics)

| Metáfora                 | Concepto del Mundo Real                             | Icono Sugerido | Función en el Sistema                         |
| :----------------------- | :-------------------------------------------------- | :------------- | :-------------------------------------------- |
| **Semáforo de Gravedad** | Sistema de luces universal para control de tráfico. | `TrafficLight` | Indicadores visuales de severidad de errores. |

- **Análisis Lingüístico:** Utiliza el código de colores universal (Rojo, Amarillo, Verde) para comunicar urgencia sin necesidad de leer valores numéricos complejos.
- **Análisis Computacional:** Lógica condicional basada en rangos de severidad. Mapea valores numéricos (0-4) a estilos CSS dinámicos para feedback visual inmediato.

---

### 7. Lupa de Auditoría (Search/Details)

| Metáfora              | Concepto del Mundo Real                              | Icono Sugerido | Función en el Sistema                                   |
| :-------------------- | :--------------------------------------------------- | :------------- | :------------------------------------------------------ |
| **Lupa de Auditoría** | Instrumento óptico para examen detallado de objetos. | `Search`       | Herramienta de búsqueda y profundización de evidencias. |

- **Análisis Lingüístico:** La "Lupa" indica la capacidad de profundizar en un punto específico. Invita al usuario a "mirar de cerca" la evidencia recolectada.
- **Análisis Computacional:** Ejecuta una búsqueda de texto completo (Full Text Search). Filtra resultados dinámicamente según el usuario interactúa con la entrada de búsqueda.

---

### 8. Archivo Histórico (History)

| Metáfora              | Concepto del Mundo Real                               | Icono Sugerido | Función en el Sistema                      |
| :-------------------- | :---------------------------------------------------- | :------------- | :----------------------------------------- |
| **Archivo Histórico** | Custodia física de documentos antiguos para consulta. | `Briefcase`    | Gestión de proyectos pasados y archivados. |

- **Análisis Lingüístico:** Sugiere que los proyectos pasados no se pierden, sino que se guardan en un archivo para consulta futura. Refuerza la idea de custodia de conocimiento.
- **Análisis Computacional:** Gestión de estados de visibilidad (`is_archived: boolean`). Filtra los proyectos activos de los archivados mediante una cláusula `WHERE` en la consulta a Supabase.

---

## 3. Conclusiones y Mejoras Sugeridas

- **Consistencia:** El uso de un lenguaje cohesivo crea un ecosistema narrativo que guía al usuario intuitivamente.
- **Validación:** Los iconos de Lucide React refuerzan visualmente la metáfora, reduciendo la carga cognitiva del investigador UX.
