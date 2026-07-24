import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { demoStore } from '../lib/demoStore';
import {
  getDemoInstagramFeed,
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
} from '../lib/instagram';
import {
  CHURCH_ABOUT,
  validateOptionalEmail,
  validatePrayerRequest,
  validateRequiredName,
  youtubeEmbedUrl,
} from '../lib/publicContent';

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDay(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatMonth(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`landing-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function LandingPage() {
  const [params, setParams] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [tick, setTick] = useState(0);
  const registered = params.get('registered') === '1';

  useEffect(() => {
    demoStore.ensureLatestSeed();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  void tick;
  const announcements = demoStore.listAnnouncements();
  const events = demoStore.listUpcomingPublicEvents(5);
  const sermons = demoStore.listSermons();
  const featured = sermons[0] ?? null;
  const moreSermons = sermons.slice(1);
  const igPosts = useMemo(() => getDemoInstagramFeed(), []);

  const [prayerName, setPrayerName] = useState('');
  const [prayerEmail, setPrayerEmail] = useState('');
  const [prayerBody, setPrayerBody] = useState('');
  const [prayerPrivate, setPrayerPrivate] = useState(true);
  const [prayerErrors, setPrayerErrors] = useState<Record<string, string>>({});
  const [prayerOk, setPrayerOk] = useState('');

  function dismissRegistered() {
    params.delete('registered');
    setParams(params, { replace: true });
  }

  function onPrayerSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const nameErr = validateRequiredName(prayerName, 'Name');
    const emailErr = validateOptionalEmail(prayerEmail);
    const reqErr = validatePrayerRequest(prayerBody);
    if (nameErr) next.name = nameErr;
    if (emailErr) next.email = emailErr;
    if (reqErr) next.request = reqErr;
    setPrayerErrors(next);
    setPrayerOk('');
    if (Object.keys(next).length) return;

    demoStore.submitPrayerRequest({
      name: prayerName,
      email: prayerEmail || null,
      request: prayerBody,
      isPrivate: prayerPrivate,
    });
    setPrayerName('');
    setPrayerEmail('');
    setPrayerBody('');
    setPrayerPrivate(true);
    setPrayerOk('Received. Our prayer team will hold this with care.');
    setTick((t) => t + 1);
  }

  return (
    <div className={`landing ${navOpen ? 'nav-open' : ''} ${navSolid ? 'nav-solid' : ''}`}>
      <header className="landing-nav">
        <a className="landing-brand" href="#top">
          IEEC YA
        </a>
        <button
          type="button"
          className="landing-menu-btn"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className={`cms-menu-icon ${navOpen ? 'open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <nav className="landing-nav-links" aria-label="Landing">
          <a href="#events" onClick={() => setNavOpen(false)}>Events</a>
          <a href="#watch" onClick={() => setNavOpen(false)}>Watch</a>
          <a href="#prayer" onClick={() => setNavOpen(false)}>Prayer</a>
          <a href="#about" onClick={() => setNavOpen(false)}>About</a>
          <a href="#instagram" onClick={() => setNavOpen(false)}>Instagram</a>
          <Link to="/register" className="landing-nav-cta" onClick={() => setNavOpen(false)}>
            I&apos;m new
          </Link>
          <Link to="/login" className="landing-nav-quiet" onClick={() => setNavOpen(false)}>
            Staff
          </Link>
        </nav>
      </header>

      {registered ? (
        <div className="landing-banner" role="status">
          <p>
            <strong>You&apos;re registered.</strong> A Follow-Up minister will reach out soon.
          </p>
          <button type="button" className="secondary" onClick={dismissRegistered}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="landing-hero" id="top">
        <div
          className="landing-hero-media"
          role="img"
          aria-label="Young adults gathered in warm evening light"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="landing-hero-veil" />
        <div className="landing-hero-copy">
          <p className="landing-brand-mark">IEEC YA</p>
          <h1>A place to belong and grow in Christ.</h1>
          <p className="landing-hero-support">
            Young adults of International Evangelical Ethiopian Church — worship, friendship, and Follow-Up care.
          </p>
          <div className="landing-hero-actions">
            <Link className="btn landing-btn-primary" to="/register">
              Join as a newcomer
            </Link>
            <a className="btn landing-btn-ghost" href="#events">
              See upcoming events
            </a>
          </div>
        </div>
      </section>

      <section className="landing-section" id="announcements">
        <Reveal className="landing-section-inner">
          <p className="landing-kicker">Community</p>
          <h2>Announcements</h2>
          <p className="landing-lead">What the community needs to know right now.</p>
          <ul className="landing-announce-list">
            {announcements.map((a) => (
              <li key={a.id}>
                <time dateTime={a.publishedAt}>{formatWhen(a.publishedAt)}</time>
                <div>
                  <h3>
                    {a.pinned ? <span className="landing-pin" aria-label="Pinned">●</span> : null}
                    {a.title}
                  </h3>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="landing-section tone-mist" id="events">
        <Reveal className="landing-section-inner">
          <p className="landing-kicker">Gather</p>
          <h2>Upcoming events</h2>
          <p className="landing-lead">Come as you are — there is a seat for you.</p>
          {events.length === 0 ? (
            <p className="muted">No upcoming events listed yet. Check back soon.</p>
          ) : (
            <ul className="landing-event-list">
              {events.map((ev) => (
                <li key={ev.id}>
                  <div className="landing-event-date" aria-hidden="true">
                    <span className="landing-event-month">{formatMonth(ev.startAt)}</span>
                    <span className="landing-event-day">{formatDay(ev.startAt)}</span>
                  </div>
                  <div>
                    <time dateTime={ev.startAt}>{formatWhen(ev.startAt)}</time>
                    <strong>{ev.title}</strong>
                    {ev.description ? <p>{ev.description}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>

      <section className="landing-section" id="watch">
        <Reveal className="landing-section-inner">
          <p className="landing-kicker">Listen</p>
          <h2>Sermons & devotionals</h2>
          <p className="landing-lead">A recent word, and a short devotion for the week.</p>

          {featured ? (
            <article className="landing-watch-feature">
              <div className="landing-watch-copy">
                <p className="landing-kind">{featured.kind} · {featured.speaker}</p>
                <h3>{featured.title}</h3>
                <p>{featured.summary}</p>
              </div>
              {youtubeEmbedUrl(featured.mediaUrl) ? (
                <div className="landing-video">
                  <iframe
                    src={youtubeEmbedUrl(featured.mediaUrl)!}
                    title={featured.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </article>
          ) : null}

          {moreSermons.length ? (
            <ul className="landing-watch-more">
              {moreSermons.map((item) => {
                const embed = youtubeEmbedUrl(item.mediaUrl);
                return (
                  <li key={item.id}>
                    <p className="landing-kind">{item.kind} · {item.speaker}</p>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    {embed ? (
                      <div className="landing-video compact">
                        <iframe
                          src={embed}
                          title={item.title}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a href={item.mediaUrl} target="_blank" rel="noreferrer">
                        Open media
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Reveal>
      </section>

      <section className="landing-section landing-prayer-section" id="prayer">
        <div
          className="landing-prayer-photo"
          role="img"
          aria-label="Quiet hands in prayer"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507692049790-de15454be3ee?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        <Reveal className="landing-prayer-panel">
          <p className="landing-kicker light">Pray</p>
          <h2>Share a prayer request</h2>
          <p className="landing-lead light">
            Tell us what is on your heart. Private requests stay with the prayer team.
          </p>
          <form className="landing-prayer-form" onSubmit={onPrayerSubmit} noValidate>
            <label>
              Your name <span className="error">*</span>
              <input
                value={prayerName}
                onChange={(e) => setPrayerName(e.target.value)}
                autoComplete="name"
              />
              {prayerErrors.name ? <span className="field-error">{prayerErrors.name}</span> : null}
            </label>
            <label>
              Email <span className="landing-optional">(optional)</span>
              <input
                type="email"
                value={prayerEmail}
                onChange={(e) => setPrayerEmail(e.target.value)}
                autoComplete="email"
              />
              {prayerErrors.email ? <span className="field-error">{prayerErrors.email}</span> : null}
            </label>
            <label>
              Request <span className="error">*</span>
              <textarea
                rows={4}
                value={prayerBody}
                onChange={(e) => setPrayerBody(e.target.value)}
                placeholder="How can we pray with you?"
              />
              {prayerErrors.request ? (
                <span className="field-error">{prayerErrors.request}</span>
              ) : null}
            </label>
            <label className="landing-check">
              <input
                type="checkbox"
                checked={prayerPrivate}
                onChange={(e) => setPrayerPrivate(e.target.checked)}
              />
              Keep this request private to the prayer team
            </label>
            {prayerOk ? <p className="success">{prayerOk}</p> : null}
            <button type="submit" className="landing-btn-primary">Submit request</button>
          </form>
        </Reveal>
      </section>

      <section className="landing-section" id="about">
        <Reveal className="landing-section-inner landing-about">
          <div>
            <p className="landing-kicker">Our story</p>
            <h2>{CHURCH_ABOUT.name}</h2>
            <p className="landing-about-story">{CHURCH_ABOUT.story}</p>
          </div>
          <div
            className="landing-about-media"
            role="img"
            aria-label="Community worship gathering"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
        </Reveal>
      </section>

      <section className="landing-section tone-forest" id="beliefs">
        <Reveal className="landing-section-inner">
          <p className="landing-kicker light">Believe</p>
          <h2>What we hold</h2>
          <p className="landing-lead light">Simple convictions that shape how we live together.</p>
          <ul className="landing-belief-list">
            {CHURCH_ABOUT.beliefs.map((b) => (
              <li key={b.title}>
                <strong>{b.title}</strong>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="landing-section" id="ministries">
        <Reveal className="landing-section-inner">
          <p className="landing-kicker">Serve</p>
          <h2>Ministries</h2>
          <p className="landing-lead">Ways people find belonging and purpose at IEEC YA.</p>
          <ul className="landing-ministry-list">
            {CHURCH_ABOUT.ministries.map((m) => (
              <li key={m.name}>
                <strong>{m.name}</strong>
                <p>{m.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="landing-section tone-mist" id="instagram">
        <Reveal className="landing-section-inner">
          <div className="landing-ig-head">
            <div>
              <p className="landing-kicker">Connect</p>
              <h2>@{INSTAGRAM_HANDLE}</h2>
              <p className="landing-lead">
                Gatherings, devotionals, and everyday community life on Instagram.
              </p>
            </div>
            <a
              className="btn landing-btn-primary"
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Follow on Instagram
            </a>
          </div>
          <ul className="landing-ig-grid">
            {igPosts.map((post) => (
              <li key={post.id}>
                <a href={post.permalink} target="_blank" rel="noreferrer">
                  <img src={post.imageUrl} alt="" loading="lazy" />
                  <span>{post.caption}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <footer className="landing-foot">
        <div className="landing-section-inner landing-foot-inner">
          <div>
            <p className="landing-foot-brand">IEEC YA</p>
            <p className="muted">Young Adult ministry · International Evangelical Ethiopian Church</p>
          </div>
          <div className="landing-foot-links">
            <Link to="/register">Newcomer registration</Link>
            <Link to="/login">Staff sign in</Link>
            <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
