import { Outlet, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { TestPlanProvider } from "../../context/TestPlanContext";
import { useTestPlan } from "../../context/useTestPlan";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../infrastructure/config/supabase";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Edit3,
  Filter,
  Save,
  Clock,
  LogOut,
  User as UserIcon,
  Building2,
  ChevronDown
} from "lucide-react";
import { NavigationStepper } from "./NavigationStepper";
import type { Organization, Project } from "../../../domain/entities/collaboration";

function NavContent() {
  const { isDraftSaved, hasDraft, clearDraft, validationStatus } = useTestPlan();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Org/Project selector state
  const [myOrgs, setMyOrgs] = useState<Organization[]>([]);
  const [orgProjects, setOrgProjects] = useState<Project[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Load user's organizations (only where user is a member)
  useEffect(() => {
    if (!user) return;
    const loadOrgs = async () => {
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (!memberships || memberships.length === 0) {
        setMyOrgs([]);
        return;
      }

      const orgIds = memberships.map(m => m.organization_id);
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)
        .order('created_at', { ascending: false });
      if (data) setMyOrgs(data);
    };
    loadOrgs();
  }, [user]);

  // Load projects when org changes or route has orgId
  useEffect(() => {
    if (!selectedOrg && params.orgId) {
      const org = myOrgs.find(o => o.id === params.orgId);
      if (org) setSelectedOrg(org);
    }
    // In project context, load org from project
    if (!selectedOrg && params.projectId && myOrgs.length > 0) {
      const loadOrgFromProject = async () => {
        const { data: project } = await supabase
          .from('projects')
          .select('organization_id')
          .eq('id', params.projectId)
          .single();
        if (project) {
          const org = myOrgs.find(o => o.id === project.organization_id);
          if (org) setSelectedOrg(org);
        }
      };
      loadOrgFromProject();
    }
  }, [params.orgId, params.projectId, myOrgs, selectedOrg]);

  // Fetch projects for selected org
  useEffect(() => {
    if (!selectedOrg) return;
    const loadProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', selectedOrg.id)
        .order('created_at', { ascending: false });
      if (data) setOrgProjects(data);
    };
    loadProjects();
  }, [selectedOrg]);

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setShowOrgDropdown(false);
    navigate(`/dashboard/organizations/${org.id}`);
  };

  const handleProjectSelect = (projectId: string) => {
    if (selectedOrg) {
      navigate(`/dashboard/project/${projectId}`);
    }
  };

  // Check if we're in a project dashboard context
  const currentProjectId = params.projectId
    || (location.pathname.startsWith('/dashboard/project/') ? location.pathname.split('/').pop() : null)
    || sessionStorage.getItem('active_project_id');

  const isInProjectContext = !!currentProjectId;

  // Redirección de seguridad para Deep Links
  useEffect(() => {
    const path = location.pathname;
    if (path === '/guia' && !validationStatus.plan.isValid) {
navigate('/dashboard/plan', { replace: true });
    } else if (path === '/guia' && !validationStatus.plan.isValid) {
      navigate('/dashboard/guia', { replace: true });
    } else if (path === '/registro' && !validationStatus.guide.isValid) {
      navigate('/dashboard/registro', { replace: true });
    }
  }, [location.pathname, validationStatus, navigate]);

  useEffect(() => {
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  const canNavigateTo = (step: string | null) => {
    if (!step) return true;
    if (step === 'plan') return true;
    if (step === 'guide') return validationStatus.plan.isValid;
    if (step === 'record') return validationStatus.plan.isValid && validationStatus.guide.isValid;
    if (step === 'synthesis') return validationStatus.plan.isValid && validationStatus.guide.isValid && validationStatus.record.isValid;
    return false;
  };

  const isWizardPage = ['/dashboard/plan', '/dashboard/guia', '/dashboard/registro', '/dashboard/sintesis'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 selection:text-primary">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-white rounded-md shadow-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Saltar al contenido principal
      </a>

      {/* HEADER PRINCIPAL - Brand, Organizations, User */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-sm">U</div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:inline-block">
                Usability<span className="text-primary">Dashboard</span>
              </span>
            </div>

            {/* Breadcrumb: Org + Project selector OR simple Organizations link */}
            <div className="flex items-center gap-3">
              {isInProjectContext && selectedOrg ? (
                <>
                  {/* Org selector dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      <Building2 size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-slate-800 max-w-[150px] truncate">{selectedOrg.name}</span>
                      <ChevronDown size={12} className="text-slate-500" />
                    </button>
                    {showOrgDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[200px] max-h-64 overflow-y-auto">
                        {myOrgs.map(org => (
                          <button
                            key={org.id}
                            onClick={() => handleOrgSelect(org)}
                            className={`w-full px-4 py-2.5 text-left hover:bg-primary/5 flex items-center gap-2 transition-colors ${org.id === selectedOrg.id ? 'bg-primary/10 text-primary' : 'text-slate-700'}`}
                          >
                            <Building2 size={14} />
                            <span className="text-sm font-medium truncate">{org.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="h-6 w-px bg-slate-200" />

                  {/* Project selector */}
                  {orgProjects.length > 0 && (
                    <div className="relative">
                      <select
                        value={currentProjectId || ''}
                        onChange={(e) => handleProjectSelect(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-primary/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Seleccionar proyecto</option>
                        {orgProjects.map(proj => (
                          <option key={proj.id} value={proj.id}>{proj.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to="/dashboard/organizations"
                  className={({ isActive }) =>
                    `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Building2 size={16} />
                  <span className="hidden lg:inline">Organizaciones</span>
                </NavLink>
              )}

              {/* Separator */}
              <div className="h-6 w-px bg-slate-200" />

              {/* Email badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/10 shadow-sm">
                <UserIcon size={12} className="text-primary/60" />
                <span className="text-[10px] font-bold text-primary/80 truncate max-w-[200px]">{user?.email}</span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-red-600 transition-colors tracking-widest"
              >
                <LogOut size={12} />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE NAVEGACIÓN DEL TEST PLAN */}
      {isWizardPage && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] xl:max-w-[1600px] mx-auto px-4 md:px-6">
            <div className="flex h-12 items-center justify-between">
              {/* Test Plan steps */}
              <nav className="flex items-center gap-1" aria-label="Navegación del plan de test">
                {[
                  { to: currentProjectId ? `/dashboard/project/${currentProjectId}` : "/dashboard", label: "Dashboard", icon: LayoutDashboard, step: null },
                  { to: "/dashboard/plan", label: "Plan del Test", icon: ClipboardList, step: 'plan' },
                  { to: "/dashboard/guia", label: "Guía de Moderación", icon: BookOpen, step: 'guide' },
                  { to: "/dashboard/registro", label: "Registro", icon: Edit3, step: 'record' },
                  { to: "/dashboard/sintesis", label: "Síntesis", icon: Filter, step: 'synthesis' },
                ].map((item) => {
                  const disabled = !canNavigateTo(item.step as any);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={disabled ? location.pathname : item.to}
                      onClick={(e) => { if (disabled) e.preventDefault(); }}
                      className={({ isActive }) =>
                        `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          disabled
                            ? "opacity-40 cursor-not-allowed text-slate-500"
                            : isActive
                              ? "bg-primary/10 text-primary shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                      }
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Draft status indicator */}
              <div className="flex items-center gap-3">
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP NAVIGATOR (inside wizard pages only) */}
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
