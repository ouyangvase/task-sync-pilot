
import React from "react";
import { useFormContext } from "react-hook-form";
import { TaskFormValues } from "./taskSchema";
import { useAuth } from "@/contexts/AuthContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TaskFormAssignment: React.FC = () => {
  const form = useFormContext<TaskFormValues>();
  const { currentUser, getAssignableUsers } = useAuth();

  // Get users that the current user can assign tasks to based on their role and permissions
  const assignableUsers = currentUser ? getAssignableUsers(currentUser.id) : [];

  const categoryOptions = [
    { value: "follow_up", label: "Follow Up", description: "Checking in with leads, clients, or pending actions" },
    { value: "new_sales", label: "New Sales", description: "New sales tasks or outreach activities" },
    { value: "admin", label: "Admin", description: "Internal team operations and administrative tasks" },
    { value: "content", label: "Content", description: "Content creation, editing, or posting tasks" },
    { value: "customer_service", label: "Customer Service", description: "Support-related assignments and customer interactions" },
    { value: "custom", label: "Custom", description: "Tasks that don't fit existing categories" },
  ];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="assignee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign To</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {assignableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
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
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Category</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">
              Choose a category to group tasks by function
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormAssignment;
