import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/pages/DashboardPage";
import LeadsPage from "@/pages/LeadsPage";
import ProjectsPage from "@/pages/ProjectsPage";
import TendersPage from "@/pages/TendersPage";
import UsersPage from "@/pages/UsersPage";
import DocumentsPage from "@/pages/DocumentsPage";
import OEMsPage from "@/pages/OEMsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import CustomersPage from "@/pages/CustomersPage";
import UserManagement from "@/components/UserManagement";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/oems" element={<OEMsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/users/*" element={<UserManagement />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
