import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Document, insertDocumentSchema } from "@shared/schema";

// Since file upload is handled separately, this form is for metadata only
const formSchema = insertDocumentSchema
  .omit({ filePath: true, fileSize: true, fileType: true })
  .extend({
    status: z.string(),
  });

interface DocumentFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  document?: Document;
  isLoading?: boolean;
  buttonText?: string;
  relatedOptions?: Array<{ id: number; name: string; type: string }>;
}

export function DocumentForm({ 
  onSubmit, 
  document, 
  isLoading = false, 
  buttonText = "Save",
  relatedOptions = []
}: DocumentFormProps) {
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: document?.title || "",
      description: document?.description || "",
      type: document?.type || "",
      status: document?.status || "pending",
      relatedToId: document?.relatedToId,
      relatedToType: document?.relatedToType,
      uploadedById: document?.uploadedById || 1
    },
  });
  
  // Document types
  const documentTypes = [
    { value: "KYC", label: "KYC Document" },
    { value: "BID", label: "Bid Document" },
    { value: "CONTRACT", label: "Contract" },
    { value: "MILESTONE", label: "Project Milestone" },
    { value: "INVOICE", label: "Invoice" },
  ];
  
  // Document statuses
  const documentStatuses = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="KYC Verification Document" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a description of the document..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Document Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {relatedOptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="relatedToType"
              render={({ field }) => {
                // Get unique related types
                const types = [...new Set(relatedOptions.map(o => o.type))];
                
                return (
                  <FormItem>
                    <FormLabel>Related To Type (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear related ID when type changes
                        form.setValue('relatedToId', undefined);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <FormField
              control={form.control}
              name="relatedToId"
              render={({ field }) => {
                const relatedType = form.watch('relatedToType');
                const filteredOptions = relatedOptions.filter(
                  o => o.type === relatedType
                );
                
                return (
                  <FormItem>
                    <FormLabel>Related To Item (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                      disabled={!relatedType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default DocumentForm;
