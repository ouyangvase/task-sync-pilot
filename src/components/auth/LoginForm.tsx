
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      console.log("Login attempt with:", data.email);
      
      // Login attempt
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) throw error;
      
      // Special case for admin@tasksync.com - bypass approval check
      if (data.email === 'admin@tasksync.com') {
        toast.success("Login successful");
        navigate("/dashboard");
        return;
      }
      
      // After successful auth, check if user is approved
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        await supabase.auth.signOut();
        throw new Error("Error verifying account status. Please try again.");
      }
      
      // If user is not approved, sign them out
      if (!profileData || profileData.is_approved !== true) {
        await supabase.auth.signOut();
        throw new Error("Your account is pending approval by an administrator");
      }
      
      toast.success("Login successful");
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more user-friendly error messages
      let friendlyErrorMessage = error.message || "Invalid email or password";
      
      if (error.message.includes("Invalid login credentials")) {
        friendlyErrorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes("pending approval")) {
        friendlyErrorMessage = "Your account is pending approval by an administrator.";
      }
      
      setErrorMessage(friendlyErrorMessage);
      toast.error(friendlyErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login to TaskSync</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register now
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
