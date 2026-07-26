import { cn } from "@/utils/utils";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-destructive";
      case 2:
        return "bg-warning";
      case 3:
        return "bg-info";
      case 4:
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return "";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1 w-full gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-full flex-1 rounded-full transition-colors",
              level <= strength ? getStrengthColor(strength) : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-right text-xs font-medium text-muted-foreground">
        {getStrengthText(strength)}
      </p>
    </div>
  );
}
