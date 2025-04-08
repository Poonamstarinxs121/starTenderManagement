import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, Tag } from "lucide-react";
import { DocumentSet } from "@/pages/TenderManagementPage";

const documentSetSchema = z.object({
  leadId: z.string().min(1, "Lead selection is required"),
  documentSetName: z.string().min(1, "Document set name is required"),
  participatingCompany: z.string().min(1, "Participating company is required"),
  tags: z.array(z.string()),
  documents: z.array(z.object({
    name: z.string().min(1, "Document name is required"),
    type: z.string(),
    file: z.instanceof(File, { message: "Document file is required" })
  }))
});

type DocumentSetFormData = z.infer<typeof documentSetSchema>;

interface TenderDocumentSetFormProps {
  onSubmit: (data: DocumentSet) => void;
  onAddMoreSets: () => void;
  initialData: DocumentSet | null;
}

interface LeadDetails {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
}

const TenderDocumentSetForm: React.FC<TenderDocumentSetFormProps> = ({
  onSubmit,
  onAddMoreSets,
  initialData,
}) => {
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<DocumentSetFormData>({
    resolver: zodResolver(documentSetSchema),
    defaultValues: initialData || {
      leadId: "",
      documentSetName: "",
      participatingCompany: "",
      tags: [],
      documents: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents"
  });

  // Mock function to fetch lead details - replace with actual API call
  const handleLeadSelect = async (leadId: string) => {
    // Simulate API call
    const mockLeadDetails: LeadDetails = {
      id: leadId,
      companyName: "Sample Company",
      contactPerson: "John Doe",
      email: "john@example.com",
    };
    setSelectedLead(mockLeadDetails);
    form.setValue("participatingCompany", mockLeadDetails.companyName);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocuments = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        file: file,
      }));
      const currentDocs = form.getValues("documents") || [];
      form.setValue("documents", [...currentDocs, ...newDocuments]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Document Set Details</h2>
            <Button
              type="button"
              variant="outline"
              onClick={onAddMoreSets}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More Sets
            </Button>
          </div>

          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Lead <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleLeadSelect(value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead1">Lead 1</SelectItem>
                    <SelectItem value="lead2">Lead 2</SelectItem>
                    <SelectItem value="lead3">Lead 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedLead && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <p className="text-gray-600">{selectedLead.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-gray-600">{selectedLead.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-600">{selectedLead.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <FormField
            control={form.control}
            name="documentSetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Set Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter document set name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Tags</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <div className="relative">
                      <Tag className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Type tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="pl-8"
                      />
                    </div>
                  </FormControl>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Upload Documents</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{field.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit">Save Document Set</Button>
        </div>
      </form>
    </Form>
  );
};

export default TenderDocumentSetForm; 