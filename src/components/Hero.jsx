function waLink(number) {
  const clean = (number || "").replace(/\D/g, "");
  return `https://wa.me/237${clean}`;
}

function telLink(number) {
  return `tel:+237${(number || "").replace(/\D/g, "")}`;
}

function accentName(fullName) {
  const words = (fullName || "NAKO NAKO PRIVA RUISSEL").split(" ");
  if (words.length < 2) return <>{fullName}</>;
  const first = words.slice(0, -2).join(" ");
  const last = words.slice(-2).join(" ");
  return (
    <>
      {first} <span className="accent">{last}</span>
    </>
  );
}

export default function Hero({ profile }) {
  if (!profile) {
    return (
      <section className="hero">
        <div>
          <span className="hero-eyebrow mono">Portfolio</span>
          <h1>Chargement…</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero-left">
        {profile.hero_image_url && (
          <img className="hero-photo" src={profile.hero_image_url} alt="Photo de profil" />
        )}
        <div className="hero-text">
          <h1>{accentName(profile.full_name)}</h1>
          <p className="hero-role">{profile.tagline}</p>
          <p className="hero-bio">{profile.bio}</p>

          <div className="contact-row">
            {profile.email && (
              <a className="contact-btn primary" href={`mailto:${profile.email}`}>
                ✉ Envoyer un mail
              </a>
            )}
            {profile.whatsapp && (
              <a className="contact-btn ghost" target="_blank" rel="noopener noreferrer" href={waLink(profile.whatsapp)}>
                WhatsApp
              </a>
            )}
            {profile.phone1 && (
              <a className="contact-btn ghost" href={telLink(profile.phone1)}>
                {profile.phone1}
              </a>
            )}
            {profile.phone2 && (
              <a className="contact-btn ghost" href={telLink(profile.phone2)}>
                {profile.phone2}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="layer-stack">
        <div className="layer-card lc-1">
          <span className="tag mono">01</span>
          <span className="label">Design</span>
        </div>
        <div className="layer-card lc-2">
          <span className="tag mono">02</span>
          <span className="label">UI / UX</span>
        </div>
        <div className="layer-card lc-3">
          <span className="tag mono">03</span>
          <span className="label">Développement</span>
        </div>
        <div className="layer-card lc-4">
          <span className="tag mono">04</span>
          <span className="label">IA</span>
        </div>
      </div>
    </section>
  );
}
