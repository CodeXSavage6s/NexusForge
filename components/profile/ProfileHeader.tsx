import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, ShieldAlert, KeyRound } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  hasPassword: boolean;
}

export default function ProfileHeader({
  name,
  email,
  image,
  emailVerified,
  createdAt,
  hasPassword,
}: ProfileHeaderProps) {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-row items-start justify-between gap-2 rounded-lg border border-border bg-card p-2">
      <div className="flex gap-3">
        <Avatar size="lg" className="w-16 h-16">
          <AvatarImage src={image || undefined} alt={name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{name}</h3>
          <span className="text-sm text-muted-foreground">{email}</span>
          <span className="text-xs text-muted-foreground">User since {memberSince}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 text-xs">
        {emailVerified ? (
          <span className="flex items-center gap-1 text-green-500">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellow-500">
            <ShieldAlert className="h-3.5 w-3.5" /> Unverified
          </span>
        )}
        {hasPassword && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> Password login
          </span>
        )}
      </div>
    </div>
  );
}
