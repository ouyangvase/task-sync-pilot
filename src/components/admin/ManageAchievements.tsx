
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Achievement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  pointsRequired: z.coerce.number().min(1, "Points required must be at least 1"),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

interface ManageAchievementsProps {
  achievements: Achievement[];
  onAdd?: (achievement: Omit<Achievement, "id" | "isUnlocked" | "unlockedDate" | "currentPoints">) => void;
  onUpdate?: (id: string, achievement: Partial<Achievement>) => void;
  onDelete?: (id: string) => void;
}

const ManageAchievements = ({
  achievements,
  onAdd,
  onUpdate,
  onDelete,
}: ManageAchievementsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "🏆",
      pointsRequired: 100,
    },
  });

  const handleAdd = (data: AchievementFormValues) => {
    if (onAdd) {
      onAdd({
        title: data.title,
        description: data.description,
        icon: data.icon,
        pointsRequired: data.pointsRequired,
      });
    }
    toast.success("Achievement added successfully");
    form.reset();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    form.reset({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      pointsRequired: achievement.pointsRequired,
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdate = (data: AchievementFormValues) => {
    if (editingAchievement && onUpdate) {
      onUpdate(editingAchievement.id, {
        title: data.title,
        description: data.description,
        icon: data.icon,
        pointsRequired: data.pointsRequired,
      });
    }
    toast.success("Achievement updated successfully");
    form.reset();
    setEditingAchievement(null);
    setIsAddDialogOpen(false);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingId && onDelete) {
      onDelete(deletingId);
      toast.success("Achievement deleted successfully");
    }
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingAchievement(null);
    }
    setIsAddDialogOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Achievements</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? "Edit Achievement" : "Add New Achievement"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(editingAchievement ? handleUpdate : handleAdd)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task Master - 100 Tasks Completed" {...field} />
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
                        <Textarea
                          placeholder="Describe the achievement and how to unlock it"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Emoji)</FormLabel>
                      <FormControl>
                        <Input placeholder="🏆" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pointsRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Required</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAchievement ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Achievement</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this achievement? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.pointsRequired} points required
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(achievement)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => confirmDelete(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageAchievements;
