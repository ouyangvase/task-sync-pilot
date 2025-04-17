
import React from "react";
import { useFormContext } from "react-hook-form";
import { TaskFormValues } from "./taskSchema";
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
import { Input } from "@/components/ui/input";

const TaskFormMetrics: React.FC = () => {
  const form = useFormContext<TaskFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="points"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Points Value</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                placeholder="Enter points value" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormMetrics;
