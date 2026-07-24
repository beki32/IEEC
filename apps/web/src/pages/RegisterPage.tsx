import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { demoStore } from '../lib/demoStore';
import {
  validateEmail,
  validatePhone,
  validateRequiredName,
} from '../lib/publicContent';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

type Step = 'details' | 'photo';

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

export function RegisterPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sex: 'female',
    contactMethod: 'text',
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    demoStore.ensureLatestSeed();
  }, []);

  function validateDetails() {
    const next: Record<string, string> = {};
    const firstErr = validateRequiredName(form.firstName, 'First name');
    const lastErr = validateRequiredName(form.lastName, 'Last name');
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    if (firstErr) next.firstName = firstErr;
    if (lastErr) next.lastName = lastErr;
    if (emailErr) next.email = emailErr;
    if (phoneErr) next.phone = phoneErr;
    if (!form.sex) next.sex = 'Please choose an option.';
    if (!form.contactMethod) next.contactMethod = 'Please choose a contact preference.';

    if (!emailErr && demoStore.isEmailRegistered(form.email)) {
      next.email = 'Already registered. This email is already on file.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onContinue(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!validateDetails()) return;
    setStep('photo');
  }

  async function onPhotoSelected(file: File | null) {
    setFormError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Choose an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFormError('Photo must be 2 MB or smaller.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoUrl(dataUrl);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not load photo');
    }
  }

  function onSubmitRegistration(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!validateDetails()) {
      setStep('details');
      return;
    }
    setBusy(true);
    const result = demoStore.registerNewcomer({
      ...form,
      photoUrl,
    });
    setBusy(false);
    if (!result.ok) {
      if (result.error === 'already_registered') {
        setErrors((prev) => ({ ...prev, email: result.message }));
        setFormError(result.message);
        setStep('details');
        return;
      }
      setFormError(result.message);
      return;
    }
    navigate('/?registered=1', { replace: true });
  }

  const fullName = `${form.firstName || 'New'} ${form.lastName || 'friend'}`.trim();

  return (
    <div className="register-page">
      <header className="register-top">
        <Link to="/" className="landing-brand">
          IEEC YA
        </Link>
        <Link to="/login" className="muted">
          Staff sign in
        </Link>
      </header>

      <main className="register-main">
        <section className="register-intro">
          <p className="badge">Newcomer registration</p>
          <h1>Welcome — we&apos;re glad you&apos;re here</h1>
          <p className="muted">
            No account required. After you register, a Follow-Up minister will walk with you.
          </p>
          <ol className="register-steps" aria-label="Registration steps">
            <li className={step === 'details' ? 'active' : 'done'}>1. Your details</li>
            <li className={step === 'photo' ? 'active' : ''}>2. Photo (optional)</li>
          </ol>
        </section>

        {step === 'details' ? (
          <form className="panel register-form grid two" onSubmit={onContinue} noValidate>
            <label>
              First name <span className="error">*</span>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                autoComplete="given-name"
              />
              {errors.firstName ? <span className="field-error">{errors.firstName}</span> : null}
            </label>
            <label>
              Last name <span className="error">*</span>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                autoComplete="family-name"
              />
              {errors.lastName ? <span className="field-error">{errors.lastName}</span> : null}
            </label>
            <label>
              Email <span className="error">*</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                autoComplete="email"
              />
              {errors.email ? <span className="field-error">{errors.email}</span> : null}
            </label>
            <label>
              Phone <span className="error">*</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
                inputMode="tel"
              />
              {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
            </label>
            <label>
              Sex <span className="error">*</span>
              <select
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="unspecified">Prefer not to say</option>
              </select>
              {errors.sex ? <span className="field-error">{errors.sex}</span> : null}
            </label>
            <label>
              Preferred contact <span className="error">*</span>
              <select
                value={form.contactMethod}
                onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
              >
                <option value="text">Text</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
              </select>
              {errors.contactMethod ? (
                <span className="field-error">{errors.contactMethod}</span>
              ) : null}
            </label>

            {formError ? <p className="error register-form-error">{formError}</p> : null}

            <div className="row register-actions">
              <button type="submit">Continue</button>
              <Link to="/">Back to home</Link>
            </div>
          </form>
        ) : (
          <form className="panel register-form grid" onSubmit={onSubmitRegistration}>
            <div className="account-photo-block">
              <Avatar name={fullName} photoUrl={photoUrl} size="lg" />
              <div className="account-photo-actions">
                <strong>Profile photo (optional)</strong>
                <p className="muted">
                  Add a photo so your Follow-Up minister can recognize you. JPG, PNG, or WebP · max 2 MB.
                </p>
                <div className="row">
                  <button type="button" onClick={() => fileRef.current?.click()}>
                    {photoUrl ? 'Change photo' : 'Add photo'}
                  </button>
                  {photoUrl ? (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setPhotoUrl(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                    >
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

            {formError ? <p className="error">{formError}</p> : null}

            <div className="row register-actions">
              <button type="submit" disabled={busy}>
                {busy ? 'Submitting…' : photoUrl ? 'Finish registration' : 'Skip photo & finish'}
              </button>
              <button type="button" className="secondary" onClick={() => setStep('details')}>
                Back
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
