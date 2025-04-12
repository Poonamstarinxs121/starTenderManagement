import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Tag } from "lucide-react";

const documentTypes = [
  "Invoice",
  "Contract",
  "Certificate",
  "License",
  "Registration",
  "Other"
];

const documentTags = [
  "Important",
  "Urgent",
  "Confidential",
  "Draft",
  "Final",
  "Review",
  "Archived"
];

const companyFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface DocumentField {
  id: number;
  documentType: string;
  selectedFile: File | null;
  tags: string[];
}

interface CompanyFormProps {
  onSubmit: (data: CompanyFormValues & { documents: Array<{ type: string; file: File }> }) => void;
  onCancel: () => void;
  initialData?: CompanyFormValues & { documents?: Array<{ type: string; file: File }> };
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([
    { id: 1, documentType: "", selectedFile: null, tags: [] }
  ]);
  const [documents, setDocuments] = useState<Array<{ type: string; file: File }>>(
    initialData?.documents || []
  );

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialData || {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      status: "",
      category: "",
      description: "",
    },
  });

  const vendorTypes = ["OEM", "Distributor", "Service Provider", "Contractor"];
  const statusOptions = ["Active", "Inactive", "Pending"];

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

  const handleTagChange = (id: number, value: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      setDocumentFields(documentFields.map(field => {
        if (field.id === id) {
          const newTags = field.tags.includes(value.trim()) 
            ? field.tags 
            : [...field.tags, value.trim()];
          return { ...field, tags: newTags };
        }
        return field;
      }));
      // Clear the input after adding tag
      e.currentTarget.value = "";
    }
  };

  const handleRemoveTag = (id: number, tagToRemove: string) => {
    setDocumentFields(documentFields.map(field => {
      if (field.id === id) {
        return { ...field, tags: field.tags.filter(tag => tag !== tagToRemove) };
      }
      return field;
    }));
  };

  const handleAddDocument = (id: number) => {
    const field = documentFields.find(f => f.id === id);
    if (field?.documentType && field?.selectedFile) {
      setDocuments([...documents, { type: field.documentType, file: field.selectedFile }]);
      // Clear the fields for this document
      setDocumentFields(documentFields.map(f => 
        f.id === id ? { ...f, documentType: "", selectedFile: null } : f
      ));
      // Reset the file input
      const fileInput = document.querySelector(`input[type="file"][data-id="${id}"]`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const addNewDocumentField = () => {
    const newId = Math.max(...documentFields.map(f => f.id), 0) + 1;
    setDocumentFields([...documentFields, { id: newId, documentType: "", selectedFile: null, tags: [] }]);
  };

  const removeDocumentField = (id: number) => {
    if (documentFields.length > 1) {
      setDocumentFields(documentFields.filter(field => field.id !== id));
    }
  };

  const handleFormSubmit = (data: CompanyFormValues) => {
    onSubmit({ ...data, documents });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {initialData ? 'Edit Company' : 'Add New Company'}
            </h2>
            <p className="text-sm text-gray-500">
              {initialData ? 'Update the company details below.' : 'Enter the company details below.'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border border-gray-300 rounded-md px-6 py-2"
            onClick={() => setShowDocumentForm(!showDocumentForm)}
          >
            <span className="text-xl font-normal">Add Document</span>
          </Button>
        </div>

        {showDocumentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[800px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Add Document</h2>
                  <Button
                    type="button"
                    onClick={addNewDocumentField}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Another Document
                  </Button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                  {documentFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Document {index + 1}</h3>
                        {documentFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeDocumentField(field.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-normal mb-1">Document Type*</label>
                          <Select
                            value={field.documentType}
                            onValueChange={(value) => handleDocumentTypeChange(field.id, value)}
                          >
                            <SelectTrigger className="w-full rounded border-gray-300 h-10">
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

                        <div>
                          <label className="block text-sm font-normal mb-1">Document Tags</label>
                          <div className="relative">
                            <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="text"
                              placeholder="Type tag and press Enter"
                              onKeyDown={(e) => handleTagChange(field.id, (e.target as HTMLInputElement).value, e)}
                              className="w-full pl-8 h-9 text-sm border-gray-200"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => handleRemoveTag(field.id, tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-normal mb-1">Upload File*</label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              data-id={field.id}
                              onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                              className="flex-1 rounded border-gray-300 h-10"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                            />
                            <Button
                              type="button"
                              onClick={() => handleAddDocument(field.id)}
                              disabled={!field.documentType || !field.selectedFile}
                              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap px-4"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Added Documents</h3>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{doc.type}</span>
                            <span className="text-sm text-gray-500 ml-2">{doc.file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              const newDocs = [...documents];
                              newDocs.splice(index, 1);
                              setDocuments(newDocs);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowDocumentForm(false);
                      setDocumentFields([{ id: 1, documentType: "", selectedFile: null, tags: [] }]);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter address" 
                    {...field} 
                    className="resize-none h-20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pincode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendorTypes.map((type) => (
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
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter company description"
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            {initialData ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm; 