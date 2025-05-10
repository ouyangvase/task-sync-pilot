
import { PendingUsersListProps } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "./EmptyState";
import PendingUsersTable from "./PendingUsersTable";

const PendingUsersList = ({ pendingUsers, onRefresh }: PendingUsersListProps) => {
  if (pendingUsers.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Users</CardTitle>
        <CardDescription>Update roles for newly registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <PendingUsersTable pendingUsers={pendingUsers} onRefresh={onRefresh} />
      </CardContent>
    </Card>
  );
};

export default PendingUsersList;
