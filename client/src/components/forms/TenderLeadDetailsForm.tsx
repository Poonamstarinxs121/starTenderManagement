import React from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const leadDetailsSchema = z.object({
  leadId: z.string().min(1, "Lead selection is required"),
});

type LeadDetailsFormValues = z.infer<typeof leadDetailsSchema>;

interface TenderLeadDetailsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

// Mock data - replace with actual API call
const mockLeads = [
  {
    id: "1",
    title: "Government Infrastructure Project",
    client: "Ministry of Infrastructure",
    value: "₹50,00,000",
    status: "Active",
  },
  {
    id: "2",
    title: "Smart City Development",
    client: "Municipal Corporation",
    value: "₹75,00,000",
    status: "Active",
  },
];

const TenderLeadDetailsForm: React.FC<TenderLeadDetailsFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const form = useForm<LeadDetailsFormValues>({
    resolver: zodResolver(leadDetailsSchema),
    defaultValues: {
      leadId: initialData?.leadId || "",
    },
  });

  const selectedLead = form.watch("leadId")
    ? mockLeads.find((lead) => lead.id === form.watch("leadId"))
    : null;

  const handleSubmit = (data: LeadDetailsFormValues) => {
    const leadData = {
      ...data,
      leadDetails: selectedLead,
    };
    onSubmit(leadData);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Lead*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.title}
                      </SelectItem>
                    ))}
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
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{selectedLead.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{selectedLead.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Value</p>
                    <p className="font-medium">{selectedLead.value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedLead.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full">
            Continue with Selected Lead
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TenderLeadDetailsForm; 