import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import { supabase, isSupabaseConfigured, CATEGORY_LABELS, CATEGORY_LABELS_EN } from "../supabaseClient.js";

/* ─── i18n ──────────────────────────────────────────────── */
const T = {
  fr: {
    login: "Connexion admin",
    email: "Email",
    password: "Mot de passe",
    connect: "Se connecter",
    wrongCreds: "Identifiants incorrects.",
    connecting: "Connexion...",
    adminSpace: "Espace Admin",
    viewSite: "Voir le site",
    logout: "Déconnexion",
    profile: "Profil & Accueil",
    fullName: "Nom complet",
    tagline: "Accroche",
    bio: "Bio courte",
    phone1: "Téléphone 1",
    phone2: "Téléphone 2",
    whatsapp: "WhatsApp",
    emailField: "Email",
    heroPhoto: "Photo de profil",
    cropPhoto: "Recadrer la photo",
    cropConfirm: "Confirmer",
    cropCancel: "Annuler",
    cropZoom: "Zoom",
    saveProfile: "Enregistrer le profil",
    profileSaved: "Profil enregistré ✓",
    saving: "Enregistrement...",
    error: "Erreur : ",
    addProject: "Ajouter un projet",
    title: "Titre",
    category: "Catégorie",
    description: "Description",
    projectLink: "Lien du projet (optionnel)",
    images: "Images du projet (plusieurs autorisées)",
    addBtn: "Ajouter le projet",
    adding: "Ajout en cours...",
    added: "Projet ajouté ✓",
    editBtn: "Modifier",
    saveChanges: "Enregistrer les modifications",
    editing: "Enregistrement...",
    edited: "Projet modifié ✓",
    cancelEdit: "Annuler",
    titleRequired: "Le titre est obligatoire.",
    myProjects: "Mes projets",
    noProjects: "Aucun projet pour le moment.",
    delete: "Supprimer",
    confirmDelete: "Supprimer ce projet ?",
    addVideo: "Ajouter une vidéo",
    videoTitle: "Titre de la vidéo",
    videoFile: "Fichier vidéo",
    thumbnail: "Miniature (optionnel)",
    addVideoBtn: "Ajouter la vidéo",
    videoAdded: "Vidéo ajoutée ✓",
    myVideos: "Mes vidéos",
    noVideos: "Aucune vidéo pour le moment.",
    confirmDeleteVideo: "Supprimer cette vidéo ?",
    nav: {
      profile: "Profil",
      projects: "Projets",
      videos: "Vidéos",
    },
  },
  en: {
    login: "Admin Login",
    email: "Email",
    password: "Password",
    connect: "Sign in",
    wrongCreds: "Incorrect credentials.",
    connecting: "Signing in...",
    adminSpace: "Admin Space",
    viewSite: "View site",
    logout: "Sign out",
    profile: "Profile & Hero",
    fullName: "Full name",
    tagline: "Tagline",
    bio: "Short bio",
    phone1: "Phone 1",
    phone2: "Phone 2",
    whatsapp: "WhatsApp",
    emailField: "Email",
    heroPhoto: "Profile photo",
    cropPhoto: "Crop photo",
    cropConfirm: "Confirm",
    cropCancel: "Cancel",
    cropZoom: "Zoom",
    saveProfile: "Save profile",
    profileSaved: "Profile saved ✓",
    saving: "Saving...",
    error: "Error: ",
    addProject: "Add a project",
    title: "Title",
    category: "Category",
    description: "Description",
    projectLink: "Project link (optional)",
    images: "Project images (multiple allowed)",
    addBtn: "Add project",
    adding: "Adding...",
    added: "Project added ✓",
    editBtn: "Edit",
    saveChanges: "Save changes",
    editing: "Saving...",
    edited: "Project updated ✓",
    cancelEdit: "Cancel",
    titleRequired: "Title is required.",
    myProjects: "My projects",
    noProjects: "No projects yet.",
    delete: "Delete",
    confirmDelete: "Delete this project?",
    addVideo: "Add a video",
    videoTitle: "Video title",
    videoFile: "Video file",
    thumbnail: "Thumbnail (optional)",
    addVideoBtn: "Add video",
    videoAdded: "Video added ✓",
    myVideos: "My videos",
    noVideos: "No videos yet.",
    confirmDeleteVideo: "Delete this video?",
    nav: {
      profile: "Profile",
      projects: "Projects",
      videos: "Videos",
    },
  },
};

/* ─── Auth hook ─────────────────────────────────────────── */
function useSession() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}

/* ─── Upload helpers ─────────────────────────────────────── */
async function uploadFile(file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

async function uploadMany(files, folder) {
  return Promise.all(Array.from(files).map((f) => uploadFile(f, folder)));
}

/* ─── Crop helpers ──────────────────────────────────────── */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.9);
  });
}

/* ─── Crop Modal ────────────────────────────────────────── */
function CropModal({ imageSrc, onConfirm, onCancel, t }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onConfirm(blob);
  }

  return (
    <div className="al-crop-overlay">
      <div className="al-crop-container">
        <div className="al-crop-header">{t.cropPhoto}</div>
        <div className="al-crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
          />
        </div>
        <div className="al-crop-controls">
          <div className="al-crop-zoom">
            <label>{t.cropZoom}</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="al-crop-actions">
            <button className="al-btn al-btn-ghost" onClick={onCancel}>{t.cropCancel}</button>
            <button className="al-btn al-btn-primary" onClick={handleConfirm}>{t.cropConfirm}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login ─────────────────────────────────────────────── */
function LoginForm({ lang, darkMode, onToggleLang, onToggleDark }) {
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ text: t.connecting, type: "" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMsg({ text: t.wrongCreds, type: "err" }); return; }
    setMsg(null);
  }

  return (
    <div className="al-login-wrap">
      <div className="al-login-card">
        <div className="al-login-top">
          <div className="al-brand">NAKO <span className="al-dot">·</span> PRIVA</div>
          <div className="al-login-controls">
            <button className="al-ctrl" onClick={onToggleLang}>{lang === "fr" ? "EN" : "FR"}</button>
            <button className="al-ctrl" onClick={onToggleDark}>{darkMode ? "☀" : "☾"}</button>
          </div>
        </div>
        <h2 className="al-login-title">{t.login}</h2>
        <form onSubmit={handleLogin} className="al-form">
          <div className="al-field">
            <label>{t.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" required />
          </div>
          <div className="al-field">
            <label>{t.password}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="al-btn al-btn-primary" type="submit">{t.connect}</button>
          {msg && <p className={`al-msg ${msg.type}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}

/* ─── Profile section ───────────────────────────────────── */
function ProfileSection({ lang }) {
  const t = T[lang];
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => {
    supabase.from("profile").select("*").limit(1).maybeSingle().then(({ data }) => setProfile(data));
  }, []);

  if (!profile) return <div className="al-loading">…</div>;

  function update(field, value) { setProfile((p) => ({ ...p, [field]: value })); }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Read the file as data URL for the cropper
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    // Clear input so same file can be re-selected
    e.target.value = "";
  }

  function handleCropConfirm(blob) {
    setHeroFile(blob);
    setHeroPreview(URL.createObjectURL(blob));
    setCropImageSrc(null);
  }

  function handleCropCancel() {
    setCropImageSrc(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: t.saving, type: "" });
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
      if (heroFile) payload.hero_image_url = await uploadFile(heroFile, "profile");
      const { error } = await supabase.from("profile").update(payload).eq("id", profile.id);
      if (error) throw error;
      setMsg({ text: t.profileSaved, type: "ok" });
    } catch (err) {
      setMsg({ text: t.error + err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          t={t}
        />
      )}
      <form onSubmit={handleSave} className="al-section-form">
        <div className="al-grid-2">
          <div className="al-field">
            <label>{t.fullName}</label>
            <input value={profile.full_name || ""} onChange={(e) => update("full_name", e.target.value)} />
          </div>
          <div className="al-field">
            <label>{t.tagline}</label>
            <input value={profile.tagline || ""} onChange={(e) => update("tagline", e.target.value)} />
          </div>
          <div className="al-field al-span-2">
            <label>{t.bio}</label>
            <textarea value={profile.bio || ""} onChange={(e) => update("bio", e.target.value)} />
          </div>
          <div className="al-field">
            <label>{t.phone1}</label>
            <input value={profile.phone1 || ""} onChange={(e) => update("phone1", e.target.value)} />
          </div>
          <div className="al-field">
            <label>{t.phone2}</label>
            <input value={profile.phone2 || ""} onChange={(e) => update("phone2", e.target.value)} />
          </div>
          <div className="al-field">
            <label>{t.whatsapp}</label>
            <input value={profile.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} />
          </div>
          <div className="al-field">
            <label>{t.emailField}</label>
            <input value={profile.email || ""} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="al-field al-span-2">
            <label>{t.heroPhoto}</label>
            <div className="al-photo-row">
              <img
                src={heroPreview || profile.hero_image_url || ""}
                alt="hero"
                className="al-preview-photo"
                style={{ display: heroPreview || profile.hero_image_url ? "block" : "none" }}
              />
              <input type="file" accept="image/*" onChange={handleFileSelect} />
            </div>
          </div>
        </div>
        <div className="al-form-footer">
          <button className="al-btn al-btn-primary" type="submit" disabled={saving}>{t.saveProfile}</button>
          {msg && <span className={`al-msg ${msg.type}`}>{msg.text}</span>}
        </div>
      </form>
    </>
  );
}

/* ─── Add/Edit Project section ──────────────────────────── */
function AddProjectSection({ lang, onAdded, editingProject, onCancelEdit }) {
  const t = T[lang];
  const catLabels = lang === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS;
  const isEditing = !!editingProject;
  const [title, setTitle] = useState(isEditing ? editingProject.title : "");
  const [category, setCategory] = useState(isEditing ? editingProject.category : "design");
  const [description, setDescription] = useState(isEditing ? (editingProject.description || "") : "");
  const [link, setLink] = useState(isEditing ? (editingProject.project_link || "") : "");
  const [files, setFiles] = useState(null);
  const [existingImages, setExistingImages] = useState(isEditing ? (editingProject.images || []) : []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Reset form when switching between add and edit modes
  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setCategory(editingProject.category || "design");
      setDescription(editingProject.description || "");
      setLink(editingProject.project_link || "");
      setExistingImages(editingProject.images || []);
      setFiles(null);
      setMsg(null);
    }
  }, [editingProject]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) { setMsg({ text: t.titleRequired, type: "err" }); return; }
    setSaving(true);
    setMsg({ text: isEditing ? t.editing : t.adding, type: "" });
    try {
      let images = [...existingImages];
      if (files && files.length > 0) {
        const newImages = await uploadMany(files, "projects");
        images = [...images, ...newImages];
      }
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        project_link: link.trim(),
        image_url: images[0] || null,
        images,
      };

      let error;
      if (isEditing) {
        ({ error } = await supabase.from("projects").update(payload).eq("id", editingProject.id));
      } else {
        ({ error } = await supabase.from("projects").insert(payload));
      }

      if (error) throw error;
      setTitle(""); setDescription(""); setLink(""); setFiles(null); setExistingImages([]);
      setMsg({ text: isEditing ? t.edited : t.added, type: "ok" });
      onAdded();
      if (isEditing) onCancelEdit();
    } catch (err) {
      setMsg({ text: t.error + err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  function removeExistingImage(idx) {
    setExistingImages((imgs) => imgs.filter((_, i) => i !== idx));
  }

  return (
    <form onSubmit={handleAdd} className="al-section-form">
      <div className="al-grid-2">
        <div className="al-field">
          <label>{t.title}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="al-field">
          <label>{t.category}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(catLabels)
              .filter(([key]) => key !== "video")
              .map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
          </select>
        </div>
        <div className="al-field al-span-2">
          <label>{t.description}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="al-field">
          <label>{t.projectLink}</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
        </div>
        <div className="al-field">
          <label>{t.images}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
          {files && files.length > 0 && (
            <div className="al-thumbs">
              {Array.from(files).map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} alt={f.name} className="al-thumb" />
              ))}
            </div>
          )}
          {isEditing && existingImages.length > 0 && (
            <div className="al-thumbs">
              {existingImages.map((url, i) => (
                <div key={i} className="al-thumb-wrap">
                  <img src={url} alt="existing" className="al-thumb" />
                  <button
                    type="button"
                    className="al-thumb-remove"
                    onClick={() => removeExistingImage(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="al-form-footer">
        {isEditing ? (
          <>
            <button className="al-btn al-btn-primary" type="submit" disabled={saving}>{t.saveChanges}</button>
            <button className="al-btn al-btn-ghost" type="button" onClick={onCancelEdit}>{t.cancelEdit}</button>
          </>
        ) : (
          <button className="al-btn al-btn-primary" type="submit" disabled={saving}>{t.addBtn}</button>
        )}
        {msg && <span className={`al-msg ${msg.type}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

/* ─── Projects list ─────────────────────────────────────── */
function ProjectsListSection({ lang, projects, onDeleted, onEdit, editingId }) {
  const t = T[lang];
  const catLabels = lang === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS;

  async function handleDelete(id) {
    if (!confirm(t.confirmDelete)) return;
    await supabase.from("projects").delete().eq("id", id);
    onDeleted();
  }

  if (projects.length === 0) {
    return <p className="al-empty">{t.noProjects}</p>;
  }

  return (
    <div className="al-proj-list">
      {projects.map((p) => {
        const allImages = [
          ...(p.image_url ? [p.image_url] : []),
          ...((p.images || []).filter((u) => u && u !== p.image_url)),
        ];
        const isEditing = editingId === p.id;
        return (
          <div className={`al-proj-row${isEditing ? " editing" : ""}`} key={p.id}>
            <div className="al-proj-thumbs">
              {allImages.slice(0, 3).map((url, i) => (
                <img key={i} src={url} alt={p.title} className="al-proj-img" />
              ))}
              {allImages.length === 0 && <div className="al-proj-img al-proj-img--empty" />}
              {allImages.length > 3 && (
                <div className="al-proj-more">+{allImages.length - 3}</div>
              )}
            </div>
            <div className="al-proj-info">
              <div className="al-proj-title">{p.title}</div>
              <div className="al-proj-cat">{catLabels[p.category] || p.category}</div>
            </div>
            <div className="al-proj-actions">
              <button
                className={`al-btn ${isEditing ? "al-btn-primary" : "al-btn-ghost"}`}
                onClick={() => onEdit(p)}
              >
                {isEditing ? t.editing : t.editBtn}
              </button>
              <button className="al-btn al-btn-danger" onClick={() => handleDelete(p.id)}>
                {t.delete}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Add Video section ─────────────────────────────────── */
function AddVideoSection({ lang, onAdded }) {
  const t = T[lang];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim() || !videoFile) {
      setMsg({ text: t.titleRequired, type: "err" }); return;
    }
    setSaving(true);
    setMsg({ text: t.adding, type: "" });
    try {
      const videoUrl = await uploadFile(videoFile, "videos");
      let thumbnailUrl = null;
      if (thumbFile) thumbnailUrl = await uploadFile(thumbFile, "thumbnails");
      const { error } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
      });
      if (error) throw error;
      setTitle(""); setDescription(""); setVideoFile(null); setThumbFile(null);
      setMsg({ text: t.videoAdded, type: "ok" });
      onAdded();
    } catch (err) {
      setMsg({ text: t.error + err.message, type: "err" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleAdd} className="al-section-form">
      <div className="al-grid-2">
        <div className="al-field al-span-2">
          <label>{t.videoTitle}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="al-field al-span-2">
          <label>{t.description}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="al-field">
          <label>{t.videoFile}</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            required
          />
          {videoFile && (
            <video className="al-video-preview" src={URL.createObjectURL(videoFile)} controls />
          )}
        </div>
        <div className="al-field">
          <label>{t.thumbnail}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files[0])}
          />
          {thumbFile && (
            <img src={URL.createObjectURL(thumbFile)} alt="thumb" className="al-thumb" />
          )}
        </div>
      </div>
      <div className="al-form-footer">
        <button className="al-btn al-btn-primary" type="submit" disabled={saving}>{t.addVideoBtn}</button>
        {msg && <span className={`al-msg ${msg.type}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

/* ─── Videos list ───────────────────────────────────────── */
function VideosListSection({ lang, videos, onDeleted }) {
  const t = T[lang];

  async function handleDelete(id) {
    if (!confirm(t.confirmDeleteVideo)) return;
    await supabase.from("videos").delete().eq("id", id);
    onDeleted();
  }

  if (videos.length === 0) return <p className="al-empty">{t.noVideos}</p>;

  return (
    <div className="al-proj-list">
      {videos.map((v) => (
        <div className="al-proj-row" key={v.id}>
          <div className="al-proj-thumbs">
            {v.thumbnail_url
              ? <img src={v.thumbnail_url} alt={v.title} className="al-proj-img" />
              : <div className="al-proj-img al-proj-img--video">▶</div>
            }
          </div>
          <div className="al-proj-info">
            <div className="al-proj-title">{v.title}</div>
            <div className="al-proj-cat">Vidéo & Montage</div>
          </div>
          <button className="al-btn al-btn-danger" onClick={() => handleDelete(v.id)}>
            {t.delete}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────── */
function AdminDashboard({ lang, darkMode, onToggleLang, onToggleDark }) {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState("profile");
  const [projects, setProjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  function handleEditProject(project) {
    if (editingProject && editingProject.id === project.id) {
      setEditingProject(null);
    } else {
      setEditingProject(project);
    }
  }

  function handleCancelEdit() {
    setEditingProject(null);
  }

  async function loadProjects() {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
  }
  async function loadVideos() {
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    setVideos(data || []);
  }

  useEffect(() => { loadProjects(); loadVideos(); }, []);

  const tabs = [
    { key: "profile",  label: t.nav.profile,  icon: "👤" },
    { key: "projects", label: t.nav.projects,  icon: "🗂" },
    { key: "videos",   label: t.nav.videos,    icon: "🎬" },
  ];

  return (
    <div className="al-dashboard">
      {/* Sidebar */}
      <aside className="al-sidebar">
        <div className="al-sidebar-brand">
          NAKO <span className="al-dot">·</span> PRIVA
        </div>
        <nav className="al-sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`al-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="al-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="al-sidebar-footer">
          <button className="al-ctrl-side" onClick={onToggleLang}>{lang === "fr" ? "EN" : "FR"}</button>
          <button className="al-ctrl-side" onClick={onToggleDark}>{darkMode ? "☀" : "☾"}</button>
          <Link className="al-ctrl-side" to="/">↗</Link>
          <button className="al-ctrl-side al-signout" onClick={() => supabase.auth.signOut()}>⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="al-main">
        <div className="al-main-header">
          <div>
            <h1 className="al-main-title">
              {activeTab === "profile" && t.profile}
              {activeTab === "projects" && t.myProjects}
              {activeTab === "videos"   && t.myVideos}
            </h1>
          </div>
          <div className="al-main-actions">
            <Link className="al-btn al-btn-ghost" to="/">{t.viewSite}</Link>
            <button className="al-btn al-btn-danger" onClick={() => supabase.auth.signOut()}>{t.logout}</button>
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="al-panel">
            <ProfileSection lang={lang} />
          </div>
        )}

        {activeTab === "projects" && (
          <>
            <div className="al-panel">
              <h2 className="al-panel-title">
                {editingProject ? t.editBtn : t.addProject}
              </h2>
              <AddProjectSection
                lang={lang}
                onAdded={loadProjects}
                editingProject={editingProject}
                onCancelEdit={handleCancelEdit}
              />
            </div>
            <div className="al-panel">
              <h2 className="al-panel-title">{t.myProjects} <span className="al-count">{projects.length}</span></h2>
              <ProjectsListSection
                lang={lang}
                projects={projects}
                onDeleted={loadProjects}
                onEdit={handleEditProject}
                editingId={editingProject?.id}
              />
            </div>
          </>
        )}

        {activeTab === "videos" && (
          <>
            <div className="al-panel">
              <h2 className="al-panel-title">{t.addVideo}</h2>
              <AddVideoSection lang={lang} onAdded={loadVideos} />
            </div>
            <div className="al-panel">
              <h2 className="al-panel-title">{t.myVideos} <span className="al-count">{videos.length}</span></h2>
              <VideosListSection lang={lang} videos={videos} onDeleted={loadVideos} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Root ──────────────────────────────────────────────── */
export default function Admin() {
  const session = useSession();
  const [lang, setLang] = useState("fr");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  if (!isSupabaseConfigured) {
    return (
      <div className="config-warning wrap">
        Configuration Supabase manquante. Copie <code>.env.example</code> en <code>.env</code>{" "}
        et remplis tes clés Supabase.
      </div>
    );
  }

  if (session === undefined) return null;

  if (!session) {
    return (
      <LoginForm
        lang={lang}
        darkMode={darkMode}
        onToggleLang={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
    );
  }

  return (
    <AdminDashboard
      lang={lang}
      darkMode={darkMode}
      onToggleLang={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
      onToggleDark={() => setDarkMode((d) => !d)}
    />
  );
}
