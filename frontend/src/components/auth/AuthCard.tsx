import { ReactNode } from "react";
import { Link } from "react-router-dom";
import LogoTransparent from "@/assets/branding/logo-transparent.png";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-xl border border-border">
      <div className="flex flex-col items-center space-y-4 text-center">
        <img
          src={LogoTransparent}
          alt="Kape Uno Bistro Logo"
          className="h-20 w-auto object-contain"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {children}

      {(footerText || footerLinkText) && (
        <p className="text-center text-sm text-muted-foreground">
          {footerText}{" "}
          {footerLinkText && footerLinkHref && (
            <Link to={footerLinkHref} className="font-medium text-primary hover:underline">
              {footerLinkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
