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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  Image
} from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const projectFormSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  customer: z.string().min(1, "Customer is required"),
  calculateProgress: z.boolean().default(false),
  progress: z.number().min(0).max(100).default(0),
  billingType: z.string().min(1, "Billing type is required"),
  status: z.string().min(1, "Status is required"),
  totalRate: z.string().min(1, "Total rate is required"),
  estimatedHours: z.string().min(1, "Estimated hours is required"),
  member: z.string().min(1, "Member is required"),
  startDate: z.string().min(1, "Start date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  tags: z.string().optional(),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormValues) => void;
  initialData?: Partial<ProjectFormValues>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: initialData?.projectName || "",
      customer: initialData?.customer || "",
      calculateProgress: initialData?.calculateProgress || false,
      progress: initialData?.progress || 0,
      billingType: initialData?.billingType || "",
      status: initialData?.status || "",
      totalRate: initialData?.totalRate || "",
      estimatedHours: initialData?.estimatedHours || "",
      member: initialData?.member || "",
      startDate: initialData?.startDate || "",
      deadline: initialData?.deadline || "",
      tags: initialData?.tags || "",
      description: initialData?.description || "",
    },
  });

  // Static data for dropdowns
  const customers = [
    { id: "1", name: "Customer A" },
    { id: "2", name: "Customer B" },
    { id: "3", name: "Customer C" },
  ];

  const billingTypes = [
    "Fixed Rate",
    "Project Hours",
    "Task Hours"
  ];

  const statuses = [
    "Not Started",
    "In Progress",
    "On Hold",
    "Cancelled",
    "Finished"
  ];

  const members = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Johnson" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Customer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.name}>
                        {customer.name}
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
            name="calculateProgress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm">
                    Calculate progress through tasks
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Progress</FormLabel>
                <FormControl>
                  <Progress value={field.value} className="w-full" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Billing Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {billingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
                    {statuses.map((status) => (
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
            name="totalRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Total Rate (₹)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter total rate" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Estimated Hours</FormLabel>
                <FormControl>
                  <Input placeholder="Enter estimated hours" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="member"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Member</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Tags</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tags (comma separated)" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel className="text-sm">Description</FormLabel>
              <div className="border rounded-md">
                <div className="border-b p-2 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 border-r pr-2">
                    <select className="text-sm outline-none">
                      <option>Verdana</option>
                      <option>Arial</option>
                      <option>Times New Roman</option>
                    </select>
                    <select className="text-sm outline-none">
                      <option>12pt</option>
                      <option>14pt</option>
                      <option>16pt</option>
                    </select>
                  </div>
                  
                  <ToggleGroup type="multiple" className="flex gap-1">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold">
                      <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic">
                      <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <div className="border-l pl-2">
                    <ToggleGroup type="single" className="flex gap-1">
                      <ToggleGroupItem value="left" aria-label="Align left">
                        <AlignLeft className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="center" aria-label="Align center">
                        <AlignCenter className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="right" aria-label="Align right">
                        <AlignRight className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="justify" aria-label="Align justify">
                        <AlignJustify className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="border-l pl-2 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Undo className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Enter project description"
                    className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4 sticky bottom-0 bg-white border-t py-4">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
