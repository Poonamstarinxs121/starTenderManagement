import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Eye, Plus, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
}

const DocumentsPage = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch documents for selected company
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents', { companyId: selectedCompany }],
    enabled: !!selectedCompany,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast.success('Document uploaded successfully');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentName("");
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for PDFs and images
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCompany || !documentName) {
      toast.error('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('companyId', selectedCompany);
    formData.append('name', documentName);
    formData.append('type', selectedFile.type);

    uploadMutation.mutate(formData);
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleExport = () => {
    if (documents.length === 0) {
      toast.error('No documents to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Document Name', 'Type', 'Upload Date'],
      ...documents.map(doc => [doc.name, doc.type, formatDate(doc.uploadDate)])
    ].map(row => row.join(',')).join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-${selectedCompany}-${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents Management</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={!selectedCompany || documents.length === 0}
          >
            Export
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName">Document Name</Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 border rounded-md p-4">
                      {selectedFile?.type === 'application/pdf' ? (
                        <iframe src={previewUrl} className="w-full h-64" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto" />
                      )}
                    </div>
                  </div>
                )}
                <Button 
                  className="w-full" 
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedCompany || !documentName}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Company Selection */}
            <div className="max-w-md">
              <Select 
                onValueChange={(value: string) => handleCompanyChange(value)} 
                value={selectedCompany}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document List */}
            {selectedCompany ? (
              documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {doc.name}
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc.fileUrl)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePreview(doc.fileUrl)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No documents have been uploaded for this company yet.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-sm font-medium text-gray-900">Select a company</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a company to view its documents
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage; 