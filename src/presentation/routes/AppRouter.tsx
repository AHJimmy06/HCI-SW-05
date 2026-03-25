import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Loader2 } from "lucide-react";

// Code splitting para mejorar el rendimiento de carga inicial
const DashboardPage = lazy(() => import("../pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TestPlanFormPage = lazy(() => import("../pages/TestPlanFormPage").then(m => ({ default: m.TestPlanFormPage })));
const ModeratorGuidePage = lazy(() => import("../pages/ModeratorGuidePage").then(m => ({ default: m.ModeratorGuidePage })));
const ObservationRecordPage = lazy(() => import("../pages/ObservationRecordPage").then(m => ({ default: m.ObservationRecordPage })));
const FindingsSynthesisPage = lazy(() => import("../pages/FindingsSynthesisPage").then(m => ({ default: m.FindingsSynthesisPage })));

function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="plan" element={<TestPlanFormPage />} />
            <Route path="guia" element={<ModeratorGuidePage />} />
            <Route path="registro" element={<ObservationRecordPage />} />
            <Route path="sintesis" element={<FindingsSynthesisPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
