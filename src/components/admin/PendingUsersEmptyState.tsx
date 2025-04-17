
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const PendingUsersEmptyState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Users waiting for account approval</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6 text-muted-foreground">
          No pending approval requests at the moment
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingUsersEmptyState;
