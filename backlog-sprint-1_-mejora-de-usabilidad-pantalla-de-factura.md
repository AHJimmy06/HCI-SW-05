# Sprint Backlog: Sprint 1: Mejora de Usabilidad Pantalla de Factura

**Objetivo:** Mejorar la experiencia de usuario en la pantalla de facturación de Gentleman POS resolviendo problemas críticos de visibilidad, feedback visual y flujo de trabajo identificados en pruebas de usabilidad

## Historias de Usuario

### [US1] Separar visualmente acciones destructivas en pantalla de factura
**Prioridad:** Alta | **Esfuerzo:** 3 pts | **Tipo:** improvement

Como cajero/a, quiero que las acciones peligrosas como cancelar factura estén claramente diferenciadas y separadas de otras acciones para evitar cancelaciones accidentales que afecten la operación.

**Criterios de Aceptación:**
- [ ] El botón 'Cancelar Factura' se encuentra en una ubicación física diferente a los botones de acciones principales
- [ ] El botón Cancelar tiene color rojo distintivo que lo identifica como acción peligrosa
- [ ] Al hacer clic en Cancelar, aparece un modal de confirmación obligatorio antes de ejecutar la acción
- [ ] El modal muestra claramente el mensaje '¿Está seguro que desea cancelar esta factura?' con opciones Aceptar/Cancelar

---

### [US2] Visualizar claramente el alcance de descuentos aplicados
**Prioridad:** Alta | **Esfuerzo:** 5 pts | **Tipo:** feature

Como cajero/a, quiero identificar rápidamente si un descuento es global o por producto específico y ver su impacto en tiempo real para tener control total sobre los ajustes de precio en cada venta.

**Criterios de Aceptación:**
- [ ] Los descuentos globales muestran etiqueta 'Descuento global: -X%' junto al subtotal con color diferenciado
- [ ] Los descuentos por producto muestran etiqueta 'Descuento producto' junto a la línea afectada
- [ ] Los cálculos de descuento se actualizan en tiempo real al aplicar o modificar descuentos
- [ ] Los porcentajes y montos de descuento son claramente legibles con formato numérico consistente

---

### [US3] Recibir confirmación visual tras cancelar factura
**Prioridad:** Alta | **Esfuerzo:** 2 pts | **Tipo:** bugfix

Como cajero/a, quiero recibir retroalimentación visual inmediata cuando cancelo una factura para confirmar que la acción se completó exitosamente y saber que la pantalla está lista para una nueva venta.

**Criterios de Aceptación:**
- [ ] Al cancelar una factura aparece un toast notification con mensaje 'Factura cancelada correctamente'
- [ ] El toast tiene animación de entrada y permanece visible por 3 segundos
- [ ] Tras desaparecer el toast, la pantalla realiza transición visual de limpieza restaurando estado inicial
- [ ] La transición incluye limpieza de todos los campos y reinicio del contador de factura

---

### [US4] Ubicar selector de cliente en zona visible del encabezado
**Prioridad:** Alta | **Esfuerzo:** 5 pts | **Tipo:** improvement

Como cajero/a, quiero poder seleccionar y asociar clientes de forma rápida y visible desde el encabezado de la factura para agilizar el proceso de venta sin buscar el campo en zonas poco intuitivas.

**Criterios de Aceptación:**
- [ ] El selector de cliente está ubicado en la zona superior de la factura cerca del encabezado
- [ ] El campo tiene etiqueta visible 'Cliente:' claramente identificada
- [ ] El selector incluye funcionalidad de autocompletado al escribir el nombre del cliente
- [ ] La búsqueda de clientes devuelve resultados en dropdown con nombre y datos adicionales

---

### [US5] Agregar catálogo visual de productos en pantalla de factura
**Prioridad:** Media | **Esfuerzo:** 8 pts | **Tipo:** feature

Como cajero/a, quiero visualizar los productos en un catálogo con imágenes para seleccionarlos con un clic y reducir errores de digitación, manteniendo la búsqueda por texto como alternativa.

**Criterios de Aceptación:**
- [ ] Existe vista de grid con miniaturas de productos mostrando imagen, nombre y precio
- [ ] La selección de producto desde el catálogo lo agrega directamente a la factura con un clic
- [ ] La búsqueda por texto permanece disponible como método alternativo
- [ ] El catálogo permite filtrado por categorías o secciones de productos

---

## Tareas Técnicas

| ID | Descripción | Estimado |
|----|-------------|----------|
| T1 | Refactorizar layout de pantalla de factura: reposicionar botón Cancelar a zona inferior derecha separada | 3h |
| T2 | Implementar estilos CSS diferenciados para acciones peligrosas: color rojo, icono de warning | 2h |
| T3 | Crear componente ModalConfirmacion reutilizable con mensaje personalizable | 4h |
| T4 | Implementar etiquetas visuales diferenciadas para descuentos (global vs producto) con estilos CSS | 4h |
| T5 | Agregar cálculo de impacto en tiempo real en modelo de datos de factura | 3h |
| T6 | Implementar componente Toast notification con animaciones y temporizador de 3 segundos | 3h |
| T7 | Crear función de limpieza de pantalla y reinicio de estado tras cancelación | 2h |
| T8 | Reubicar selector de cliente en zona superior del encabezado de factura | 3h |
| T9 | Implementar autocompletado en selector de cliente con endpoint de búsqueda | 5h |
| T10 | Crear componente catálogo visual tipo grid con lazy loading de imágenes | 8h |
| T11 | Implementar lógica de agregar producto a factura desde click en catálogo | 4h |
| T12 | Agregar filtrado por categorías en catálogo de productos | 3h |
