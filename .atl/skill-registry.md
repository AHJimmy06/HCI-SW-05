# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Supabase products, client libraries, RLS, migrations | supabase | C:\Users\LENOVO\.agents\skills\supabase\SKILL.md |
| Postgres performance optimization, schema design | supabase-postgres-best-practices | C:\Users\LENOVO\.agents\skills\supabase-postgres-best-practices\SKILL.md |
| Single Responsibility Principle | solid-srp | C:\Users\LENOVO\.gemini\skills\solid-srp\SKILL.md |
| Open/Closed Principle | solid-ocp | C:\Users\LENOVO\.gemini\skills\solid-ocp\SKILL.md |
| Liskov Substitution Principle | solid-lsp | C:\Users\LENOVO\.gemini\skills\solid-lsp\SKILL.md |
| Interface Segregation Principle | solid-isp | C:\Users\LENOVO\.gemini\skills\solid-isp\SKILL.md |
| Dependency Inversion Principle | solid-dip | C:\Users\LENOVO\.gemini\skills\solid-dip\SKILL.md |
| Strategy pattern, interchangeable algorithms | pattern-strategy | C:\Users\LENOVO\.gemini\skills\pattern-strategy\SKILL.md |
| Factory Method pattern | pattern-factory-method | C:\Users\LENOVO\.gemini\skills\pattern-factory-method\SKILL.md |
| Observer pattern, event notification | pattern-observer | C:\Users\LENOVO\.gemini\skills\pattern-observer\SKILL.md |
| GitHub issues, bug reports, feature requests | issue-creation | C:\Users\LENOVO\.gemini\skills\issue-creation\SKILL.md |
| PR creation workflow | branch-pr | C:\Users\LENOVO\.gemini\skills\branch-pr\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### supabase
- Verify against current docs before implementing; API conventions change frequently.
- Enable RLS by default on every table in exposed schemas (especially `public`).
- Never use `user_metadata` for authorization; use `app_metadata` or `raw_app_meta_data` instead.
- Views bypass RLS by default; use `WITH (security_invoker = true)` on Postgres 15+.
- Storage upsert requires INSERT + SELECT + UPDATE permissions.
- Create migrations via `supabase migration new <name>` or `supabase db pull <name> --local`.
- Use `supabase db advisors` to audit schema security and performance.

### solid-principles
- SRP: One reason to change. Split classes that handle multiple responsibilities (e.g., UI + Data Fetching).
- OCP: Extend behavior via composition or polymorphism instead of modifying existing code.
- LSP: Subclasses must be usable through their base class interface without unexpected behavior.
- ISP: Prefer many small, specific interfaces over one large, general-purpose interface.
- DIP: High-level modules (domain) should not depend on low-level modules (infrastructure). Use interfaces.

### design-patterns
- Strategy: Use for interchangeable algorithms (e.g., different report exporters).
- Factory: Use to decouple object creation from usage, especially for repository implementations.
- Observer: Use for one-to-many notifications (e.g., real-time updates from Supabase).

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| Project Context | GEMINI.md | Tech stack, architecture, and workflow |

Read the convention files listed above for project-specific patterns and rules.

### Core Conventions
- **Stack**: React 19 (Vite), TypeScript, Tailwind CSS, Supabase.
- **Architecture**: Clean Architecture. Logic in `src/domain`, Supabase in `src/infrastructure`, UI in `src/presentation`.
- **State**: Use `TestPlanContext` for multi-step wizard state.
- **Styling**: Tailwind CSS only. Radix UI for primitives.
- **Database**: Schema in `database.sql`. Use `dashboard_metrics` view for KPIs.
