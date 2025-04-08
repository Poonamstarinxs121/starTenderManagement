import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OEMForm from "@/components/forms/OEMForm";

const OEMsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("OEM data:", data);
    setIsDialogOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">OEMs</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add OEM</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[95vh] p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>Add New OEM</DialogTitle>
              </DialogHeader>
              <div className="overflow-hidden">
                <OEMForm onSubmit={handleSubmit} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <p className="text-gray-500">OEM management functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OEMsPage; 