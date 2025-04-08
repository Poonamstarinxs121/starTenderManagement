import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const documentTypes = [
  "Invoice",
  "Contract",
  "Certificate",
  "License",
  "Registration",
  "Other"
];

const documentUploadSchema = z.object({
  companyId: z.string().min(1, "Company selection is required"),
  documentName: z.string().min(1, "Document name is required"),
  documentType: z.string().min(1, "Document type is required"),
  file: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Please select a file",
  }),
});

type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

interface DocumentUploadFormProps {
  onSubmit: (data: { companyId: string; documentName: string; documentType: string; file: File }) => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onSubmit }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; type: string; uploadDate: string }>>([]);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      companyId: "",
      documentName: "",
      documentType: "",
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    select: (data) => data.map((company: any) => ({
      id: company.id,
      name: company.name
    }))
  });

  // Fetch documents when company is selected
  const { data: companyDocuments = [] } = useQuery({
    queryKey: ['/api/documents', { companyId: selectedCompany }],
    enabled: !!selectedCompany,
    select: (data) => data.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      uploadDate: new Date(doc.uploadedAt).toLocaleDateString()
    }))
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    form.setValue("companyId", companyId);
  };

  const handleSubmit = (data: DocumentUploadFormValues) => {
    if (data.file.length > 0) {
      onSubmit({
        companyId: data.companyId,
        documentName: data.documentName,
        documentType: data.documentType,
        file: data.file[0],
      });
      form.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Upload Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Company*</FormLabel>
                    <Select 
                      onValueChange={(value) => handleCompanyChange(value)} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company: { id: string; name: string }) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload File*</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files) {
                              onChange(e.target.files);
                            }
                          }}
                          {...field}
                          className="file:mr-4 file:py-2 file:px-4 
                                   file:rounded-full file:border-0 
                                   file:text-sm file:bg-gray-100 
                                   file:text-gray-700 hover:file:bg-gray-200"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Upload Document
              </Button>
            </form>
          </Form>
        </div>

        {/* Right side - Document List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Company Documents</h2>
          <Card>
            <CardContent className="p-4">
              {selectedCompany ? (
                companyDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {companyDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            Type: {doc.type} • Uploaded: {doc.uploadDate}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No documents found for this company
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a company to view documents
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm; 