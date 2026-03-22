import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { DashboardPage } from "../pages/DashboardPage";
import { TestPlanFormPage } from "../pages/TestPlanFormPage";
import { ModeratorGuidePage } from "../pages/ModeratorGuidePage";
import { ObservationRecordPage } from "../pages/ObservationRecordPage";
import { FindingsSynthesisPage } from "../pages/FindingsSynthesisPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="plan" element={<TestPlanFormPage />} />
          <Route path="guia" element={<ModeratorGuidePage />} />
          <Route path="registro" element={<ObservationRecordPage />} />
          <Route path="sintesis" element={<FindingsSynthesisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
