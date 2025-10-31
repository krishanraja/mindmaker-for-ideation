import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const usernameSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

export function UsernameForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (data: UsernameFormValues) => {
    setIsLoading(true);
    const { error } = await signIn(data.username);
    
    if (error) {
      toast.error(error.message || "Failed to continue");
    } else {
      toast.success("Welcome!");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome to MindMaker</h2>
        <p className="text-muted-foreground">Choose a username to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={isLoading}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  New users will be created automatically. Returning users can enter their existing username.
                </p>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
