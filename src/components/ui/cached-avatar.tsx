import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCachedAvatar } from "@/hooks/useCachedAvatar";

interface CachedAvatarProps {
  googleAvatarUrl: string | null | undefined;
  cachedAvatarUrl?: string | null; // Pre-cached avatar URL from database
  authorName?: string;
  className?: string;
  fallbackClassName?: string;
  size?: number;
}

/**
 * Avatar component that automatically caches Google profile images
 * to avoid rate limiting issues
 */
export function CachedAvatar({
  googleAvatarUrl,
  cachedAvatarUrl,
  authorName,
  className,
  fallbackClassName,
  size = 40,
}: CachedAvatarProps) {
  // If we have a pre-cached URL from database, use it directly (no need to call hook)
  const { cachedUrl } = useCachedAvatar(
    cachedAvatarUrl ? null : googleAvatarUrl, // Only fetch if not already cached
    authorName
  );

  // Priority: database cached URL > hook cached URL > Google URL
  const avatarUrl = cachedAvatarUrl || cachedUrl || googleAvatarUrl;

  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {avatarUrl ? (
        <AvatarImage 
          src={avatarUrl} 
          alt={authorName || 'Avatar'} 
          className="object-cover"
          onError={(e) => {
            // If image fails to load, try fallback
            const target = e.target as HTMLImageElement;
            // If we were using cached URL and it failed, try Google URL
            if (cachedUrl && avatarUrl === cachedUrl && googleAvatarUrl) {
              target.src = googleAvatarUrl;
            } else {
              // Otherwise, let fallback show
              target.style.display = 'none';
            }
          }}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {authorName ? authorName.charAt(0).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  );
}

