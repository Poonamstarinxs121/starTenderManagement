import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BasicDetails } from "@/pages/TenderManagementPage";

const basicDetailsSchema = z.object({
  participatingCompany: z.string().min(1, "Participating company is required"),
  tenderName: z.string().min(1, "Tender name is required"),
  tenderId: z.string().min(1, "Tender ID is required"),
  clientName: z.string().min(1, "Client name is required"),
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  publishDate: z.string().min(1, "Publish date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type BasicDetailsFormData = z.infer<typeof basicDetailsSchema>;

interface TenderBasicDetailsFormProps {
  onSubmit: (data: BasicDetailsFormData) => void;
  initialData: BasicDetails | null;
}

const TenderBasicDetailsForm: React.FC<TenderBasicDetailsFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const form = useForm<BasicDetailsFormData>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: initialData || {
      participatingCompany: "",
      tenderName: "",
      tenderId: "",
      clientName: "",
      deliveryLocation: "",
      publishDate: "",
      endDate: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="participatingCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participating Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tender Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tender ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};

export default TenderBasicDetailsForm; 