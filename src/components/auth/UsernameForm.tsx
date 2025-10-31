import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, UserPlus } from "lucide-react";

const usernameSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

export function UsernameForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'exists' | 'available'>('idle');
  const { signIn, checkUsername } = useAuth();

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const onCheckUsername = async (data: UsernameFormValues) => {
    setIsChecking(true);
    const result = await checkUsername(data.username);
    setUsernameStatus(result.exists ? 'exists' : 'available');
    setIsChecking(false);
  };

  const onConfirm = async () => {
    const username = form.getValues('username');
    setIsLoading(true);
    const { error, isExisting } = await signIn(username);
    
    if (error) {
      toast.error(error.message || "Failed to continue");
      setUsernameStatus('idle');
    } else {
      if (isExisting) {
        toast.success("Welcome back! Loading your previous work...");
      } else {
        toast.success("Account created! Let's get started...");
      }
    }
    
    setIsLoading(false);
  };

  const onReset = () => {
    setUsernameStatus('idle');
    form.reset();
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to MindMaker</h2>
        <p className="text-muted-foreground">Choose a username to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={usernameStatus === 'idle' ? form.handleSubmit(onCheckUsername) : undefined} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your_username" 
                    {...field} 
                    disabled={isLoading || isChecking || usernameStatus !== 'idle'}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {usernameStatus === 'exists' && (
            <Alert className="border-primary bg-primary/10">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Welcome back, @{form.getValues('username')}!</strong>
                <br />
                Your previous work will be loaded.
              </AlertDescription>
            </Alert>
          )}

          {usernameStatus === 'available' && (
            <Alert className="border-green-500 bg-green-500/10">
              <UserPlus className="h-4 w-4" />
              <AlertDescription>
                <strong>This username is available!</strong>
                <br />
                You're creating a new account.
              </AlertDescription>
            </Alert>
          )}

          {usernameStatus === 'idle' ? (
            <Button type="submit" className="w-full" disabled={isLoading || isChecking}>
              {isChecking ? "Checking..." : "Continue"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                type="button" 
                onClick={onConfirm} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : usernameStatus === 'exists' ? "Log In" : "Create Account"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onReset} 
                className="w-full"
                disabled={isLoading}
              >
                Change Username
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
