import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/forms/ProjectForm";

const ProjectsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("Project data:", data);
    setIsDialogOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ProjectForm onSubmit={handleSubmit} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-500">Project management functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage; 