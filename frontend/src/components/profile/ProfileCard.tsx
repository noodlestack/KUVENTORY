import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types/settings";
import { StatusBadge } from "@/components/common/StatusBadge";

interface ProfileCardProps {
  profile: UserProfile | null;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) return null;

  const initials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(dateStr));

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center pt-8 pb-4">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{profile.fullName}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {profile.role}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm mt-4">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground font-medium">Email</span>
          <span>{profile.email}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground font-medium">Phone</span>
          <span>{profile.phone || "-"}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground font-medium">Status</span>
          <StatusBadge status={profile.status} />
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground font-medium">Joined Date</span>
          <span>{formatDate(profile.createdAt)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted-foreground font-medium">Last Login</span>
          <span>{formatDate(profile.lastLogin)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
