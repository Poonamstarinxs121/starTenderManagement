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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Vadodara",
  "Ghaziabad",
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const documentTypes = [
  "Invoice",
  "Contract",
  "Certificate",
  "License",
  "Registration",
  "Other"
];

const oemFormSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits").max(6, "Pin code must be 6 digits"),
  status: z.string().min(1, "Status is required"),
});

type OEMFormValues = z.infer<typeof oemFormSchema>;

interface OEMFormProps {
  onSubmit: (data: OEMFormValues) => void;
  onCancel: () => void;
  initialData?: OEMFormValues;
}

const OEMForm: React.FC<OEMFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [openCity, setOpenCity] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<OEMFormValues>({
    resolver: zodResolver(oemFormSchema),
    defaultValues: initialData || {
      vendorId: "",
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      status: "",
    },
  });

  const handleFormSubmit = (data: OEMFormValues) => {
    onSubmit(data);
  };

  const statuses = [
    "Active",
    "Inactive",
    "Under Review",
    "Blacklisted"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddDocument = () => {
    if (documentType && selectedFile) {
      console.log("Adding document:", {
        type: documentType,
        file: selectedFile
      });
      setDocumentType("");
      setSelectedFile(null);
      setShowDocumentForm(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-normal">Add new OEM</h2>
        <Button
          type="button"
          variant="outline"
          className="border border-gray-300 rounded-md px-6 py-2"
          onClick={() => setShowDocumentForm(!showDocumentForm)}
        >
          <span className="text-xl font-normal">Upload Document</span>
        </Button>
      </div>

      {showDocumentForm && (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-normal mb-1">Document Type*</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-full rounded border-gray-300 h-10">
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
              <label className="block text-sm font-normal mb-1">Upload File*</label>
              <div className="flex gap-4">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1 rounded border-gray-300 h-10"
                />
                <Button
                  type="button"
                  onClick={handleAddDocument}
                  disabled={!documentType || !selectedFile}
                  className="bg-gray-500 hover:bg-gray-600 text-white whitespace-nowrap px-6"
                >
                  Add Document
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowDocumentForm(false);
                  setDocumentType("");
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" className="bg-black text-white hover:bg-gray-800">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Vendor ID*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter vendor ID" 
                    {...field} 
                    className="rounded border-gray-300 h-10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Company Name*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter company name" 
                    {...field} 
                    className="rounded border-gray-300 h-10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Contact Person Name*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter contact person name" 
                    {...field} 
                    className="rounded border-gray-300 h-10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Phone No.*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter phone number" 
                      {...field} 
                      className="rounded border-gray-300 h-10"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email ID*</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter email address" 
                      {...field} 
                      className="rounded border-gray-300 h-10"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Address*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter address" 
                    className="resize-none rounded border-gray-300 h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">City*</FormLabel>
                  <Popover open={openCity} onOpenChange={setOpenCity}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? indianCities.find(
                                (city) => city === field.value
                              )
                            : "Select city"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {indianCities.map((city) => (
                            <CommandItem
                              value={city}
                              key={city}
                              onSelect={() => {
                                form.setValue("city", city);
                                setOpenCity(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  city === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">State*</FormLabel>
                  <Popover open={openState} onOpenChange={setOpenState}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? indianStates.find(
                                (state) => state === field.value
                              )
                            : "Select state"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search state..." />
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup>
                          {indianStates.map((state) => (
                            <CommandItem
                              value={state}
                              key={state}
                              onSelect={() => {
                                form.setValue("state", state);
                                setOpenState(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  state === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {state}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pinCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Pin Code*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter pin code" 
                    maxLength={6}
                    {...field} 
                    className="rounded border-gray-300 h-10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Status*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white hover:bg-gray-800">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OEMForm; 