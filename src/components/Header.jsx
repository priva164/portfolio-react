const CATS_FR = [
  { key: "all",    label: "Tout" },
  { key: "design", label: "Design Graphique" },
  { key: "uiux",   label: "UI/UX Design" },
  { key: "dev",    label: "Développement" },
  { key: "video",  label: "Vidéo & Montage" },
  { key: "ia",     label: "IA & Automatisation" },
];

const CATS_EN = [
  { key: "all",    label: "All" },
  { key: "design", label: "Graphic Design" },
  { key: "uiux",   label: "UI/UX Design" },
  { key: "dev",    label: "Development" },
  { key: "video",  label: "Video & Editing" },
  { key: "ia",     label: "AI & Automation" },
];

export default function Header({ activeCategory, onSelectCategory, lang, onToggleLang, darkMode, onToggleDark }) {
  const CATS = lang === "en" ? CATS_EN : CATS_FR;

  return (
    <header>
      <div className="wrap nav-inner">
        <div className="logo">
          NAKO <span className="dot">·</span> PRIVA
        </div>
        <nav className="nav-cats">
          {CATS.map((c) => (
            <button
              key={c.key}
              className={`cat-pill${activeCategory === c.key ? " active" : ""}`}
              onClick={() => onSelectCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>
        <div className="nav-controls">
          <button className="ctrl-btn" onClick={onToggleLang} title="Switch language">
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <button className="ctrl-btn" onClick={onToggleDark} title="Toggle theme">
            {darkMode ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
