import { FormEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { demoStore } from '../lib/demoStore';
import { useSession } from '../lib/session';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read photo'));
    };
    reader.onerror = () => reject(new Error('Could not read photo'));
    reader.readAsDataURL(file);
  });
}

export function AccountPage() {
  const { person, refresh } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState('call');
  const [preferredTime, setPreferredTime] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null | undefined>(undefined);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (!person) return;
    setFirstName(person.firstName);
    setLastName(person.lastName);
    setPhone(person.phone.display);
    setContactMethod(person.contactPreference.method);
    setPreferredTime(person.contactPreference.preferredTime ?? '');
    setPhotoPreview(person.photoUrl ?? null);
    setPendingPhoto(undefined);
    setClearPhoto(false);
  }, [person]);

  if (!person) return <Navigate to="/login" replace />;

  const displayPhoto = clearPhoto ? null : pendingPhoto !== undefined ? pendingPhoto : photoPreview;
  const fullName = `${firstName || person.firstName} ${lastName || person.lastName}`.trim();

  async function onPhotoSelected(file: File | null) {
    setError('');
    setSaved('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be 2 MB or smaller.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingPhoto(dataUrl);
      setClearPhoto(false);
      setPhotoPreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load photo');
    }
  }

  function onRemovePhoto() {
    setClearPhoto(true);
    setPendingPhoto(null);
    setPhotoPreview(null);
    setError('');
    setSaved('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    try {
      demoStore.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        contactMethod,
        preferredTime: preferredTime.trim() || null,
        clearPhoto: clearPhoto || undefined,
        photoUrl: !clearPhoto && pendingPhoto !== undefined ? pendingPhoto : undefined,
      });
      setPendingPhoto(undefined);
      setClearPhoto(false);
      refresh();
      setSaved('Account updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save account');
    }
  }

  return (
    <div className="grid">
      <section className="hero">
        <h1>My account</h1>
        <p className="muted">Update your profile details and photo.</p>
      </section>

      <form className="panel account-panel grid" onSubmit={onSubmit}>
        <div className="account-photo-block">
          <Avatar name={fullName} photoUrl={displayPhoto} size="lg" />
          <div className="account-photo-actions">
            <strong>Profile photo</strong>
            <p className="muted">JPG, PNG, or WebP · max 2 MB. Stored locally in demo mode.</p>
            <div className="row">
              <button type="button" onClick={() => fileRef.current?.click()}>
                {displayPhoto ? 'Change photo' : 'Add photo'}
              </button>
              {displayPhoto ? (
                <button type="button" className="secondary" onClick={onRemovePhoto}>
                  Remove
                </button>
              ) : null}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => void onPhotoSelected(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="grid two">
          <label>
            First name <span className="error">*</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label>
            Last name <span className="error">*</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
        </div>

        <label>
          Email
          <input value={person.email.address} disabled readOnly />
        </label>

        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <div className="grid two">
          <label>
            Preferred contact
            <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)}>
              <option value="call">Call</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
            </select>
          </label>
          <label>
            Preferred time
            <input
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              placeholder="e.g. Weekday evenings"
            />
          </label>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {saved ? <p className="success">{saved}</p> : null}

        <div className="row">
          <button type="submit">Save changes</button>
        </div>
      </form>
    </div>
  );
}
