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
import { Check, ChevronsUpDown, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

interface DocumentField {
  id: number;
  documentType: string;
  selectedFile: File | null;
  tags: string[];
}

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
  onSubmit: (data: OEMFormValues & { documents: Array<{ type: string; file: File }> }) => void;
  onCancel: () => void;
  initialData?: OEMFormValues & { documents?: Array<{ type: string; file: File }> };
}

const OEMForm: React.FC<OEMFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [openCity, setOpenCity] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showOEMForm, setShowOEMForm] = useState(true);
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([
    { id: 1, documentType: "", selectedFile: null, tags: [] }
  ]);
  const [documents, setDocuments] = useState<Array<{ type: string; file: File }>>(
    initialData?.documents || []
  );

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
    onSubmit({ ...data, documents });
  };

  const statuses = [
    "Active",
    "Inactive",
    "Under Review",
    "Blacklisted"
  ];

  const handleFileChange = (id: number, file: File | null) => {
    setDocumentFields(documentFields.map(field => 
      field.id === id ? { ...field, selectedFile: file } : field
    ));
  };

  const handleDocumentTypeChange = (id: number, value: string) => {
    setDocumentFields(documentFields.map(field => 
      field.id === id ? { ...field, documentType: value } : field
    ));
  };

  const handleTagChange = (id: number, value: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      setDocumentFields(documentFields.map(field => {
        if (field.id === id) {
          const newTags = field.tags.includes(value.trim()) 
            ? field.tags 
            : [...field.tags, value.trim()];
          return { ...field, tags: newTags };
        }
        return field;
      }));
      // Clear the input after adding tag
      e.currentTarget.value = "";
    }
  };

  const handleRemoveTag = (id: number, tagToRemove: string) => {
    setDocumentFields(documentFields.map(field => {
      if (field.id === id) {
        return { ...field, tags: field.tags.filter(tag => tag !== tagToRemove) };
      }
      return field;
    }));
  };

  const handleAddDocument = (id: number) => {
    const field = documentFields.find(f => f.id === id);
    if (field?.documentType && field?.selectedFile) {
      setDocuments([...documents, { type: field.documentType, file: field.selectedFile }]);
      // Clear the fields for this document
      setDocumentFields(documentFields.map(f => 
        f.id === id ? { ...f, documentType: "", selectedFile: null } : f
      ));
      // Reset the file input
      const fileInput = document.querySelector(`input[type="file"][data-id="${id}"]`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const removeDocumentField = (id: number) => {
    setDocumentFields(documentFields.filter(field => field.id !== id));
  };

  const addNewDocumentField = () => {
    setDocumentFields([...documentFields, { id: documentFields.length + 1, documentType: "", selectedFile: null, tags: [] }]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-6">
        <Button
          type="button"
          variant="outline"
          className="border border-gray-300 rounded-md px-6 py-2"
          onClick={() => {
            setShowDocumentForm(!showDocumentForm);
            if (!showOEMForm) {
              setShowOEMForm(true);
            }
          }}
        >
          <span className="text-xl font-normal">Upload Document</span>
        </Button>
      </div>

      {showDocumentForm ? (
        <div className="mb-8 border rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Upload Documents</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {documentFields.map((field) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal mb-1">Document Type*</label>
                    <Select
                      value={field.documentType}
                      onValueChange={(value) => handleDocumentTypeChange(field.id, value)}
                    >
                      <SelectTrigger>
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
                    <label className="block text-sm font-normal mb-1">Document Tags</label>
                    <div className="relative">
                      <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Type tag and press Enter"
                        onKeyDown={(e) => handleTagChange(field.id, (e.target as HTMLInputElement).value, e)}
                        className="w-full pl-8 h-9 text-sm border-gray-200"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(field.id, tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-normal mb-1">Upload File*</label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        data-id={field.id}
                        onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                        className="flex-1 rounded border-gray-300 h-10"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddDocument(field.id)}
                        disabled={!field.documentType || !field.selectedFile}
                        className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap px-4"
                      >
                        Add
                      </Button>
                      {documentFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeDocumentField(field.id)}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNewDocumentField}
              className="mt-4"
            >
              Add Another Document
            </Button>
          </div>

          {documents.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">{doc.file.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : showOEMForm ? (
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
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
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter address" 
                        {...field} 
                        className="resize-none h-20"
                      />
                    </FormControl>
                    <FormMessage />
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
      ) : null}
    </div>
  );
};

export default OEMForm; 