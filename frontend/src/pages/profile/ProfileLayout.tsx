import { useProfile } from "@/hooks/settings/useSettings";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileForm } from "@/components/profile/ProfileForm";

export function ProfileLayout() {
  const { profile, isLoading, updateProfile } = useProfile();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} onSubmit={updateProfile} />
        </div>
      </div>
    </div>
  );
}
