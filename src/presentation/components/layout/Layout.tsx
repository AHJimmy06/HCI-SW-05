import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { TestPlanProvider } from "../../context/TestPlanContext";
import { useTestPlan } from "../../context/useTestPlan";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  Edit3, 
  Filter,
  Save,
  Clock,
  X
} from "lucide-react";
import { NavigationStepper } from "./NavigationStepper";

function NavContent() {
  const { isStepComplete, isDraftSaved, lastSaved, hasDraft, clearDraft } = useTestPlan();
  const location = useLocation();
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  useEffect(() => {
    if (hasDraft) {
      setShowDraftBanner(true);
    }
  }, [hasDraft]);

  const navItems = [
    { to: "/", label: "Tablero de Control", icon: LayoutDashboard, step: null },
    { to: "/plan", label: "Plan de Vuelo", icon: ClipboardList, step: 'plan' },
    { to: "/guia", label: "Guía del Capitán", icon: BookOpen, step: 'guide' },
    { to: "/registro", label: "Bitácora de Campo", icon: Edit3, step: 'record' },
    { to: "/sintesis", label: "El Tamiz", icon: Filter, step: 'synthesis' }
  ];

  const canNavigateTo = (step: string | null) => {
    if (!step) return true;
    if (step === 'plan') return true;
    if (step === 'guide') return isStepComplete('plan');
    if (step === 'record') return isStepComplete('guide');
    if (step === 'synthesis') return isStepComplete('record');
    return false;
  };

  const isWizardPage = ['/plan', '/guia', '/registro', '/sintesis'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 selection:text-primary">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-white rounded-md shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Saltar al contenido principal
      </a>

      {showDraftBanner && (
        <div 
          role="status"
          aria-live="polite"
          className="bg-primary/10 border-b border-primary/20 py-2 px-4 animate-in slide-in-from-top duration-300"
        >
          <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">!</span>
              ¡Hola! Recuperamos tu borrador guardado automáticamente.
            </div>
            <button 
              onClick={() => {
                clearDraft();
                setShowDraftBanner(false);
              }}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <X size={14} />
              [Descartar]
            </button>
          </div>
        </div>
      )}

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
                const disabled = !canNavigateTo(item.step as 'plan' | 'guia' | 'registro' | 'sintesis' | null);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={disabled ? location.pathname : item.to}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                    className={({ isActive }) =>
                      `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        disabled 
                          ? "opacity-40 cursor-not-allowed text-slate-500" 
                          : isActive 
                            ? "bg-primary/10 text-primary shadow-sm" 
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {isWizardPage && (
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
          <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <NavigationStepper />
            </div>
            <div className="px-6 py-2 md:py-0 border-t md:border-t-0 md:border-l border-slate-100 flex items-center gap-3 whitespace-nowrap">
              {isDraftSaved ? (
                <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in duration-500">
                  <Save size={14} className="opacity-70" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Draft a salvo</span>
                  {lastSaved && (
                    <span className="text-[10px] opacity-60 font-medium">
                      ({lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} className="animate-spin duration-[3000ms]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Guardando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
