// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Alerts } from "./pages/Alerts";
import { Devices } from "./pages/Devices";
import { Settings } from "./pages/Settings";
import { useAlerts } from "./hooks/useAlerts";
import "./index.css";

function AppShell() {
  const { unreadCount } = useAlerts();

  return (
    <div className="app-container">
      <Sidebar unreadAlerts={unreadCount} />
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/alerts"   element={<Alerts />}    />
        <Route path="/devices"  element={<Devices />}   />
        <Route path="/settings" element={<Settings />}  />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
