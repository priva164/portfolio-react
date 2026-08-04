import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured, CATEGORY_LABELS } from "../supabaseClient.js";

function useSession() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return session;
}

async function uploadImage(file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
  return data.publicUrl;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ text: "Connexion...", type: "" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg({ text: "Identifiants incorrects.", type: "err" });
      return;
    }
    setMsg(null);
  }

  return (
    <div className="login-screen admin-card">
      <h2>Connexion admin</h2>
      <form onSubmit={handleLogin}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn" type="submit">Se connecter</button>
        {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [heroFile, setHeroFile] = useState(null);

  useEffect(() => {
    supabase.from("profile").select("*").limit(1).maybeSingle().then(({ data }) => setProfile(data));
  }, []);

  if (!profile) return null;

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "Enregistrement...", type: "" });
    try {
      const payload = {
        full_name: profile.full_name,
        tagline: profile.tagline,
        bio: profile.bio,
        phone1: profile.phone1,
        phone2: profile.phone2,
        whatsapp: profile.whatsapp,
        email: profile.email,
        updated_at: new Date().toISOString(),
      };
      if (heroFile) payload.hero_image_url = await uploadImage(heroFile, "profile");

      const { error } = await supabase.from("profile").update(payload).eq("id", profile.id);
      if (error) throw error;
      setMsg({ text: "Profil enregistré ✓", type: "ok" });
    } catch (err) {
      setMsg({ text: "Erreur : " + err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card">
      <h2>Profil & page d'accueil</h2>
      <form onSubmit={handleSave}>
        <div className="field">
          <label>Nom complet</label>
          <input value={profile.full_name || ""} onChange={(e) => update("full_name", e.target.value)} />
        </div>
        <div className="field">
          <label>Accroche (tagline)</label>
          <input value={profile.tagline || ""} onChange={(e) => update("tagline", e.target.value)} />
        </div>
        <div className="field">
          <label>Bio courte</label>
          <textarea value={profile.bio || ""} onChange={(e) => update("bio", e.target.value)} />
        </div>
        <div className="field">
          <label>Téléphone 1</label>
          <input value={profile.phone1 || ""} onChange={(e) => update("phone1", e.target.value)} />
        </div>
        <div className="field">
          <label>Téléphone 2</label>
          <input value={profile.phone2 || ""} onChange={(e) => update("phone2", e.target.value)} />
        </div>
        <div className="field">
          <label>Numéro WhatsApp</label>
          <input value={profile.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={profile.email || ""} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="field">
          <label>Photo de la page d'accueil</label>
          <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files[0])} />
        </div>
        <button className="btn" type="submit" disabled={saving}>Enregistrer le profil</button>
        {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

function AddProjectForm({ onAdded }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("design");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) {
      setMsg({ text: "Le titre est obligatoire.", type: "err" });
      return;
    }
    setSaving(true);
    setMsg({ text: "Ajout en cours...", type: "" });
    try {
      let imageUrl = null;
      if (file) imageUrl = await uploadImage(file, "projects");

      const { error } = await supabase.from("projects").insert({
        title: title.trim(),
        category,
        description: description.trim(),
        project_link: link.trim(),
        image_url: imageUrl,
      });
      if (error) throw error;

      setTitle("");
      setDescription("");
      setLink("");
      setFile(null);
      setMsg({ text: "Projet ajouté ✓", type: "ok" });
      onAdded();
    } catch (err) {
      setMsg({ text: "Erreur : " + err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card">
      <h2>Ajouter un projet</h2>
      <form onSubmit={handleAdd}>
        <div className="field">
          <label>Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Lien du projet (optionnel)</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
        </div>
        <div className="field">
          <label>Image du projet</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button className="btn" type="submit" disabled={saving}>Ajouter le projet</button>
        {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

function ProjectsList({ projects, onDeleted }) {
  async function handleDelete(id) {
    if (!confirm("Supprimer ce projet ?")) return;
    await supabase.from("projects").delete().eq("id", id);
    onDeleted();
  }

  return (
    <div className="admin-card">
      <h2>Tes projets</h2>
      {projects.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Aucun projet pour le moment.</p>
      ) : (
        projects.map((p) => (
          <div className="project-row" key={p.id}>
            {p.image_url && <img src={p.image_url} alt={p.title} />}
            <div className="info">
              <div className="t">{p.title}</div>
              <div className="c">{CATEGORY_LABELS[p.category] || p.category}</div>
            </div>
            <button className="btn danger" onClick={() => handleDelete(p.id)}>Supprimer</button>
          </div>
        ))
      )}
    </div>
  );
}

function AdminDashboard() {
  const [projects, setProjects] = useState([]);

  async function loadProjects() {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="admin-wrap">
      <div className="top-bar">
        <h1 style={{ fontSize: 22 }}>Espace admin</h1>
        <div className="row">
          <Link className="btn ghost" to="/">Voir le site</Link>
          <button className="btn danger" onClick={() => supabase.auth.signOut()}>Déconnexion</button>
        </div>
      </div>
      <ProfileForm />
      <AddProjectForm onAdded={loadProjects} />
      <ProjectsList projects={projects} onDeleted={loadProjects} />
    </div>
  );
}

export default function Admin() {
  const session = useSession();

  if (!isSupabaseConfigured) {
    return (
      <div className="config-warning wrap">
        Configuration Supabase manquante. Copie <code>.env.example</code> en <code>.env</code>{" "}
        et remplis tes clés Supabase (voir le README).
      </div>
    );
  }

  if (session === undefined) return null; // chargement de la session
  return session ? <AdminDashboard /> : <div className="admin-wrap"><LoginForm /></div>;
}
