import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Please select a role"),
  permissions: z.record(z.boolean()).default({}),
  active: z.boolean().default(true),
});

const baseSchema = formSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const editSchema = formSchema
  .omit({ password: true, confirmPassword: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof baseSchema>;

interface UserFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(isEdit ? editSchema : baseSchema),
    defaultValues: {
      userId: initialData?.userId || "",
      username: initialData?.username || "",
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      role: initialData?.role || "user",
      permissions: initialData?.permissions || {},
      active: initialData?.active ?? true,
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    if (isEdit && !data.password) {
      const { password, confirmPassword, ...dataWithoutPassword } = data;
      onSubmit(dataWithoutPassword as any);
    } else {
      onSubmit(data);
    }
  };

  const userRoles = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "user", label: "User" },
  ];

  const permissionTypes = [
    { value: "leads.view", label: "View Leads" },
    { value: "leads.create", label: "Create Leads" },
    { value: "leads.edit", label: "Edit Leads" },
    { value: "leads.delete", label: "Delete Leads" },
    { value: "tenders.view", label: "View Tenders" },
    { value: "tenders.create", label: "Create Tenders" },
    { value: "tenders.edit", label: "Edit Tenders" },
    { value: "tenders.delete", label: "Delete Tenders" },
    { value: "projects.view", label: "View Projects" },
    { value: "projects.create", label: "Create Projects" },
    { value: "projects.edit", label: "Edit Projects" },
    { value: "projects.delete", label: "Delete Projects" },
    { value: "users.view", label: "View Users" },
    { value: "users.create", label: "Create Users" },
    { value: "users.edit", label: "Edit Users" },
    { value: "users.delete", label: "Delete Users" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter User ID" {...field} disabled={isEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} disabled={isEdit} />
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
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEdit ? "New Password (optional)" : "Password"}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEdit ? "Confirm New Password" : "Confirm Password"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Permissions</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionTypes.map((permission) => (
              <FormField
                key={permission.value}
                control={form.control}
                name={`permissions.${permission.value}`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{permission.label}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
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
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    User can login and access the system
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {isEdit ? "Update User" : "Create User"}
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;
