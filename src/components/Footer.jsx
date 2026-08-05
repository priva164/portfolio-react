import { Link } from "react-router-dom";

export default function Footer({ lang }) {
  return (
    <footer className="wrap">
      <span>
        © {new Date().getFullYear()} Nako Priva Ruissel —{" "}
        {lang === "en" ? "All rights reserved" : "Tous droits réservés"}
      </span>
      <Link to="/admin">{lang === "en" ? "Admin space" : "Espace admin"}</Link>
    </footer>
  );
}
