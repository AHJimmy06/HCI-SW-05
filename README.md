# Usability Dashboard - Herramienta de Evaluación IHC

## Descripción del Proyecto
El **Usability Dashboard** es una aplicación diseñada para facilitar la gestión, registro y análisis de pruebas de usabilidad en el marco de la **Interacción Humano-Computadora (IHC)**. Esta herramienta permite a los investigadores y diseñadores de UX:
- Crear y editar planes de prueba estructurados.
- Generar guías de moderación consistentes.
- Registrar observaciones y métricas de rendimiento en tiempo real.
- Sintetizar hallazgos y priorizar mejoras basadas en severidad y frecuencia.
- Visualizar KPIs clave (Efectividad, Eficiencia y Satisfacción) alineados con la norma **ISO 9241-11**.

## Tecnologías Utilizadas
- **Frontend:** React 19 + Vite.
- **Lenguaje:** TypeScript.
- **Estilos:** Tailwind CSS.
- **Componentes UI:** shadcn/ui (basado en Radix UI).
- **Backend/Base de Datos:** Supabase (PostgreSQL).
- **Iconografía:** Lucide React.
- **Enrutamiento:** React Router DOM v7.

## Requisitos Previos
Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/).

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/AHJimmy06/HCI-SW-05.git
   cd usability-dashboard
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Base de Datos:**
   Ejecuta el script `database.sql` en el SQL Editor de tu proyecto Supabase para crear las tablas, vistas y políticas necesarias.

## Ejecución

- **Modo Desarrollo:**
  ```bash
  npm run dev
  ```
  La aplicación estará disponible en `http://localhost:5173`.

- **Construcción para Producción:**
  ```bash
  npm run build
  ```

- **Previsualizar Build:**
  ```bash
  npm run preview
  ```

## Estructura del Proyecto
- `src/domain`: Entidades y definiciones de interfaces de repositorios (Lógica de negocio).
- `src/infrastructure`: Implementaciones de repositorios (Supabase) y configuración de servicios externos.
- `src/presentation`: Componentes de UI, páginas, contexto y rutas.
- `src/lib`: Utilidades y helpers.

## Contribución
Este proyecto sigue estándares de IHC para garantizar una experiencia de usuario óptima. Al contribuir, asegúrate de mantener la consistencia visual y seguir los principios de visibilidad del estado del sistema y prevención de errores.

---
© 2026 Usability Dashboard - Proyecto de Interacción Humano-Computador
