# Usability Dashboard - Project Context

## Project Overview
This project is a **Usability Dashboard** application designed to help UX researchers and product managers manage usability testing processes. It allows for the creation of test plans, definition of tasks, recording of participant observations, and synthesis of findings into actionable reports and a metrics dashboard.

### Main Technologies
- **Framework:** React 19 with Vite.
- **Language:** TypeScript.
- **Backend/Database:** Supabase (PostgreSQL) for data persistence and real-time features.
- **Styling:** Tailwind CSS for responsive and modern UI.
- **Components:** Radix UI primitives and Lucide React icons.
- **Routing:** React Router DOM (v7).

### Architecture
The project follows a clean-ish architecture pattern to separate concerns:
- **`src/domain`**: Contains core entities (`types.ts`) and repository interfaces (`repositories/interfaces.ts`). This is the business logic layer, independent of external frameworks.
- **`src/infrastructure`**: Implements the repository interfaces using Supabase (`repositories/SupabaseRepositories.ts`) and contains the Supabase client configuration (`config/supabase.ts`).
- **`src/presentation`**: The UI layer.
  - **`components/layout`**: Application layout and navigation.
  - **`context`**: React Context for global state management (`TestPlanContext.tsx`).
  - **`pages`**: Individual page components for different steps of the usability testing process (Dashboard, Guide, Record, Synthesis, Reports).
  - **`routes`**: Routing configuration (`AppRouter.tsx`).
- **`src/lib`**: Utility functions (`utils.ts`).

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended).
- A Supabase project with the schema defined in `database.sql`.

### Environment Setup
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Commands
- **Install dependencies:** `npm install`
- **Run development server:** `npm run dev` (Available at `http://localhost:5173`)
- **Build for production:** `npm run build`
- **Lint the codebase:** `npm run lint`
- **Preview production build:** `npm run preview`

## Development Conventions

### Coding Style
- Use **TypeScript** for all new files. Ensure interfaces and types are defined in `src/domain/entities/types.ts`.
- Prefer **Functional Components** with React Hooks.
- Follow the **Clean Architecture** separation: logic in domain, implementation in infrastructure, UI in presentation.
- Use **Tailwind CSS** for all styling. Avoid custom CSS files unless absolutely necessary.
- Components should be kept small and reusable. UI-specific primitives are located in `src/components/ui`.

### State Management
- Local component state is preferred for form inputs and transient data.
- **`TestPlanContext`** is used for sharing test plan data across different pages of the creation/recording wizard.

### Database
- The database schema is defined in `database.sql`. Any changes to the data model should be reflected there first.
- A view `dashboard_metrics` exists in the database to calculate KPIs automatically.

### Contribution Workflow
1. Define the data model in `src/domain/entities/types.ts`.
2. Update the repository interface if necessary in `src/domain/repositories/interfaces.ts`.
3. Implement the repository logic in `src/infrastructure/repositories/SupabaseRepositories.ts`.
4. Create or update page components in `src/presentation/pages`.
5. Ensure proper routing in `src/presentation/routes/AppRouter.tsx`.
