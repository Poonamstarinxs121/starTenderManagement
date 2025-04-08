import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  FileText,
  Users,
  FolderOpen,
  FileCheck2,
  Download,
  Filter
} from "lucide-react";

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header with Export and Filter buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="default" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter View
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/projects">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View Projects
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leads">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Leads</p>
                  <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View Leads
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenders">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Tenders</p>
                  <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileCheck2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View Tenders
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/documents">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents Pending</p>
                  <h2 className="text-3xl font-bold mt-2">0</h2>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View Documents
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage; 