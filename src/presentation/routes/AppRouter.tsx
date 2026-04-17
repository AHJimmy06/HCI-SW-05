import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "../pages/LoginPage";

// Code splitting para mejorar el rendimiento de carga inicial
const DashboardPage = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TestPlanFormPage = lazy(() => import("../pages/TestPlanFormPage").then(m => ({ default: m.TestPlanFormPage })));
const ModeratorGuidePage = lazy(() => import("../pages/ModeratorGuidePage").then(m => ({ default: m.ModeratorGuidePage })));
const ObservationRecordPage = lazy(() => import("../pages/ObservationRecordPage").then(m => ({ default: m.ObservationRecordPage })));
const FindingsSynthesisPage = lazy(() => import("../pages/FindingsSynthesisPage").then(m => ({ default: m.FindingsSynthesisPage })));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="plan" element={<TestPlanFormPage />} />
            <Route path="guia" element={<ModeratorGuidePage />} />
            <Route path="registro" element={<ObservationRecordPage />} />
            <Route path="sintesis" element={<FindingsSynthesisPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
