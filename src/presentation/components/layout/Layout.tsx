import { Outlet, NavLink } from "react-router-dom";
import { TestPlanProvider } from "../../context/TestPlanContext";

export function Layout() {
  return (
    <TestPlanProvider>
      <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-brand-100 selection:text-brand-900">
        {/* Skip to Main Content Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-600 text-white rounded-md shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          Saltar al contenido principal
        </a>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 w-full border-b border-surface-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 md:px-6">
            <div className="flex h-16 items-center justify-between">
              {/* Brand Logo/Title */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-soft">
                  U
                </div>
                <span className="text-xl font-bold tracking-tight text-brand-900 hidden sm:inline-block">
                  Usability<span className="text-brand-500">Dashboard</span>
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar" aria-label="Navegación principal">
                {[
                  { to: "/", label: "Dashboard" },
                  { to: "/plan", label: "Plan" },
                  { to: "/guia", label: "Guía" },
                  { to: "/registro", label: "Registro" },
                  { to: "/sintesis", label: "Síntesis" }
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 ${
                        isActive 
                          ? "bg-brand-50 text-brand-700 shadow-sm" 
                          : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="max-w-[1200px] xl:max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-soft border border-surface-200 overflow-hidden min-h-[calc(100vh-10rem)]">
            <Outlet />
          </div>
        </main>

        {/* Global Footer (Optional but good for HCI) */}
        <footer className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 py-8 text-center text-surface-500 text-sm">
          <p>© {new Date().getFullYear()} Usability Dashboard - Herramienta de Interacción Humano Computador</p>
        </footer>
      </div>
    </TestPlanProvider>
  );
}
