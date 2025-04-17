
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
  const { users } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {users
                  .filter((user) => user.role === "employee")
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
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
            <FormLabel>Category</FormLabel>
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
                <SelectItem value="daily">Daily Fixed</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormAssignment;
