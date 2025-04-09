import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenderBasicDetailsForm from "@/components/forms/TenderBasicDetailsForm";
import TenderDocumentSetForm from "@/components/forms/TenderDocumentSetForm";
import TenderPreviewExportForm from "@/components/forms/TenderPreviewExportForm";

export interface BasicDetails {
  participatingCompany: string;
  tenderName: string;
  tenderId: string;
  clientName: string;
  deliveryLocation: string;
  publishDate: string;
  endDate: string;
}

export interface DocumentSet {
  leadId: string;
  documentSetName: string;
  participatingCompany: string;
  tags: string[];
  documents: Array<{
    name: string;
    type: string;
    file: File;
  }>;
}

interface FormData {
  basicDetails: BasicDetails | null;
  documentSets: DocumentSet[];
}

const TenderManagementPage = () => {
  const [activeTab, setActiveTab] = useState("basic-details");
  const [formData, setFormData] = useState<FormData>({
    basicDetails: null,
    documentSets: [],
  });
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const handleBasicDetailsSubmit = (data: BasicDetails) => {
    setFormData(prev => ({ ...prev, basicDetails: data }));
    setActiveTab("document-upload");
  };

  const handleDocumentSetSubmit = (data: DocumentSet) => {
    setFormData(prev => ({
      ...prev,
      documentSets: prev.documentSets.map((set, index) => 
        index === currentSetIndex ? data : set
      ),
    }));

    // Show success message or navigate to preview if this is the last set
    if (currentSetIndex === formData.documentSets.length - 1) {
      setActiveTab("preview-export");
    }
  };

  const handleAddMoreSets = () => {
    const emptySet: DocumentSet = {
      leadId: "",
      documentSetName: "",
      participatingCompany: "",
      tags: [],
      documents: [],
    };

    setFormData(prev => ({
      ...prev,
      documentSets: [...prev.documentSets, emptySet],
    }));
    setCurrentSetIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeTab === "document-upload") {
      setActiveTab("basic-details");
    } else if (activeTab === "preview-export") {
      setActiveTab("document-upload");
    }
  };

  const handleNext = () => {
    if (activeTab === "document-upload" && formData.documentSets.length > 0) {
      setActiveTab("preview-export");
    }
  };

  const handleTabChange = (value: string) => {
    // Allow navigation between tabs without conditions
    setActiveTab(value);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Tender Management</h1>
        <p className="text-gray-600">Create and manage tender documentation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Tender Process</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic-details">
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="document-upload">
                Document Upload
              </TabsTrigger>
              <TabsTrigger value="preview-export">
                Preview & Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic-details">
              <TenderBasicDetailsForm
                onSubmit={handleBasicDetailsSubmit}
                initialData={formData.basicDetails}
              />
            </TabsContent>

            <TabsContent value="document-upload">
              <div className="space-y-6">
                {formData.documentSets.length === 0 ? (
                  <TenderDocumentSetForm
                    onSubmit={handleDocumentSetSubmit}
                    onAddMoreSets={handleAddMoreSets}
                    initialData={null}
                  />
                ) : (
                  <>
                    {formData.documentSets.map((set, index) => (
                      <div key={index} className={index === currentSetIndex ? "" : "hidden"}>
                        <TenderDocumentSetForm
                          onSubmit={handleDocumentSetSubmit}
                          onAddMoreSets={handleAddMoreSets}
                          initialData={set}
                        />
                      </div>
                    ))}
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBack}>
                        Back
                      </Button>
                      <Button onClick={handleNext} disabled={formData.documentSets.length === 0}>
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview-export">
              <TenderPreviewExportForm
                basicDetails={formData.basicDetails}
                documentSets={formData.documentSets}
                onBack={handleBack}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenderManagementPage; 