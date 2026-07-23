type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Avatar({ name, photoUrl, size = 'md', className = '' }: AvatarProps) {
  const label = initials(name);
  return (
    <span className={`person-avatar size-${size} ${className}`.trim()} aria-hidden={photoUrl ? undefined : true}>
      {photoUrl ? (
        <img src={photoUrl} alt="" />
      ) : (
        <span className="person-avatar-fallback">{label}</span>
      )}
    </span>
  );
}
