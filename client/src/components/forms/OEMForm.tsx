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
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  List,
  ListOrdered,
  Undo,
  Image,
  Upload
} from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const oemFormSchema = z.object({
  oemId: z.string().min(1, "OEM ID is required"),
  oemName: z.string().min(1, "OEM name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  website: z.string().url("Invalid website URL").optional(),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  documentType: z.string().optional(),
  documentCategory: z.string().optional(),
  documentFile: z.any().optional(),
});

type OEMFormValues = z.infer<typeof oemFormSchema>;

interface OEMFormProps {
  onSubmit: (data: OEMFormValues) => void;
  initialData?: Partial<OEMFormValues>;
}

const OEMForm: React.FC<OEMFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<OEMFormValues>({
    resolver: zodResolver(oemFormSchema),
    defaultValues: {
      oemId: initialData?.oemId || "",
      oemName: initialData?.oemName || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      country: initialData?.country || "",
      pincode: initialData?.pincode || "",
      website: initialData?.website || "",
      status: initialData?.status || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      documentType: "",
      documentCategory: "KYC Documents",
      documentFile: null,
    },
  });

  const statuses = [
    "Active",
    "Inactive",
    "Under Review",
    "Blacklisted"
  ];

  const categories = [
    "Hardware",
    "Software",
    "Network Equipment",
    "Security Systems",
    "IoT Devices",
    "Other"
  ];

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

  const documentCategories = [
    "KYC Documents",
    "Company Documents",
    "Financial Documents",
    "Legal Documents",
    "Other Documents"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="oemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OEM ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter OEM ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OEM Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter OEM name" {...field} />
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
                    <FormLabel>Contact Person</FormLabel>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@company.com" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
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
                    <FormLabel>Status</FormLabel>
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
                        {statuses.map((status) => (
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
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter OEM description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company address" {...field} />
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
                    <FormLabel>City</FormLabel>
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
                    <FormLabel>State</FormLabel>
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold mb-6">Document Upload</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                  name="documentCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentCategories.map((category) => (
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
                name="documentFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer">
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file);
                          }}
                          accept=".pdf,.doc,.docx,.jpg,.png"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-gray-600">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            PDF, DOC, DOCX, JPG or PNG (MAX. 5MB)
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-0 bg-white border-t py-4 px-6">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

export default OEMForm; 