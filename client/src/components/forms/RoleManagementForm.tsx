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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const roleFormSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.object({
    users: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
    roles: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
    projects: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
    leads: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
    documents: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
    oems: z.object({
      view: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
    }),
  }),
  isActive: z.boolean().default(true),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleManagementFormProps {
  onSubmit: (data: RoleFormValues) => void;
  onCancel: () => void;
}

const RoleManagementForm: React.FC<RoleManagementFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        roles: { view: false, create: false, edit: false, delete: false },
        projects: { view: false, create: false, edit: false, delete: false },
        leads: { view: false, create: false, edit: false, delete: false },
        documents: { view: false, create: false, edit: false, delete: false },
        oems: { view: false, create: false, edit: false, delete: false },
      },
      isActive: true,
    },
  });

  const modules = [
    { key: 'users', label: 'Users Management' },
    { key: 'roles', label: 'Roles Management' },
    { key: 'projects', label: 'Projects Management' },
    { key: 'leads', label: 'Leads Management' },
    { key: 'documents', label: 'Documents Management' },
    { key: 'oems', label: 'OEMs Management' },
  ] as const;

  const permissions = ['view', 'create', 'edit', 'delete'] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create New Role</h2>
          <p className="text-sm text-gray-500">
            Add a new role to the system with specific permissions.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter role name" {...field} />
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
                  <Input placeholder="Enter role description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-md font-semibold">Permissions</h3>
            <div className="border rounded-lg">
              <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-50">
                <div className="font-semibold">Module</div>
                {permissions.map((permission) => (
                  <div key={permission} className="font-semibold capitalize">
                    {permission}
                  </div>
                ))}
              </div>
              {modules.map((module) => (
                <div key={module.key} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
                  <div className="font-medium">{module.label}</div>
                  {permissions.map((permission) => (
                    <FormField
                      key={`${module.key}.${permission}`}
                      control={form.control}
                      name={`permissions.${module.key}.${permission}` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Inactive roles cannot be assigned to users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            Create Role
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleManagementForm; 