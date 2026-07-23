import { Permissions } from '@ieec/shared';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';
import { useChatDock } from '../lib/chatDock';

type View = 'list' | 'thread' | 'members' | 'create';

export function ChatDock() {
  const { open, channelId, openChat, closeChat, toggleChat } = useChatDock();
  const { has, person: me, refresh } = useSession();
  const [tick, setTick] = useState(0);
  const [view, setView] = useState<View>('list');
  const [selectedChannelId, setSelectedChannelId] = useState(channelId ?? '');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [addPersonId, setAddPersonId] = useState('');
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const canCreate = has(Permissions.chatCreate);
  const canManageMembers = has(Permissions.chatManageMembers);
  const state = demoStore.getState();

  const myChannels = useMemo(() => {
    void tick;
    return demoStore.listMyChatChannels();
  }, [tick]);

  const selectedChannel =
    myChannels.find((c) => c.id === selectedChannelId) ??
    myChannels.find((c) => c.id === channelId) ??
    myChannels[0] ??
    null;

  const messages = useMemo(() => {
    void tick;
    if (!selectedChannel) return [];
    try {
      return demoStore.listChatMessages(selectedChannel.id);
    } catch {
      return [];
    }
  }, [tick, selectedChannel]);

  const members = useMemo(() => {
    void tick;
    if (!selectedChannel) return [];
    return demoStore.listChatMembers(selectedChannel.id);
  }, [tick, selectedChannel]);

  const unreadChat = useMemo(() => {
    void tick;
    return demoStore
      .listMyNotifications(true)
      .filter((n) => n.type.startsWith('chat.') && n.status !== 'read').length;
  }, [tick]);

  useEffect(() => {
    if (channelId) {
      setSelectedChannelId(channelId);
      setView('thread');
    }
  }, [channelId]);

  useEffect(() => {
    if (open && selectedChannel && view === 'thread') {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages.length, selectedChannel, view]);

  function bump() {
    refresh();
    setTick((t) => t + 1);
  }

  function openChannel(id: string) {
    setSelectedChannelId(id);
    setView('thread');
    setError('');
    openChat(id);
    // Mark related chat notifications read
    for (const n of demoStore.listMyNotifications(true)) {
      if (n.type.startsWith('chat.') && n.status !== 'read') {
        try {
          demoStore.markNotificationRead(n.id);
        } catch {
          // ignore
        }
      }
    }
    bump();
  }

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!selectedChannel) return;
    setError('');
    try {
      demoStore.sendChatMessage(selectedChannel.id, body);
      setBody('');
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    }
  }

  function onCreateChannel(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const channel = demoStore.createChatChannel({
        name: newChannelName,
        description: newChannelDesc,
      });
      setNewChannelName('');
      setNewChannelDesc('');
      openChannel(channel.id);
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  function onAddMember(e: FormEvent) {
    e.preventDefault();
    if (!selectedChannel || !addPersonId) return;
    try {
      demoStore.addChatMember(selectedChannel.id, addPersonId);
      setAddPersonId('');
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  }

  const accountPeople = state.people.filter((p) => p.hasUserAccount);
  const memberIds = new Set(members.map((m) => m.membership.personId));
  const candidates = accountPeople.filter((p) => !memberIds.has(p.id));

  return (
    <div className="chat-dock-root">
      <button
        type="button"
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <span aria-hidden="true">×</span>
        ) : (
          <>
            <span className="chat-fab-label">Chat</span>
            {unreadChat > 0 ? <span className="nav-count">{unreadChat}</span> : null}
          </>
        )}
      </button>

      {open ? (
        <section className="chat-popup" role="dialog" aria-label="Chat">
          <header className="chat-popup-header">
            {view === 'thread' || view === 'members' ? (
              <button type="button" className="chat-icon-btn" onClick={() => setView('list')} aria-label="Back">
                ←
              </button>
            ) : (
              <span className="chat-icon-spacer" />
            )}
            <div className="chat-popup-title">
              {view === 'list' || view === 'create'
                ? 'Messages'
                : selectedChannel?.name ?? 'Chat'}
              <div className="muted chat-popup-sub">
                {view === 'list'
                  ? 'Membership ≠ team role'
                  : selectedChannel?.channelType ?? ''}
              </div>
            </div>
            <div className="row" style={{ gap: '0.35rem' }}>
              {view === 'thread' && selectedChannel ? (
                <button
                  type="button"
                  className="chat-icon-btn"
                  onClick={() => setView('members')}
                  aria-label="Members"
                  title="Members"
                >
                  ···
                </button>
              ) : null}
              <button type="button" className="chat-icon-btn" onClick={closeChat} aria-label="Minimize">
                –
              </button>
            </div>
          </header>

          {error ? <p className="error chat-popup-error">{error}</p> : null}

          {view === 'list' ? (
            <div className="chat-popup-body">
              <div className="chat-channel-list">
                {myChannels.length === 0 ? (
                  <p className="muted" style={{ padding: '1rem' }}>No channels yet</p>
                ) : null}
                {myChannels.map((channel) => {
                  const last = [...state.chatMessages]
                    .filter((m) => m.channelId === channel.id && m.messageStatus !== 'deleted')
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      className="chat-channel-row"
                      onClick={() => openChannel(channel.id)}
                    >
                      <div className="chat-avatar">{channel.name.slice(0, 1)}</div>
                      <div className="chat-channel-meta">
                        <strong>{channel.name}</strong>
                        <span className="muted">
                          {last ? last.body.slice(0, 48) : 'No messages yet'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {canCreate ? (
                <button type="button" className="chat-compose-new" onClick={() => setView('create')}>
                  + New channel
                </button>
              ) : null}
            </div>
          ) : null}

          {view === 'create' ? (
            <form className="chat-popup-body chat-form" onSubmit={onCreateChannel}>
              <label>
                Channel name
                <input required value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
              </label>
              <label>
                Description
                <textarea value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} />
              </label>
              <div className="row">
                <button type="submit">Create</button>
                <button type="button" className="secondary" onClick={() => setView('list')}>Back</button>
              </div>
            </form>
          ) : null}

          {view === 'members' && selectedChannel ? (
            <div className="chat-popup-body">
              <p className="muted" style={{ padding: '0.5rem 0.85rem 0' }}>
                Chat-only roster — does not grant team permissions.
              </p>
              <ul className="chat-member-list">
                {members.map(({ membership, person }) => (
                  <li key={membership.id}>
                    <span>
                      {person ? `${person.firstName} ${person.lastName}` : membership.personId}
                      <span className="badge">{membership.membershipRole}</span>
                    </span>
                    {canManageMembers && membership.personId !== me?.id ? (
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => {
                          demoStore.removeChatMember(selectedChannel.id, membership.personId);
                          bump();
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {canManageMembers ? (
                <form className="chat-form" onSubmit={onAddMember} style={{ padding: '0.75rem' }}>
                  <label>
                    Add member
                    <select value={addPersonId} onChange={(e) => setAddPersonId(e.target.value)}>
                      <option value="">Select…</option>
                      {candidates.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={!addPersonId}>Add</button>
                </form>
              ) : null}
            </div>
          ) : null}

          {view === 'thread' && selectedChannel ? (
            <>
              <div className="chat-popup-thread">
                {messages.length === 0 ? <p className="muted">Say hello to the team</p> : null}
                {messages.map((msg) => {
                  const mine = msg.senderPersonId === me?.id;
                  const sender = state.people.find((p) => p.id === msg.senderPersonId);
                  return (
                    <div key={msg.id} className={`chat-msg ${mine ? 'mine' : 'theirs'}`}>
                      {!mine ? (
                        <div className="chat-msg-name">
                          {sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown'}
                        </div>
                      ) : null}
                      <div className="chat-msg-bubble">{msg.body}</div>
                      <div className="chat-msg-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>
              <form className="chat-popup-composer" onSubmit={onSend}>
                <input
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type a message…"
                  autoComplete="off"
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
