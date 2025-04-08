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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const participatingCompanySchema = z.object({
  companyId: z.string().min(1, "Company selection is required"),
});

type ParticipatingCompanyFormValues = z.infer<typeof participatingCompanySchema>;

interface TenderParticipatingCompanyFormProps {
  onSubmit: (data: any) => void;
  initialData?: any[];
  leadDetails: any;
}

// Mock data - replace with actual API call
const mockCompanies = [
  {
    id: "1",
    name: "Tech Solutions Ltd",
    type: "Technology",
    location: "Mumbai",
    status: "Active",
  },
  {
    id: "2",
    name: "Infrastructure Corp",
    type: "Construction",
    location: "Delhi",
    status: "Active",
  },
  {
    id: "3",
    name: "Engineering Systems",
    type: "Engineering",
    location: "Bangalore",
    status: "Active",
  },
];

const TenderParticipatingCompanyForm: React.FC<TenderParticipatingCompanyFormProps> = ({
  onSubmit,
  initialData,
  leadDetails,
}) => {
  const [selectedCompanies, setSelectedCompanies] = useState<any[]>(initialData || []);

  const form = useForm<ParticipatingCompanyFormValues>({
    resolver: zodResolver(participatingCompanySchema),
    defaultValues: {
      companyId: "",
    },
  });

  const handleAddCompany = (data: ParticipatingCompanyFormValues) => {
    const company = mockCompanies.find((c) => c.id === data.companyId);
    if (company && !selectedCompanies.find((c) => c.id === company.id)) {
      setSelectedCompanies([...selectedCompanies, company]);
    }
    form.reset();
  };

  const handleRemoveCompany = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter((c) => c.id !== companyId));
  };

  const handleSubmit = () => {
    onSubmit(selectedCompanies);
  };

  return (
    <div className="space-y-6">
      {leadDetails && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Selected Lead Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{leadDetails.leadDetails.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{leadDetails.leadDetails.client}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddCompany)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Participating Company*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockCompanies
                      .filter((company) => !selectedCompanies.find((c) => c.id === company.id))
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Add Company
          </Button>
        </form>
      </Form>

      {selectedCompanies.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected Companies</h3>
          {selectedCompanies.map((company) => (
            <Card key={company.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{company.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{company.type}</Badge>
                    <Badge variant="outline">{company.location}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCompany(company.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleSubmit} className="w-full">
            Continue with Selected Companies
          </Button>
        </div>
      )}
    </div>
  );
};

export default TenderParticipatingCompanyForm; 