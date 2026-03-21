import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { DashboardPage } from "../pages/DashboardPage";
import { ModeratorGuidePage } from "../pages/ModeratorGuidePage";
import { ObservationRecordPage } from "../pages/ObservationRecordPage";
import { FindingsSynthesisPage } from "../pages/FindingsSynthesisPage";
import { ReportsPage } from "../pages/ReportsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="guia" element={<ModeratorGuidePage />} />
          <Route path="registro" element={<ObservationRecordPage />} />
          <Route path="sintesis" element={<FindingsSynthesisPage />} />
          <Route path="reportes" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
