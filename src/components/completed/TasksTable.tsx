
import { useState } from "react";
import { format } from "date-fns";
import { Download, SortAsc, SortDesc } from "lucide-react";
import { Task, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getTaskColor } from "@/lib/taskUtils";

interface TasksTableProps {
  tasks: Task[];
  users: User[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

type SortField = "title" | "completedAt" | "points" | "assignee";
type SortDirection = "asc" | "desc";

const TasksTable = ({ tasks, users, onExportCSV, onExportPDF }: TasksTableProps) => {
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortField) {
      case "title":
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      case "completedAt":
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return sortDirection === "asc" 
          ? new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
          : new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      case "points":
        return sortDirection === "asc" 
          ? a.points - b.points 
          : b.points - a.points;
      case "assignee":
        return sortDirection === "asc" 
          ? getUserName(a.assignee).localeCompare(getUserName(b.assignee))
          : getUserName(b.assignee).localeCompare(getUserName(a.assignee));
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />;
  };

  return (
    <div>
      <div className="flex justify-end mb-4 space-x-2">
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="mr-1 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <Download className="mr-1 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {tasks.length === 0 ? 
              "No completed tasks found." : 
              `Showing ${tasks.length} completed task${tasks.length === 1 ? "" : "s"}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Task Title
                  <SortIcon field="title" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("completedAt")}
              >
                <div className="flex items-center">
                  Completion Date
                  <SortIcon field="completedAt" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("points")}
              >
                <div className="flex items-center">
                  Points
                  <SortIcon field="points" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("assignee")}
              >
                <div className="flex items-center">
                  Completed By
                  <SortIcon field="assignee" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  {task.completedAt ? 
                    format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a") : 
                    "Not completed"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    {task.points} pts
                  </Badge>
                </TableCell>
                <TableCell>{getUserName(task.assignee)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TasksTable;
