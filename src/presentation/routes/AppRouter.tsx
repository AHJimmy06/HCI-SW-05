import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProject) {
    // Check if there's a project context in sessionStorage
    const projectId = sessionStorage.getItem('active_project_id');
    if (!projectId) {
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
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

          {/* Unified dashboard route - ALL protected pages under one layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Wizard pages */}
            <Route index element={<DashboardPage />} />
            <Route path="plan" element={<TestPlanFormPage />} />
            <Route path="guia" element={<ModeratorGuidePage />} />
            <Route path="registro" element={<ObservationRecordPage />} />
            <Route path="sintesis" element={<FindingsSynthesisPage />} />

            {/* Collaboration pages */}
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
            <Route path="organizations/:orgId/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="project/:projectId" element={<DashboardPage />} />
            <Route path="test-plan/:testPlanId" element={<TestPlanDetailPage />} />
            <Route path="join-requests" element={<JoinRequestsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
