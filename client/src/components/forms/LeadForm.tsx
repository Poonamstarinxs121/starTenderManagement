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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const leadFormSchema = z.object({
  status: z.string().min(1, "Status is required"),
  source: z.string().min(1, "Source is required"),
  department: z.string().min(1, "Department is required"),
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  tenderId: z.string().min(1, "Tender ID is required"),
  bidStartDate: z.string().min(1, "Bid start date is required"),
  bidEndDate: z.string().min(1, "Bid end date is required"),
  leadValue: z.string().min(1, "Lead value is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  hasEMD: z.string().min(1, "EMD selection is required"),
  emdAmount: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (data: LeadFormValues) => void;
  initialData?: Partial<LeadFormValues>;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      status: initialData?.status || "",
      source: initialData?.source || "",
      department: initialData?.department || "",
      name: initialData?.name || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      tenderId: initialData?.tenderId || "",
      bidStartDate: initialData?.bidStartDate || "",
      bidEndDate: initialData?.bidEndDate || "",
      leadValue: initialData?.leadValue || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      hasEMD: initialData?.hasEMD || "",
      emdAmount: initialData?.emdAmount || "",
      notes: initialData?.notes || "",
    },
  });

  // Static data for dropdowns
  const companies = [
    { id: "1", name: "Company A" },
    { id: "2", name: "Company B" },
    { id: "3", name: "Company C" },
  ];

  const sources = [
    "GEM",
    "MP Tender",
    "Def Proc",
    "Eprocure"
  ];

  // Indian cities data (you can expand this list)
  const indianCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Pune",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
  ];

  const hasEMDOptions = ["Yes", "No"];

  const leadStatuses = [
    "Prospective",
    "Open",
    "Bid Participating",
    "Technical",
    "Bid to RA",
    "Customer"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leadStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Assigned To</FormLabel>
                <FormControl>
                  <Input placeholder="Enter assigned person" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Company</FormLabel>
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
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" type="email" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tenderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Tender ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tender ID" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bidStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Bid Start Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bidEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Bid End Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Lead Value</FormLabel>
                <FormControl>
                  <Input placeholder="Enter lead value" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">City</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {indianCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasEMD"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">EMD Required</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hasEMDOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {form.watch("hasEMD") === "Yes" && (
            <FormField
              control={form.control}
              name="emdAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">EMD Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter EMD amount" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter notes"
                  className="h-16"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default LeadForm;
