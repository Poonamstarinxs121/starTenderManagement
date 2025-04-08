import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const bidFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  value: z.number().min(0, 'Value must be positive'),
  status: z.string().min(1, 'Status is required'),
  submissionDate: z.date(),
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  contactPersonEmail: z.string().email('Invalid email address'),
  contactPersonPhone: z.string().min(10, 'Invalid phone number'),
  taxGstNumber: z.string().min(1, 'Tax/GST number is required'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be positive'),
  companyWebsite: z.string().url('Invalid website URL'),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

interface BidFormProps {
  onSubmit: (data: BidFormValues) => void;
  isLoading?: boolean;
  buttonText?: string;
}

export default function BidForm({ onSubmit, isLoading, buttonText = 'Create Bid' }: BidFormProps) {
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      status: 'draft',
      yearsOfExperience: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Bid Details</h2>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bid title" {...field} />
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
                <FormLabel className="required">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter bid description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Bid Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter bid value"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                  <FormLabel className="required">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="submissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="required">Submission Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Company Information</h2>
          
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Company Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter company address"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactPersonEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Contact Person Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPersonPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Contact Person Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxGstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Tax/GST Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Tax/GST number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter years of experience"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="companyWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Website</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company website URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Loading...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    </Form>
  );
}
