import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import LeadManagement from "@/pages/leads/LeadManagement";
import LeadDetail from "@/pages/leads/LeadDetail";
import TenderManagement from "@/pages/tenders/TenderManagement";
import TenderDetail from "@/pages/tenders/TenderDetail";
import ProjectTracking from "@/pages/projects/ProjectTracking";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import DocumentManagement from "@/pages/documents/DocumentManagement";
import UserManagement from "@/pages/users/UserManagement";
import Settings from "@/pages/settings/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => 
        <MainLayout>
          <Dashboard />
        </MainLayout>
      } />
      
      <Route path="/leads" component={() => 
        <MainLayout>
          <LeadManagement />
        </MainLayout>
      } />
      
      <Route path="/leads/:id" component={({ params }) => 
        <MainLayout>
          <LeadDetail id={parseInt(params.id)} />
        </MainLayout>
      } />
      
      <Route path="/tenders" component={() => 
        <MainLayout>
          <TenderManagement />
        </MainLayout>
      } />
      
      <Route path="/tenders/:id" component={({ params }) => 
        <MainLayout>
          <TenderDetail id={parseInt(params.id)} />
        </MainLayout>
      } />
      
      <Route path="/projects" component={() => 
        <MainLayout>
          <ProjectTracking />
        </MainLayout>
      } />
      
      <Route path="/projects/:id" component={({ params }) => 
        <MainLayout>
          <ProjectDetail id={parseInt(params.id)} />
        </MainLayout>
      } />
      
      <Route path="/documents" component={() => 
        <MainLayout>
          <DocumentManagement />
        </MainLayout>
      } />
      
      <Route path="/users" component={() => 
        <MainLayout>
          <UserManagement />
        </MainLayout>
      } />
      
      <Route path="/settings" component={() => 
        <MainLayout>
          <Settings />
        </MainLayout>
      } />
      
      <Route component={() => 
        <MainLayout>
          <NotFound />
        </MainLayout>
      } />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
