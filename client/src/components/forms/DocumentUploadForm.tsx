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
  FormDescription,
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

const documentFormSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  description: z.string().optional(),
  documentType: z.string().min(1, "Document type is required"),
  category: z.string().min(1, "Category is required"),
  file: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only PDF, DOC, DOCX, JPG or PNG files are accepted"
    ),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentUploadFormProps {
  onSubmit: (data: DocumentFormValues) => void;
  onCancel: () => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      documentType: "",
      category: "KYC Documents",
    },
  });

  const documentTypes = [
    "Company Registration",
    "Business License",
    "Tax Registration",
    "Financial Statement",
    "Bank Statement",
    "Utility Bill",
    "ID Card",
    "Passport",
    "Address Proof",
    "Other"
  ];

  const categories = [
    "KYC Documents",
    "Company Documents",
    "Financial Documents",
    "Legal Documents",
    "Other Documents"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    form.setValue("file", file);
  };

  const handleSubmit = (data: DocumentFormValues) => {
    onSubmit({ ...data, file: selectedFile });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upload Document</h2>
          <p className="text-sm text-gray-500">
            Upload documents such as KYC forms, tender documents, contracts, etc.
          </p>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter document title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter document description"
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleChange}
                    {...field}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-gray-600">
                      {selectedFile ? selectedFile.name : "Click to upload"} or drag and drop
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG or PNG (MAX. 5MB)
                    </span>
                  </label>
                </div>
              </FormControl>
              <FormDescription>
                Upload a document file. Max size 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            Upload Document
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentUploadForm; 