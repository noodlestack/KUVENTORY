import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export function Login() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your Kuventory account"
      footerText="Need help?"
      footerLinkText="Contact Administrator"
      footerLinkHref="#"
    >
      <LoginForm />
    </AuthCard>
  );
}
