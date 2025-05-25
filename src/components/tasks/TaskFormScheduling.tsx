
import React from "react";
import { useFormContext } from "react-hook-form";
import { TaskFormValues } from "./taskSchema";
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
import { Input } from "@/components/ui/input";

const TaskFormScheduling: React.FC = () => {
  const form = useFormContext<TaskFormValues>();

  const getRecurrenceDescription = (value: string) => {
    switch (value) {
      case "once":
        return "Task will appear once only. Once completed, it will not appear again.";
      case "daily":
        return "Task will automatically repeat every day. Even if completed today, it will appear again tomorrow until manually removed.";
      case "weekly":
        return "Task will repeat once every week on the same weekday until manually removed.";
      case "monthly":
        return "Task will repeat once every month on the same date until manually removed.";
      default:
        return "";
    }
  };

  const currentRecurrence = form.watch("recurrence");

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
            <FormDescription className="text-xs">
              {getRecurrenceDescription(currentRecurrence)}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date & Time</FormLabel>
            <FormControl>
              <Input 
                type="datetime-local" 
                {...field}
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Set both date and time when this task should be completed
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskFormScheduling;
