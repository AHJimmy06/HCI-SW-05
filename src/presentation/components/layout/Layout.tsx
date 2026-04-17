import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TestPlanProvider } from "../../context/TestPlanContext";
import { useTestPlan } from "../../context/useTestPlan";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  Edit3, 
  Filter,
  Save,
  Clock,
  X,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { NavigationStepper } from "./NavigationStepper";
import { Button } from "@/components/ui/button";

function NavContent() {
  const { isStepComplete, isDraftSaved, lastSaved, hasDraft, clearDraft, validationStatus } = useTestPlan();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Redirección de seguridad para Deep Links
  useEffect(() => {
    const path = location.pathname;
    if (path === '/guia' && !validationStatus.plan.isValid) {
      navigate('/plan', { replace: true });
    } else if (path === '/registro' && !validationStatus.guide.isValid) {
      navigate('/guia', { replace: true });
    } else if (path === '/sintesis' && !validationStatus.record.isValid) {
      navigate('/registro', { replace: true });
    }
  }, [location.pathname, validationStatus, navigate]);

  useEffect(() => {
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, step: null },
    { to: "/plan", label: "Plan del Test", icon: ClipboardList, step: 'plan' },
    { to: "/guia", label: "Guía de Moderación", icon: BookOpen, step: 'guide' },
    { to: "/registro", label: "Registro de Observaciones", icon: Edit3, step: 'record' },
    { to: "/sintesis", label: "Síntesis de Hallazgos", icon: Filter, step: 'synthesis' }
  ];

  const canNavigateTo = (step: string | null) => {
    if (!step) return true;
    if (step === 'plan') return true;
    if (step === 'guide') return validationStatus.plan.isValid;
    if (step === 'record') return validationStatus.plan.isValid && validationStatus.guide.isValid;
    if (step === 'synthesis') return validationStatus.plan.isValid && validationStatus.guide.isValid && validationStatus.record.isValid;
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

      {/* HEADER PRINCIPAL (NAVEGACIÓN) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-sm">U</div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block">
                Usability<span className="text-primary">Dashboard</span>
              </span>
            </div>

            <nav className="flex items-center gap-1 md:gap-4" aria-label="Navegación principal">
              {navItems.map((item) => {
                const disabled = !canNavigateTo(item.step as any);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={disabled ? location.pathname : item.to}
                    onClick={(e) => { if (disabled) e.preventDefault(); }}
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
                    <Icon size={16} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* BARRA DE USUARIO Y STATUS (DEBAJO DE LA NAVBAR) */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between min-h-[44px]">
          {/* Status / Draft Alert a la izquierda */}
          <div className="flex items-center gap-4">
             {showDraftBanner ? (
               <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-primary/20 shadow-sm animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Borrador recuperado</span>
                  </div>
                  <button 
                    onClick={() => { clearDraft(); setShowDraftBanner(false); }} 
                    className="text-[10px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase border-l border-slate-100 pl-3"
                  >
                    [Descartar]
                  </button>
               </div>
             ) : (
               isWizardPage && (
                 isDraftSaved ? (
                   <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in">
                      <Save size={12} className="opacity-70" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Progreso Sincronizado</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Guardando borrador...</span>
                   </div>
                 )
               )
             )}
          </div>

          {/* Usuario y Logout a la derecha */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/10 shadow-sm">
              <UserIcon size={12} className="text-primary/60" />
              <span className="text-[10px] font-bold text-primary/80 truncate max-w-[200px]">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-red-600 transition-colors tracking-widest"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {isWizardPage && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto">
             <NavigationStepper />
          </div>
        </div>
      )}

      <main id="main-content" className="max-w-[1200px] xl:max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[calc(100vh-12rem)]">
          <Outlet />
        </div>
      </main>

      <footer className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
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
