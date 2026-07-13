import { useState, type FormEvent } from 'react';
import { submitPublicRegistration } from '../modules/follow-up/followUpService';

const DEFAULT_ORG = 'org_ieec_ya';

export function PublicRegistrationPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await submitPublicRegistration({
        organizationId: DEFAULT_ORG,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        prayerRequest: prayerRequest.trim() || undefined,
        preferredContactMethod: phone ? 'phone' : email ? 'email' : undefined,
        consentToContact: consent,
      });
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setPrayerRequest('');
      setConsent(false);
      setMessage('Registration submitted. A Follow-Up leader will be notified after processing.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <header className="page-header">
        <p className="brand hero-brand">IEEC YA Connect</p>
        <h1>Newcomer registration</h1>
        <p className="lede">No account required. Fields can later be driven by the Dynamic Form engine.</p>
      </header>

      <form className="panel stack" onSubmit={onSubmit}>
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Prayer request
          <textarea value={prayerRequest} onChange={(e) => setPrayerRequest(e.target.value)} rows={3} />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          I consent to be contacted by IEEC YA Follow-Up.
        </label>
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit registration'}
        </button>
        {message && <p className="muted">{message}</p>}
      </form>
    </div>
  );
}
