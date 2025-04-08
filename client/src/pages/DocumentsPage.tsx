import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { FileText, Download, Eye, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  // Fetch companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch documents for selected company
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents', { companyId: selectedCompany }],
    enabled: !!selectedCompany,
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents Management</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Company Selection */}
            <div className="max-w-md">
              <Select onValueChange={handleCompanyChange} value={selectedCompany}>
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
                            <Button variant="ghost" size="sm">
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