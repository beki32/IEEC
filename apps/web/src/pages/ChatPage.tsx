import { Permissions } from '@ieec/shared';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

export function ChatPage() {
  const { has, person: me, refresh } = useSession();
  const [tick, setTick] = useState(0);
  const canCreate = has(Permissions.chatCreate);
  const canManageMembers = has(Permissions.chatManageMembers);

  const state = demoStore.getState();
  const myChannels = useMemo(() => {
    void tick;
    return demoStore.listMyChatChannels();
  }, [tick]);

  const [selectedChannelId, setSelectedChannelId] = useState(myChannels[0]?.id ?? '');
  const selectedChannel =
    myChannels.find((c) => c.id === selectedChannelId) ??
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

  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [addPersonId, setAddPersonId] = useState('');

  function bump(msg?: string) {
    refresh();
    setTick((t) => t + 1);
    if (msg) setMessage(msg);
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
      setShowCreate(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setSelectedChannelId(channel.id);
      bump('Channel created — you were added as moderator');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  function onAddMember(e: FormEvent) {
    e.preventDefault();
    if (!selectedChannel || !addPersonId) return;
    setError('');
    try {
      demoStore.addChatMember(selectedChannel.id, addPersonId);
      setShowAddMember(false);
      setAddPersonId('');
      bump('Member added (chat only — no team permissions granted)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  }

  function removeMember(personId: string, name: string) {
    if (!selectedChannel) return;
    if (!window.confirm(`Remove ${name} from this channel? Team membership is unchanged.`)) return;
    try {
      demoStore.removeChatMember(selectedChannel.id, personId);
      bump('Member removed from channel only');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    }
  }

  function deleteMessage(messageId: string) {
    try {
      demoStore.softDeleteChatMessage(messageId);
      bump();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const accountPeople = state.people.filter((p) => p.hasUserAccount);
  const memberIds = new Set(members.map((m) => m.membership.personId));
  const candidates = accountPeople.filter((p) => !memberIds.has(p.id));

  return (
    <div className="grid">
      <section className="hero">
        <p className="badge">ADR-004</p>
        <h1>Chat</h1>
        <p className="muted">
          Chat membership ≠ team membership. Being in a channel does not grant Follow-Up queue, bio, or report access.
        </p>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <div className="row">
        {canCreate ? (
          <button type="button" onClick={() => { setShowCreate(true); setError(''); }}>
            Create channel
          </button>
        ) : null}
        <Link className="btn secondary" to="/app">Dashboard</Link>
      </div>

      <div className="grid two">
        <div className="panel">
          <h2>My channels</h2>
          <p className="muted">{myChannels.length} channel(s) you belong to</p>
          {myChannels.length === 0 ? (
            <p className="muted">You are not in any channels yet.</p>
          ) : (
            <ul className="list">
              {myChannels.map((channel) => (
                <li key={channel.id}>
                  <button
                    type="button"
                    className={selectedChannel?.id === channel.id ? 'linkish active' : 'linkish'}
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      setError('');
                      setMessage('');
                    }}
                  >
                    <strong>{channel.name}</strong>
                    <div className="muted">{channel.channelType}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h2>Members {selectedChannel ? `· ${selectedChannel.name}` : ''}</h2>
          {!selectedChannel ? <p className="muted">Select a channel</p> : null}
          {members.map(({ membership, person }) => (
            <div key={membership.id} className="row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                {person ? `${person.firstName} ${person.lastName}` : membership.personId}
                <span className="badge" style={{ marginLeft: '0.5rem' }}>{membership.membershipRole}</span>
              </div>
              {canManageMembers && membership.personId !== me?.id ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    removeMember(
                      membership.personId,
                      person ? `${person.firstName} ${person.lastName}` : membership.personId,
                    )
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {canManageMembers && selectedChannel ? (
            <button type="button" className="secondary" onClick={() => setShowAddMember(true)}>
              Add member
            </button>
          ) : null}
        </div>
      </div>

      {selectedChannel ? (
        <div className="panel grid">
          <h2>{selectedChannel.name}</h2>
          {selectedChannel.description ? <p className="muted">{selectedChannel.description}</p> : null}
          <div className="chat-thread">
            {messages.length === 0 ? <p className="muted">No messages yet</p> : null}
            {messages.map((msg) => {
              const sender = state.people.find((p) => p.id === msg.senderPersonId);
              const canDelete =
                msg.senderPersonId === me?.id || canManageMembers;
              return (
                <div key={msg.id} className="chat-bubble">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong>{sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown'}</strong>
                    <span className="muted">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{msg.body}</p>
                  {canDelete ? (
                    <button type="button" className="linkish" onClick={() => deleteMessage(msg.id)}>
                      Soft-delete
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          <form className="row" onSubmit={onSend}>
            <input
              required
              style={{ flex: 1 }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a coordination message…"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : null}

      {showCreate ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowCreate(false)}>
          <form className="modal-panel grid" onClick={(e) => e.stopPropagation()} onSubmit={onCreateChannel}>
            <h2>Create channel</h2>
            <p className="muted">Teams may have multiple channels. Creating one does not change team roster.</p>
            <label>
              Name
              <input required value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
            </label>
            <label>
              Description
              <textarea value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <div className="row">
              <button type="submit">Create</button>
              <button type="button" className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      {showAddMember && selectedChannel ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowAddMember(false)}>
          <form className="modal-panel grid" onClick={(e) => e.stopPropagation()} onSubmit={onAddMember}>
            <h2>Add channel member</h2>
            <p className="muted">Does not grant Follow-Up module permissions.</p>
            <label>
              Person with account
              <select required value={addPersonId} onChange={(e) => setAddPersonId(e.target.value)}>
                <option value="">Select…</option>
                {candidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · {p.email.address}
                  </option>
                ))}
              </select>
            </label>
            {candidates.length === 0 ? <p className="muted">Everyone with an account is already a member.</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <div className="row">
              <button type="submit" disabled={!addPersonId}>Add</button>
              <button type="button" className="secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
