import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import ProjectsGrid from "../components/ProjectsGrid.jsx";
import Footer from "../components/Footer.jsx";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

export default function Portfolio() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function load() {
      const { data: profileData } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      setProfile(profileData);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (projectsError) {
        setError("Impossible de charger les projets. Vérifie ta configuration Supabase.");
        return;
      }
      setProjects(projectsData || []);
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
      <Header activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <main className="wrap">
        <Hero profile={profile} />
        {error ? (
          <div className="empty-state">{error}</div>
        ) : (
          <ProjectsGrid projects={projects} activeCategory={activeCategory} />
        )}
      </main>
      <Footer />
    </>
  );
}
