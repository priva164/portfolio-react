import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import ProjectsGrid from "../components/ProjectsGrid.jsx";
import Footer from "../components/Footer.jsx";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

export default function Portfolio() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLang] = useState("fr");
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState(null);

  // Apply dark/light mode to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function load() {
      const { data: profileData } = await supabase
        .from("profile").select("*").limit(1).maybeSingle();
      setProfile(profileData);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (projectsError) {
        setError(
          lang === "en"
            ? "Unable to load projects. Check your Supabase configuration."
            : "Impossible de charger les projets. Vérifie ta configuration Supabase."
        );
        return;
      }
      setProjects(projectsData || []);

      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      setVideos(videosData || []);
    }

    load();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="config-warning wrap">
        Configuration Supabase manquante. Copie <code>.env.example</code> en <code>.env</code>{" "}
        et remplis tes clés Supabase (voir le README).
      </div>
    );
  }

  return (
    <>
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
      <main className="wrap">
        <Hero profile={profile} lang={lang} />
        {error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <ProjectsGrid
            projects={projects}
            videos={videos}
            activeCategory={activeCategory}
            lang={lang}
          />
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
