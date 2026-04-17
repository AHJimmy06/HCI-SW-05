# Sustentación de Proyecto - Grupo 8
## Módulo: User Flow y Navegación

Este documento detalla las mejoras funcionales, visuales y técnicas implementadas en el **Usability Test Dashboard** siguiendo los principios de Interacción Humano-Computador (IHC) y Diseño Centrado en el Usuario (DCU).

---

### 1. Análisis del Problema (IHC 5.1)
Se detectó que el flujo original presentaba:
*   **Riesgo de pérdida de datos**: El estado vivía solo en memoria; un refresco de página borraba todo el progreso.
*   **Rigidez en la navegación**: El usuario no tenía un mapa visual de su progreso ni feedback claro sobre por qué no podía avanzar.
*   **Metáforas inconsistentes**: Confusión entre etiquetas de usuario y nombres técnicos en el código.

### 2. Propuesta de Mejora (DCU 5.2)
Diseñamos una experiencia **segura y fluida** para el UX Researcher (perfil de usuario), basada en:
*   **Persistencia Híbrida**: LocalStorage para borradores y Supabase para el cierre final.
*   **Navegación Visual (Stepper)**: Un indicador de progreso constante.
*   **Prevención de Errores Proactiva**: Validaciones en tiempo real con feedback visual inmediato.

### 3. Implementación Funcional (5.4)

#### A. Gestión de Navegación e IHC
*   **Componente `NavigationStepper`**: Implementado en la cabecera para reducir la carga cognitiva. El usuario siempre sabe dónde está (Ley de Continuidad de Gestalt).
*   **Navegación No-Lineal**: Libertad para regresar a pasos anteriores sin restricciones, manteniendo la integridad del flujo hacia adelante.

#### B. Persistencia y Seguridad
*   **Auto-save (Drafts)**: Implementación de guardado automático en `localStorage` cada 2 segundos (debounced).
*   **Banner de Recuperación**: Al iniciar la app, se detectan sesiones pendientes, permitiendo al usuario retomar su trabajo sin frustración.
*   **Idempotencia en Base de Datos**: Refactorización de repositorios a lógica `upsert` para evitar duplicados en Supabase ante múltiples pulsaciones o re-renderizados.

#### C. Validación y Feedback Visual
*   **Señalización de Obligatoriedad**: Uso de asteriscos (`*`) y bordes de color (`border-red-500`) según el estado de validación.
*   **Botones Inteligentes**:
    *   **Estado Blocked**: El botón "Siguiente" se visualiza en gris cuando el paso es inválido.
    *   **Haptic Feedback Visual**: Si el usuario intenta forzar el avance, el botón ejecuta una **animación de sacudida (shake)**, reforzando el impedimento de forma no intrusiva.

### 4. Accesibilidad y Estándares (5.6)
*   **Atributos ARIA**: Implementación de `aria-required`, `aria-invalid` y `role="alert"` para compatibilidad con lectores de pantalla.
*   **Navegación por Teclado**: Todo el flujo de navegación es accesible mediante `Tab` y `Enter`.
*   **Contraste**: Colores ajustados para cumplir con niveles de legibilidad WCAG.

---

### 5. Comparativa: Antes vs. Después (5.7)

| Característica | Estado Inicial | Mejora Grupo 8 |
| :--- | :--- | :--- |
| **Persistencia** | Volátil (Memoria) | Persistente (LocalStorage + Supabase) |
| **Mapa de Progreso** | Inexistente | Navigation Stepper Visual |
| **Prevención de Error** | Reactiva (al final) | Proactiva (mientras el usuario escribe) |
| **Integridad de Datos** | Riesgo de duplicados | Repositorios Idempotentes (Upsert) |
| **Feedback de Botón** | Titilante/Inconsistente | Shake Animation + Estado bloqueado sutil |

---
**Proyecto desarrollado con Rigor Técnico y Foco en el Usuario.**
*Abril 2026*
