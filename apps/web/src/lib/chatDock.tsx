import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ChatDockValue {
  open: boolean;
  channelId: string | null;
  openChat: (channelId?: string | null) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatDockContext = createContext<ChatDockValue | null>(null);

export function ChatDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  const openChat = useCallback((id?: string | null) => {
    if (id) setChannelId(id);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => setOpen(false), []);

  const toggleChat = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ open, channelId, openChat, closeChat, toggleChat }),
    [open, channelId, openChat, closeChat, toggleChat],
  );

  return <ChatDockContext.Provider value={value}>{children}</ChatDockContext.Provider>;
}

export function useChatDock() {
  const ctx = useContext(ChatDockContext);
  if (!ctx) throw new Error('useChatDock requires ChatDockProvider');
  return ctx;
}
