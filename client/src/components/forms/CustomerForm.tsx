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
import { X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentField {
  id: number;
  documentType: string;
  selectedFile: File | null;
  tags: string[];
}

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

const customerFormSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  gst: z.string().min(1, "GST number is required"),
  email: z.string().email("Invalid email address"),
  contactNo: z.string().min(1, "Contact number is required"),
  department: z.string().min(1, "Department is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormValues & { documents: Array<{ type: string; file: File }> }) => void;
  onCancel: () => void;
  initialData?: CustomerFormValues & { documents?: Array<{ type: string; file: File }> };
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([
    { id: 1, documentType: "", selectedFile: null, tags: [] }
  ]);
  const [documents, setDocuments] = useState<Array<{ type: string; file: File }>>(
    initialData?.documents || []
  );

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      company: initialData?.company || "",
      gst: initialData?.gst || "",
      email: initialData?.email || "",
      contactNo: initialData?.contactNo || "",
      department: initialData?.department || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
    },
  });

  const handleFormSubmit = (data: CustomerFormValues) => {
    onSubmit({ ...data, documents });
  };

  const departments = [
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Human Resources",
    "IT",
    "Customer Service",
    "Research & Development"
  ];

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
    setDocumentFields(documentFields.filter(field => field.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-6">
        <Button
          type="button"
          variant="outline"
          className="border border-gray-300 rounded-md px-6 py-2"
          onClick={() => {
            setShowDocumentForm(!showDocumentForm);
            if (!showCustomerForm) {
              setShowCustomerForm(true);
            }
          }}
        >
          <span className="text-xl font-normal">Upload Document</span>
        </Button>
      </div>

      {showDocumentForm ? (
        <div className="mb-8 border rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Upload Documents</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {documentFields.map((field) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal mb-1">Document Type*</label>
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

                  <div className="col-span-2">
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
                      {documentFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeDocumentField(field.id)}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNewDocumentField}
              className="mt-4"
            >
              Add Another Document
            </Button>
          </div>

          {documents.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">{doc.file.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : showCustomerForm ? (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
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
                  name="gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter GST number" {...field} />
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
                  name="contactNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
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

                <div className="grid grid-cols-3 gap-6">
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
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  );
};

export default CustomerForm; 