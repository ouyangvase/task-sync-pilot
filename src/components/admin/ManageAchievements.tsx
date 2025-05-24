import { useState } from "react";
import { Achievement } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"

interface AchievementFormValues {
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
}

export function ManageAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Task",
      description: "Complete your first task",
      icon: "✅",
      category: "task",
      criteria: {
        type: "task_count",
        value: 1,
      },
      isUnlocked: true,
      unlockedDate: "2024-01-01",
    },
    {
      id: "2",
      title: "5 Tasks",
      description: "Complete 5 tasks",
      icon: "💪",
      category: "task",
      criteria: {
        type: "task_count",
        value: 5,
      },
      isUnlocked: false,
    },
    {
      id: "3",
      title: "100 Points",
      description: "Earn 100 points",
      icon: "⭐",
      category: "points",
      criteria: {
        type: "points_earned",
        value: 100,
      },
      isUnlocked: false,
    },
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();

  const handleAddAchievement = (data: any) => {
    const newAchievement: Omit<Achievement, "id" | "isUnlocked" | "unlockedDate" | "currentPoints"> = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      category: "points" as const,
      criteria: {
        type: "points_earned" as const,
        value: data.pointsRequired,
        timeframe: "all_time" as const
      },
      pointsRequired: data.pointsRequired
    };
    
    const achievement: Achievement = {
      id: Date.now().toString(),
      ...newAchievement,
      isUnlocked: false,
      unlockedDate: undefined,
      currentPoints: 0
    };
    
    setAchievements([...achievements, achievement]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAchievement = (data: any) => {
    const updatedAchievement: Partial<Achievement> = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      category: "points" as const,
      criteria: {
        type: "points_earned" as const,
        value: data.pointsRequired,
        timeframe: "all_time" as const
      },
      pointsRequired: data.pointsRequired
    };
    
    setAchievements(achievements.map(a => 
      a.id === editingAchievement?.id 
        ? { ...a, ...updatedAchievement }
        : a
    ));
    setEditingAchievement(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
    toast({
      title: "Achievement deleted.",
      description: "The achievement has been successfully deleted.",
    })
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Achievements</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
              <DialogDescription>
                Create a new achievement to motivate your team.
              </DialogDescription>
            </DialogHeader>
            <AchievementForm onSubmit={handleAddAchievement} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Points Required</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell className="font-medium">{achievement.icon}</TableCell>
                <TableCell>{achievement.title}</TableCell>
                <TableCell>{achievement.description}</TableCell>
                <TableCell className="text-right">{achievement.pointsRequired}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingAchievement(achievement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Achievement</DialogTitle>
                          <DialogDescription>
                            Update the achievement details.
                          </DialogDescription>
                        </DialogHeader>
                        <AchievementForm
                          onSubmit={handleUpdateAchievement}
                          initialValues={{
                            title: achievement.title,
                            description: achievement.description,
                            icon: achievement.icon,
                            pointsRequired: achievement.pointsRequired || 0,
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAchievement(achievement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface AchievementFormProps {
  onSubmit: (data: AchievementFormValues) => void;
  initialValues?: Partial<AchievementFormValues>;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ onSubmit, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [icon, setIcon] = useState(initialValues?.icon || "");
  const [pointsRequired, setPointsRequired] = useState(initialValues?.pointsRequired || 0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ title, description, icon, pointsRequired });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="icon">Icon</Label>
        <Input
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pointsRequired">Points Required</Label>
        <Input
          type="number"
          id="pointsRequired"
          value={pointsRequired}
          onChange={(e) => setPointsRequired(Number(e.target.value))}
          required
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
};
