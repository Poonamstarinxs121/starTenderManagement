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
import { Slider } from "@/components/ui/slider";
import { Tender, insertTenderSchema } from "@shared/schema";

// Extend the schema with additional validations
const formSchema = insertTenderSchema.extend({
  value: z.number().min(0, "Value must be positive").optional(),
  probability: z.number().min(0, "Probability must be at least 0").max(100, "Probability cannot exceed 100").default(50),
  deadline: z.string().min(1, "Deadline is required"),
  submissionDate: z.string().optional(),
  requirements: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, "Requirement title is required"),
    description: z.string().optional()
  })).default([]),
});

interface TenderFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  tender?: Tender;
  isLoading?: boolean;
  buttonText?: string;
}

export function TenderForm({ 
  onSubmit, 
  tender, 
  isLoading = false, 
  buttonText = "Save" 
}: TenderFormProps) {
  // Format dates for form
  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  // Parse requirements array from tender
  const getRequirements = (tender?: Tender) => {
    if (!tender?.requirements) return [];
    return Array.isArray(tender.requirements) ? tender.requirements : [];
  };
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: tender?.title || "",
      reference: tender?.reference || "",
      client: tender?.client || "",
      description: tender?.description || "",
      value: tender?.value || 0,
      deadline: formatDateForInput(tender?.deadline),
      submissionDate: formatDateForInput(tender?.submissionDate),
      status: tender?.status || "draft",
      probability: tender?.probability || 50,
      assignedToId: tender?.assignedToId,
      notes: tender?.notes || "",
      requirements: getRequirements(tender),
    },
  });
  
  // Tender statuses
  const tenderStatuses = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "evaluation", label: "Under Evaluation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];
  
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert string dates to ISO strings
    const formattedData = {
      ...data,
      deadline: new Date(data.deadline).toISOString(),
      submissionDate: data.submissionDate ? new Date(data.submissionDate).toISOString() : undefined,
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tender Title</FormLabel>
                <FormControl>
                  <Input placeholder="Office Renovation Project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Number</FormLabel>
                <FormControl>
                  <Input placeholder="TDR-2023-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corporation" {...field} />
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
                  placeholder="Briefly describe the tender opportunity..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bid Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submission Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {tenderStatuses.map((status) => (
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
          
          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Win Probability: {field.value}%</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional notes about this tender..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TenderForm;
