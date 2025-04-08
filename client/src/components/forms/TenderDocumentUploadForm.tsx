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
import { X } from "lucide-react";

const documentSetSchema = z.object({
  documentSetName: z.string().min(1, "Document set name is required"),
  participatingCompany: z.string().min(1, "Participating company is required"),
  tags: z.array(z.string()),
  documents: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      file: z.any(),
    })
  ),
});

type DocumentSetFormValues = z.infer<typeof documentSetSchema>;

interface TenderDocumentUploadFormProps {
  onSubmit: (data: DocumentSetFormValues) => void;
  initialData?: Partial<DocumentSetFormValues>;
}

const TenderDocumentUploadForm: React.FC<TenderDocumentUploadFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [documents, setDocuments] = useState<
    Array<{ name: string; type: string; file: File }>
  >(initialData?.documents || []);

  const form = useForm<DocumentSetFormValues>({
    resolver: zodResolver(documentSetSchema),
    defaultValues: {
      documentSetName: initialData?.documentSetName || "",
      participatingCompany: initialData?.participatingCompany || "",
      tags: tags,
      documents: documents,
    },
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        form.setValue("tags", newTags);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDocument = {
        name: file.name,
        type: file.type,
        file: file,
      };
      const newDocuments = [...documents, newDocument];
      setDocuments(newDocuments);
      form.setValue("documents", newDocuments);
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    form.setValue("documents", newDocuments);
  };

  const handleSubmit = (data: DocumentSetFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Document Upload</h2>

          <FormField
            control={form.control}
            name="participatingCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participating Company</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="company1">Company 1</SelectItem>
                    <SelectItem value="company2">Company 2</SelectItem>
                    <SelectItem value="company3">Company 3</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentSetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Set Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter document set name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </FormControl>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
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

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Upload Documents</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Add Document
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{doc.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
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

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" className="w-full">
            Back
          </Button>
          <Button type="submit" className="w-full">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TenderDocumentUploadForm;