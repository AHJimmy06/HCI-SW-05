import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { LandingPage } from "../pages/LandingPage";
import { Button } from "@/components/ui/button";

// Code splitting para mejorar el rendimiento de carga inicial
const DashboardPage = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TestPlanFormPage = lazy(() => import("../pages/TestPlanFormPage").then(m => ({ default: m.TestPlanFormPage })));
const ModeratorGuidePage = lazy(() => import("../pages/ModeratorGuidePage").then(m => ({ default: m.ModeratorGuidePage })));
const ObservationRecordPage = lazy(() => import("../pages/ObservationRecordPage").then(m => ({ default: m.ObservationRecordPage })));
const FindingsSynthesisPage = lazy(() => import("../pages/FindingsSynthesisPage").then(m => ({ default: m.FindingsSynthesisPage })));
const SprintBacklogPage = lazy(() => import("../pages/SprintBacklogPage").then(m => ({ default: m.SprintBacklogPage })));
const OrganizationsPage = lazy(() => import("../pages/OrganizationsPage").then(m => ({ default: m.OrganizationsPage })));
const OrganizationDetailPage = lazy(() => import("../pages/OrganizationDetailPage").then(m => ({ default: m.OrganizationDetailPage })));
const JoinRequestsPage = lazy(() => import("../pages/JoinRequestsPage").then(m => ({ default: m.JoinRequestsPage })));
const ProjectDetailPage = lazy(() => import("../pages/ProjectDetailPage").then(m => ({ default: m.ProjectDetailPage })));
const TestPlanDetailPage = lazy(() => import("../pages/TestPlanDetailPage").then(m => ({ default: m.TestPlanDetailPage })));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children, requireProject = false }: { children: React.ReactNode; requireProject?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (requireProject) {
    // Check if there's a project context in sessionStorage
    const projectId = sessionStorage.getItem('active_project_id');
    // Also check if we're on a route that can recover context (has testPlanId)
    const hasTestPlanId = location.pathname.includes('/test-plan/view/') || 
                         location.pathname.includes('/test-plan/guide/') ||
                         location.pathname.includes('/test-plan/record/') ||
                         location.pathname.includes('/test-plan/synthesis/') ||
                         location.pathname.includes('/test-plan/backlog/');

    if (!projectId && !hasTestPlanId) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
          <div className="text-center max-w-md p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso indirecto no permitido</h2>
            <p className="text-slate-700 mb-4">Los tests deben crearse desde un proyecto. Enterá por una organización para seleccionar un proyecto.</p>
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-primary hover:bg-primary/90">
              Ir a dashboard
            </Button>
          </div>
        </div>
      );
    }
  }
  return <>{children}</>;
}

export function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard/organizations" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

          {/* Unified dashboard route - ALL protected pages under one layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Main view */}
            <Route index element={<DashboardPage />} />
            <Route path="projects/:projectId" element={<DashboardPage />} />

            {/* Wizard / Test Plan workflow */}
            <Route path="test-plan">
              <Route path="new" element={<ProtectedRoute requireProject><TestPlanFormPage /></ProtectedRoute>} />
              <Route path="view/:testPlanId" element={<TestPlanDetailPage />} />
              <Route path="guide/:testPlanId" element={<ModeratorGuidePage />} />
              <Route path="record/:testPlanId" element={<ObservationRecordPage />} />
              <Route path="synthesis/:testPlanId" element={<FindingsSynthesisPage />} />
              <Route path="backlog/:testPlanId" element={<SprintBacklogPage />} />
            </Route>

            {/* Collaboration & Organization */}
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
            <Route path="organizations/:orgId/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="join-requests" element={<JoinRequestsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
