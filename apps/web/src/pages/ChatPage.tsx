import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useChatDock } from '../lib/chatDock';

/** Full-page chat route opens the social popup dock instead. */
export function ChatPage() {
  const { openChat } = useChatDock();

  useEffect(() => {
    openChat();
  }, [openChat]);

  return <Navigate to="/app" replace />;
}
