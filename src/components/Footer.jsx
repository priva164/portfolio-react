import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="wrap">
      <span>© {new Date().getFullYear()} Nako Priva Ruissel — Tous droits réservés</span>
      <Link to="/admin">Espace admin</Link>
    </footer>
  );
}
