
import { User, UserRole } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PendingUserRow from "./PendingUserRow";

interface PendingUsersTableProps {
  pendingUsers: User[];
  processingIds: Record<string, boolean>;
  selectedRoles: Record<string, UserRole>;
  selectedTitles: Record<string, string>;
  onRoleChange: (userId: string, role: UserRole) => void;
  onTitleChange: (userId: string, title: string) => void;
  onApprove: (user: User) => void;
  onReject: (userId: string) => void;
}

const PendingUsersTable = ({
  pendingUsers,
  processingIds,
  selectedRoles,
  selectedTitles,
  onRoleChange,
  onTitleChange,
  onApprove,
  onReject
}: PendingUsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Title (Optional)</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingUsers.map((user) => {
          const isProcessing = processingIds[user.id] || false;
          const selectedRole = selectedRoles[user.id] || "employee";
          const selectedTitle = selectedTitles[user.id] || "none";

          return (
            <PendingUserRow
              key={user.id}
              user={user}
              isProcessing={isProcessing}
              selectedRole={selectedRole}
              selectedTitle={selectedTitle}
              onRoleChange={onRoleChange}
              onTitleChange={onTitleChange}
              onApprove={onApprove}
              onReject={onReject}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PendingUsersTable;
