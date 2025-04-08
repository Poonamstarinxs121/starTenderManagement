import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/pages/DashboardPage";
import LeadsPage from "@/pages/LeadsPage";
import TendersPage from "@/pages/TendersPage";
import UsersPage from "@/pages/UsersPage";
import DocumentsPage from "@/pages/DocumentsPage";
import OEMsPage from "@/pages/OEMsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import CustomersPage from "@/pages/CustomersPage";
import UserManagement from "@/components/UserManagement";
import OEMForm from "@/components/forms/OEMForm";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import TenderManagementPage from "@/pages/TenderManagementPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/oems" element={<OEMsPage />} />
          <Route path="/oems/add" element={<OEMForm onSubmit={console.log} />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/upload" element={
            <DocumentUploadForm onSubmit={console.log} />
          } />
          <Route path="/users/*" element={<UserManagement />} />
          <Route path="/tenders" element={<TenderManagementPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
