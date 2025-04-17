
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

const TaskFormScheduling: React.FC = () => {
  const form = useFormContext<TaskFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="recurrence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recurrence</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormScheduling;
