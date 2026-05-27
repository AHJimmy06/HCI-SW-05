# Sprint Backlog: Sprint 1: Mejoras de Usabilidad en Pantalla de Factura

**Objetivo:** Resolver hallazgos críticos de usabilidad en la pantalla de facturación para incrementar la eficiencia operativa del cajero y reducir errores durante la cancelación de facturas, aplicación de descuentos y selección de cliente.

**Duración:** undefined días

**Notas de Organización:**
TEST

## Historias de Usuario

### [US1] Separar y proteger la acción de cancelar factura
**Prioridad:** Alta | **Esfuerzo:** 5 pts | **Tipo:** improvement

Como cajero/a, quiero que las acciones destructivas de cancelar factura estén claramente separadas y protegidas para evitar cancelaciones accidentales que interrumpan el flujo de venta.

**Criterios de Aceptación:**
- [ ] El botón de cancelar factura se encuentra en una ubicación física distinta a los botones de acciones principales
- [ ] El botón de cancelar factura posee color diferenciado (rojo) que indica peligro
- [ ] Al hacer clic en cancelar se muestra un modal de confirmación obligatorio con descripción clara de la acción
- [ ] El modal incluye dos opciones: 'Cancelar factura' (confirmar) y 'Volver' (abortar)
- [ ] La acción de cancelar factura solo se ejecuta tras confirmación explícita del usuario

**Tareas Técnicas:**
| ID | Descripción | Estimado |
|----|-------------|----------|
| T1.1 | Reubicar el botón de cancelar factura al área inferior derecha de la pantalla de factura, alejado de las acciones de cobro y agregar ticket | 3h |
| T1.2 | Aplicar estilos CSS de color rojo con icono de advertencia al botón de cancelar factura para diferenciación visual | 2h |
| T1.3 | Implementar componente modal de confirmación con mensaje descriptivo y botones de acción (confirmar/volver), incluyendo validación de estado de factura activa antes de mostrar | 4h |
| T1.4 | Integrar lógica de limpieza de pantalla y reseteo de estado tras confirmación exitosa de cancelación, incluyendo invalidación de número de factura cancelada en backend | 3h |

---

### [US2] Visualizar de forma clara el alcance de los descuentos aplicados
**Prioridad:** Alta | **Esfuerzo:** 5 pts | **Tipo:** feature

Como cajero/a, quiero visualizar claramente qué tipo de descuento se aplicó y sobre qué alcance tiene efecto para evitar confusiones con el cliente y garantizar transparencia en la transacción.

**Criterios de Aceptación:**
- [ ] El descuento global se muestra con etiqueta 'Descuento global' junto al subtotal con valor negativo y porcentaje visible
- [ ] El descuento por producto se muestra con etiqueta 'Descuento producto' junto a la línea afectada en la lista de artículos
- [ ] El impacto del descuento se calcula y muestra en tiempo real al aplicar o modificar cualquier descuento
- [ ] Los totales finales reflejan correctamente la suma de todos los descuentos aplicados sin ambigüedad
- [ ] Las etiquetas de descuento utilizan iconografía diferenciada (etiqueta global vs. etiqueta producto)

**Tareas Técnicas:**
| ID | Descripción | Estimado |
|----|-------------|----------|
| T2.1 | Modificar el componente de línea de producto para incluir campo de etiqueta 'Descuento producto' cuando aplique, mostrando el valor descontado junto al nombre del producto afectado | 4h |
| T2.2 | Agregar fila de resumen 'Descuento global' en la sección de totales de la factura, calculando dinámicamente el monto total descontado y mostrándolo con formato de moneda negativa | 3h |
| T2.3 | Implementar lógica de cálculo en tiempo real (real-time calculation) que actualice tanto descuentos por producto como globales cada vez que se modifique una línea o se aplique un cupón | 4h |
| T2.4 | Agregar iconografía SVG diferenciada para descuentos globales (etiqueta con símbolo %) y descuentos por producto (etiqueta con símbolo item) para refuerzo visual | 2h |

---

### [US3] Mostrar retroalimentación visual tras cancelar una factura
**Prioridad:** Alta | **Esfuerzo:** 3 pts | **Tipo:** improvement

Como cajero/a, quiero recibir confirmación visual clara cuando una factura es cancelada exitosamente para tener certeza de que la operación se completó y el sistema quedó limpio para una nueva venta.

**Criterios de Aceptación:**
- [ ] Tras confirmar la cancelación se muestra un toast de notificación con mensaje 'Factura cancelada correctamente'
- [ ] El toast permanece visible durante 3 segundos con animación de entrada y salida
- [ ] La pantalla de factura realiza transición visual de limpieza (reset de campos, limpieza del detalle de productos)
- [ ] El número de factura cancelada se registra como invalidado en el backend
- [ ] El sistema queda listo para iniciar una nueva factura sin datos residuales

**Tareas Técnicas:**
| ID | Descripción | Estimado |
|----|-------------|----------|
| T3.1 | Implementar componente ToastNotification con soporte para animación de entrada (slide-in desde arriba) y salida (fade-out) con duración configurable de 3 segundos | 3h |
| T3.2 | Integrar el toast de éxito en el flujo post-confirmación del modal de cancelar, invocando el servicio de cancelación en backend y mostrando la notificación solo tras respuesta exitosa | 2h |
| T3.3 | Implementar función de reset del estado del componente de factura que limpie el array de productos, resetee totales, limpie el campo de cliente y genere nuevo número de factura | 3h |

---

### [US4] Reposicionar y mejorar la visibilidad del selector de cliente
**Prioridad:** Alta | **Esfuerzo:** 4 pts | **Tipo:** improvement

Como cajero/a, quiero que el selector de cliente esté visible en la zona superior de la pantalla de factura para seleccionarlo rápidamente al inicio de cada operación sin buscarlo dentro del formulario.

**Criterios de Aceptación:**
- [ ] El selector de cliente se ubica en la zona superior de la pantalla de factura, junto al encabezado de la factura
- [ ] El campo muestra una etiqueta visible 'Cliente:' que indica su propósito
- [ ] El campo incluye funcionalidad de autocompletado con sugerencias al escribir al menos 2 caracteres
- [ ] El selector muestra el nombre del cliente seleccionado actualmente
- [ ] El campo permite tanto selección desde lista como escritura libre para clientes anónimos

**Tareas Técnicas:**
| ID | Descripción | Estimado |
|----|-------------|----------|
| T4.1 | Reubicar el componente CustomerSelector al área del encabezado de la factura, arriba de la lista de productos, incluyendo etiqueta descriptiva 'Cliente:' | 3h |
| T4.2 | Implementar funcionalidad de autocompletado (autocomplete debounced a 300ms) que consuma endpoint GET /api/customers/search?query={term} y muestre dropdown con hasta 5 resultados | 5h |
| T4.3 | Agregar estado visual de cliente seleccionado que muestre nombre y allow clearing (opción de quitar cliente) con icono de X para clientes anónimos | 2h |
| T4.4 | Persistir la selección de cliente en el estado local de la factura y enviarlo al backend al momento de generar la transacción | 2h |

---

### [US5] Agregar catálogo visual de productos en la pantalla de factura
**Prioridad:** Media | **Esfuerzo:** 8 pts | **Tipo:** feature

Como cajero/a, quiero visualizar un catálogo de productos en formato grid con imágenes y precios para buscar y agregar productos rápidamente sin depender únicamente de la búsqueda por texto.

**Criterios de Aceptación:**
- [ ] Se muestra una vista de grid con miniaturas de productos (imagen, nombre y precio) en la zona lateral o inferior de la pantalla de factura
- [ ] Cada producto del grid permite ser agregado a la factura con un solo clic
- [ ] El grid incluye scroll y paginación para productos con más de 12 ítems visibles
- [ ] El campo de búsqueda por texto sigue disponible como alternativa al grid visual
- [ ] Los productos se agrupan por categoría con tabs de filtrado para facilitar la navegación

**Tareas Técnicas:**
| ID | Descripción | Estimado |
|----|-------------|----------|
| T5.1 | Crear componente ProductCatalogGrid que renderice productos en formato de cards (imagen thumbnail 64x64, nombre truncado a 2 líneas, precio formateado) con layout responsive de grid CSS | 6h |
| T5.2 | Implementar servicio de consumo GET /api/products?category={cat}&page={page}&limit=12 que cargue productos paginados y consuma endpoint de imágenes optimizadas con lazy loading | 4h |
| T5.3 | Agregar sistema de tabs de categoría (Bebidas, Comida, Extras, etc.) con filtro en el grid y scroll vertical con altura fija para mantener la usabilidad dentro de la pantalla de factura | 4h |
| T5.4 | Integrar evento onClick en cada card de producto que ejecute la función addToInvoice(product) y muestre feedback visual (highlight) temporal de 500ms confirmando la adición | 3h |

---

