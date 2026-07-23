import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Full-page notifications route kept for deep links.
 * Inbox UI now opens as a social-style popup from the top-right bell.
 */
export function NotificationsPage() {
  useEffect(() => {
    // Hint the shell bell: store a one-shot open flag
    sessionStorage.setItem('ieec-open-notifications', '1');
    window.dispatchEvent(new Event('ieec-open-notifications'));
  }, []);

  return <Navigate to="/app" replace />;
}
