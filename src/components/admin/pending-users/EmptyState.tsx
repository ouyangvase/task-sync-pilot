
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EmptyState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Users</CardTitle>
        <CardDescription>Recently registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6 text-muted-foreground">
          No new users at the moment
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
