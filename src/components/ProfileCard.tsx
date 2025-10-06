import React from "react";
import { User } from "lucide-react";

type ProfileCardProps = {
  name: string;
  role: string;
  blurb?: string;
  avatarUrl?: string;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ name, role, blurb, avatarUrl }) => {
  return (
    <div
      className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md px-5 py-4 shadow-[8px_8px_24px_rgba(2,6,23,0.06),-8px_-8px_24px_rgba(255,255,255,0.85)]"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full shadow-inner flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F4EFE5' }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-foreground/40" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{role}</div>
        </div>
        <div className="ml-auto">
          <button className="rounded-md px-3 py-1 text-xs font-medium shadow-sm hover:opacity-90" style={{ backgroundColor: '#B4530A', color: '#FFFFFF', opacity: 0.8 }}>
            View
          </button>
        </div>
      </div>
      {blurb ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {blurb}
        </p>
      ) : null}
    </div>
  );
};

export default ProfileCard;


