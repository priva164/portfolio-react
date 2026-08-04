const CATS = [
  { key: "all", label: "Tout" },
  { key: "design", label: "Design Graphique" },
  { key: "uiux", label: "UI/UX Design" },
  { key: "dev", label: "Développement" },
  { key: "ia", label: "IA & Automatisation" },
];

export default function Header({ activeCategory, onSelectCategory }) {
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
      </div>
    </header>
  );
}
