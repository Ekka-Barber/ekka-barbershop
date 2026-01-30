import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { logout as sharedLogout } from '@shared/lib/access-code/auth';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Clear server-side session variables and local storage
      await sharedLogout();

      // Clear React Query cache
      queryClient.clear();

      // Optionally clear app caches via service worker helper if available
      const clearAppCache = (window as { clearAppCache?: () => void }).clearAppCache;
      if (typeof clearAppCache === 'function') {
        // Best-effort, do not await
        try {
          clearAppCache();
        } catch (_) {
          // ignore
        }
      }
    } finally {
      navigate('/login');
    }
  };
}
