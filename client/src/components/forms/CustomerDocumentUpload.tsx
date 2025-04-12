import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Upload } from "lucide-react";

interface DocumentField {
  id: number;
  documentType: string;
  selectedFile: File | null;
}

const documentTypes = [
  "Invoice",
  "Contract",
  "Certificate",
  "License",
  "Registration",
  "Other"
];

interface CustomerDocumentUploadProps {
  onSave: (documents: Array<{ type: string; file: File }>) => void;
  initialDocuments?: Array<{ type: string; file: File }>;
}

const CustomerDocumentUpload: React.FC<CustomerDocumentUploadProps> = ({ onSave, initialDocuments = [] }) => {
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([
    { id: 1, documentType: "", selectedFile: null }
  ]);
  const [documents, setDocuments] = useState<Array<{ type: string; file: File }>>(initialDocuments);

  const handleFileChange = (id: number, file: File | null) => {
    setDocumentFields(documentFields.map(field => 
      field.id === id ? { ...field, selectedFile: file } : field
    ));
  };

  const handleDocumentTypeChange = (id: number, value: string) => {
    setDocumentFields(documentFields.map(field => 
      field.id === id ? { ...field, documentType: value } : field
    ));
  };

  const handleAddDocument = () => {
    const newField = {
      id: documentFields.length + 1,
      documentType: "",
      selectedFile: null
    };
    setDocumentFields([...documentFields, newField]);
  };

  const handleRemoveDocument = (id: number) => {
    setDocumentFields(documentFields.filter(field => field.id !== id));
  };

  const handleSaveDocuments = () => {
    const newDocuments = documentFields
      .filter(field => field.documentType && field.selectedFile)
      .map(field => ({
        type: field.documentType,
        file: field.selectedFile!
      }));
    
    const updatedDocuments = [...documents, ...newDocuments];
    setDocuments(updatedDocuments);
    onSave(updatedDocuments);
    setDocumentFields([{ id: 1, documentType: "", selectedFile: null }]);
  };

  const handleRemoveUploadedDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onSave(updatedDocuments);
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        
        <div className="space-y-4">
          {documentFields.map((field) => (
            <div key={field.id} className="grid grid-cols-2 gap-4 items-start p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Document Type*</Label>
                <Select
                  value={field.documentType}
                  onValueChange={(value) => handleDocumentTypeChange(field.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>File*</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="flex-1"
                  />
                  {documentFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(field.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDocument}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Document
          </Button>
          <Button
            type="button"
            onClick={handleSaveDocuments}
            disabled={!documentFields.some(field => field.documentType && field.selectedFile)}
          >
            Save Documents
          </Button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="font-medium mb-4">Uploaded Documents</h3>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{doc.type}</p>
                  <p className="text-sm text-gray-500">{doc.file.name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUploadedDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDocumentUpload; 