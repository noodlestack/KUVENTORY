import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCard } from "@/components/auth/AuthCard";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const forgotSchema = z.object({
  emailOrUsername: z.string().min(1, { message: "Email or username is required" }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { emailOrUsername: "" },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Request Sent"
        description="Check your email for reset instructions."
      >
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email or username to receive a reset link"
      footerText="Remembered your password?"
      footerLinkText="Back to Login"
      footerLinkHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="emailOrUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email or username" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Reset Request
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
