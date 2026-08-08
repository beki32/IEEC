import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { demoStore } from '../lib/demoStore';
import { isDemoMode } from '../lib/firebase';
import { submitPublicRegistration } from '../lib/publicIntake';
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
  const [dragOver, setDragOver] = useState(false);

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

    // Duplicate email check against local/demo store only (public Firebase clients cannot read people).
    if (!emailErr && isDemoMode() && demoStore.isEmailRegistered(form.email)) {
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

  async function onSubmitRegistration(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!validateDetails()) {
      setStep('details');
      return;
    }
    setBusy(true);
    try {
      if (!isDemoMode()) {
        const result = await submitPublicRegistration({
          ...form,
          photoUrl,
        });
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
      } else {
        const result = demoStore.registerNewcomer({
          ...form,
          photoUrl,
        });
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
      }
      navigate('/?registered=1', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  const fullName = `${form.firstName || 'New'} ${form.lastName || 'friend'}`.trim();
  const stepIndex = step === 'details' ? 1 : 2;

  return (
    <div className="register-shell">
      <aside
        className="register-aside"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(8,32,24,0.78), rgba(10,61,46,0.88)), url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <Link to="/" className="register-aside-brand">
          IEEC YA
        </Link>
        <div className="register-aside-copy">
          <p className="register-aside-kicker">Newcomer registration</p>
          <h1>You are welcome here.</h1>
          <p>
            Share a few details and we&apos;ll connect you with a Follow-Up minister who will walk with you.
          </p>
        </div>
        <p className="register-aside-foot">International Evangelical Ethiopian Church · Young Adults</p>
      </aside>

      <div className="register-content">
        <header className="register-content-top">
          <Link to="/" className="register-back">
            ← Home
          </Link>
          <Link to="/login" className="register-staff">
            Staff sign in
          </Link>
        </header>

        <main className="register-main">
          <div className="register-progress" aria-label={`Step ${stepIndex} of 2`}>
            <div className={`register-progress-step ${stepIndex >= 1 ? 'active' : ''} ${stepIndex > 1 ? 'done' : ''}`}>
              <span>1</span>
              Details
            </div>
            <div className="register-progress-line" aria-hidden="true" />
            <div className={`register-progress-step ${stepIndex >= 2 ? 'active' : ''}`}>
              <span>2</span>
              Photo
            </div>
          </div>

          {step === 'details' ? (
            <form className="register-form" onSubmit={onContinue} noValidate>
              <div className="register-form-head">
                <h2>Your details</h2>
                <p>Required fields help us welcome you well.</p>
              </div>

              <div className="register-fields">
                <label className={errors.firstName ? 'has-error' : ''}>
                  <span className="register-label">First name</span>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    autoComplete="given-name"
                    placeholder="First name"
                  />
                  {errors.firstName ? <span className="field-error">{errors.firstName}</span> : null}
                </label>
                <label className={errors.lastName ? 'has-error' : ''}>
                  <span className="register-label">Last name</span>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    autoComplete="family-name"
                    placeholder="Last name"
                  />
                  {errors.lastName ? <span className="field-error">{errors.lastName}</span> : null}
                </label>
                <label className={`register-span-2 ${errors.email ? 'has-error' : ''}`}>
                  <span className="register-label">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  {errors.email ? <span className="field-error">{errors.email}</span> : null}
                </label>
                <label className={`register-span-2 ${errors.phone ? 'has-error' : ''}`}>
                  <span className="register-label">Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(202) 555-0100"
                  />
                  {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
                </label>

                <fieldset className={`register-choice ${errors.sex ? 'has-error' : ''}`}>
                  <legend className="register-label">Sex</legend>
                  <div className="register-choice-row" role="radiogroup" aria-label="Sex">
                    {[
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                      { value: 'unspecified', label: 'Prefer not to say' },
                    ].map((opt) => (
                      <label key={opt.value} className={`register-chip ${form.sex === opt.value ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="sex"
                          value={opt.value}
                          checked={form.sex === opt.value}
                          onChange={() => setForm({ ...form, sex: opt.value })}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {errors.sex ? <span className="field-error">{errors.sex}</span> : null}
                </fieldset>

                <fieldset className={`register-choice ${errors.contactMethod ? 'has-error' : ''}`}>
                  <legend className="register-label">Preferred contact</legend>
                  <div className="register-choice-row" role="radiogroup" aria-label="Preferred contact">
                    {[
                      { value: 'text', label: 'Text' },
                      { value: 'call', label: 'Call' },
                      { value: 'email', label: 'Email' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`register-chip ${form.contactMethod === opt.value ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="contactMethod"
                          value={opt.value}
                          checked={form.contactMethod === opt.value}
                          onChange={() => setForm({ ...form, contactMethod: opt.value })}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {errors.contactMethod ? (
                    <span className="field-error">{errors.contactMethod}</span>
                  ) : null}
                </fieldset>
              </div>

              {formError ? <p className="register-alert">{formError}</p> : null}

              <div className="register-actions">
                <button type="submit" className="register-submit">
                  Continue to photo
                </button>
                <p className="register-note">Next step is optional — you can skip the photo.</p>
              </div>
            </form>
          ) : (
            <form className="register-form" onSubmit={onSubmitRegistration}>
              <div className="register-form-head">
                <h2>Add a photo <span className="register-optional-tag">optional</span></h2>
                <p>Helps your Follow-Up minister recognize you when you meet.</p>
              </div>

              <div
                className={`register-photo-drop ${dragOver ? 'drag' : ''} ${photoUrl ? 'has-photo' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void onPhotoSelected(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <Avatar name={fullName} photoUrl={photoUrl} size="lg" />
                <div className="register-photo-copy">
                  <strong>{photoUrl ? 'Looking good' : 'Drop a photo here'}</strong>
                  <p>JPG, PNG, or WebP · max 2 MB</p>
                  <div className="register-photo-btns">
                    <button type="button" className="register-submit" onClick={() => fileRef.current?.click()}>
                      {photoUrl ? 'Change photo' : 'Choose photo'}
                    </button>
                    {photoUrl ? (
                      <button
                        type="button"
                        className="register-secondary"
                        onClick={() => {
                          setPhotoUrl(null);
                          if (fileRef.current) fileRef.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => void onPhotoSelected(e.target.files?.[0] ?? null)}
                />
              </div>

              {formError ? <p className="register-alert">{formError}</p> : null}

              <div className="register-actions rowish">
                <button type="submit" className="register-submit" disabled={busy}>
                  {busy ? 'Submitting…' : photoUrl ? 'Finish registration' : 'Skip photo & finish'}
                </button>
                <button type="button" className="register-secondary" onClick={() => setStep('details')}>
                  Back to details
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
