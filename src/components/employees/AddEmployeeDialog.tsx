
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPLOYEE_TITLES } from "./employee-details/constants";

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onEmployeeCreated: () => void;
}

const emailSchema = z.string().email("Please enter a valid email address");
const nameSchema = z.string().min(3, "Name must be at least 3 characters");

const AddEmployeeDialog = ({ open, onClose, onEmployeeCreated }: AddEmployeeDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    
    try {
      nameSchema.parse(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.name = error.errors[0].message;
      }
    }
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call to create and invite the employee
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Invitation sent to ${email}`);
      onEmployeeCreated();
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("employee");
    setTitle("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Employee</DialogTitle>
          <DialogDescription>
            Send an invitation to a new employee to join your organization.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={setRole}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Optional Title</Label>
              <Select 
                value={title} 
                onValueChange={setTitle}
              >
                <SelectTrigger id="title">
                  <SelectValue placeholder="Select a title (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Title</SelectItem>
                  {EMPLOYEE_TITLES.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              An invitation will be sent to the employee's email with instructions to complete registration.
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
