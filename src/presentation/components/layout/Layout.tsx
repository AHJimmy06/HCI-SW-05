import { Outlet, NavLink, useLocation } from "react-router-dom";
import { TestPlanProvider, useTestPlan } from "../../context/TestPlanContext";

function NavContent() {
  const { isStepComplete } = useTestPlan();
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", step: null },
    { to: "/plan", label: "Plan", step: 'plan' },
    { to: "/guia", label: "Guía", step: 'guia' },
    { to: "/registro", label: "Registro", step: 'registro' },
    { to: "/sintesis", label: "Síntesis", step: 'sintesis' }
  ];

  const canNavigateTo = (step: string | null) => {
    if (!step) return true;
    if (step === 'plan') return true;
    if (step === 'guia') return isStepComplete('plan');
    if (step === 'registro') return isStepComplete('plan');
    if (step === 'sintesis') return isStepComplete('registro');
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 selection:text-primary">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-white rounded-md shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-sm" aria-hidden="true">
                U
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block">
                Usability<span className="text-primary">Dashboard</span>
              </span>
            </div>

            <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar" aria-label="Navegación principal">
              {navItems.map((item) => {
                const disabled = !canNavigateTo(item.step as any);
                return (
                  <NavLink
                    key={item.to}
                    to={disabled ? location.pathname : item.to}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                    className={({ isActive }) =>
                      `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        disabled 
                          ? "opacity-40 cursor-not-allowed text-slate-500" 
                          : isActive 
                            ? "bg-primary/10 text-primary shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-[1200px] xl:max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[calc(100vh-10rem)]">
          <Outlet />
        </div>
      </main>

      <footer className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 py-8 text-center text-slate-600 text-sm font-semibold uppercase tracking-wider">
        <p>© {new Date().getFullYear()} Usability Dashboard - Herramienta Profesional de IHC</p>
      </footer>
    </div>
  );
}

export function Layout() {
  return (
    <TestPlanProvider>
      <NavContent />
    </TestPlanProvider>
  );
}
