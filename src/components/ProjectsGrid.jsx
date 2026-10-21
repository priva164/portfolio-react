import { useState } from "react";
import { CATEGORY_LABELS } from "../supabaseClient.js";

/* ─── Lightbox ─────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const total = images.length;

  function prev(e) { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); }
  function next(e) { e.stopPropagation(); setIdx((i) => (i + 1) % total); }

  function handleKey(e) {
    if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + total) % total);
    if (e.key === "ArrowRight") setIdx((i) => (i + 1) % total);
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="lightbox-overlay" onClick={onClose} onKeyDown={handleKey} tabIndex={0} autoFocus>
      <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>
        <img className="lb-img" src={images[idx]} alt={`Image ${idx + 1}`} />
        {total > 1 && (
          <>
            <button className="lb-arrow lb-prev" onClick={prev}>‹</button>
            <button className="lb-arrow lb-next" onClick={next}>›</button>
            <div className="lb-counter">{idx + 1} / {total}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Gallery Modal ─────────────────────────────────────── */
function GalleryModal({ project, onClose }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const allImages = [
    ...(project.image_url ? [project.image_url] : []),
    ...((project.images || []).filter((u) => u && u !== project.image_url)),
  ];

  function handleKey(e) {
    if (e.key === "Escape" && lightboxIdx === null) onClose();
  }

  return (
    <div className="gallery-overlay" onClick={onClose} onKeyDown={handleKey} tabIndex={0} autoFocus>
      <div className="gallery-container" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-header">
          <div className="gallery-title-wrap">
            <span className="gallery-cat mono">
              {CATEGORY_LABELS[project.category] || project.category}
            </span>
            <h2 className="gallery-title">{project.title}</h2>
          </div>
          <button className="gallery-close" onClick={onClose}>✕</button>
        </div>

        {project.description && (
          <p className="gallery-desc">{project.description}</p>
        )}

        {project.project_link && (
          <a className="gallery-link" href={project.project_link} target="_blank" rel="noopener noreferrer">
            Voir le projet →
          </a>
        )}

        <div className="gallery-grid">
          {allImages.map((url, i) => (
            <div
              key={i}
              className="gallery-item"
              onClick={() => setLightboxIdx(i)}
            >
              <img src={url} alt={`${project.title} - ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
}

/* ─── Project Card ──────────────────────────────────────── */
function ProjectCard({ project, lang }) {
  const [showGallery, setShowGallery] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Build full images list: merge image_url + images[]
  const allImages = [
    ...(project.image_url ? [project.image_url] : []),
    ...((project.images || []).filter((u) => u && u !== project.image_url)),
  ];

  const hasImages = allImages.length > 0;
  const labels = lang === "en"
    ? { see: "View project →", viewGallery: `${allImages.length} photos` }
    : { see: "Voir le projet →", viewGallery: `${allImages.length} photos` };

  function prevImg(e) {
    e.stopPropagation();
    setCarouselIdx((i) => (i - 1 + allImages.length) % allImages.length);
  }
  function nextImg(e) {
    e.stopPropagation();
    setCarouselIdx((i) => (i + 1) % allImages.length);
  }

  return (
    <>
      <div className="project-card">
        <div
          className="project-img-wrap"
          onClick={() => hasImages && setShowGallery(true)}
          style={{ cursor: hasImages ? "zoom-in" : "default" }}
        >
          {hasImages ? (
            <img
              className="project-img"
              src={allImages[carouselIdx]}
              alt={project.title}
            />
          ) : (
            <div className="project-img project-img--empty" />
          )}

          {allImages.length > 1 && (
            <>
              <button className="ci-arrow ci-prev" onClick={prevImg}>‹</button>
              <button className="ci-arrow ci-next" onClick={nextImg}>›</button>
              <div className="ci-dots">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`ci-dot${i === carouselIdx ? " active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setCarouselIdx(i); }}
                  />
                ))}
              </div>
            </>
          )}

          {hasImages && (
            <div className="img-zoom-hint">🔍</div>
          )}
        </div>

        <div className="project-body">
          <span className="project-tag mono">
            {CATEGORY_LABELS[project.category] || project.category}
          </span>
          <h3 className="project-title">{project.title}</h3>
          {project.description && (
            <p className="project-desc">{project.description}</p>
          )}
          <div className="project-footer">
            {hasImages && allImages.length > 1 && (
              <button className="project-gallery-btn" onClick={() => setShowGallery(true)}>
                🖼 {labels.viewGallery}
              </button>
            )}
            {project.project_link && (
              <a className="project-link" href={project.project_link} target="_blank" rel="noopener noreferrer">
                {labels.see}
              </a>
            )}
          </div>
        </div>
      </div>

      {showGallery && (
        <GalleryModal
          project={project}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
}

/* ─── Video Card ────────────────────────────────────────── */
function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="project-card video-card">
      <div className="video-wrap">
        {playing ? (
          <video
            className="video-player"
            src={video.video_url}
            controls
            autoPlay
            poster={video.thumbnail_url || undefined}
          />
        ) : (
          <div
            className="video-thumb"
            onClick={() => setPlaying(true)}
            style={video.thumbnail_url ? { backgroundImage: `url(${video.thumbnail_url})` } : {}}
          >
            <div className="video-play-btn">▶</div>
          </div>
        )}
      </div>
      <div className="project-body">
        <span className="project-tag mono">Vidéo & Montage</span>
        <h3 className="project-title">{video.title}</h3>
        {video.description && <p className="project-desc">{video.description}</p>}
      </div>
    </div>
  );
}

/* ─── Videos Section ────────────────────────────────────── */
function VideosSection({ videos, lang }) {
  if (!videos || videos.length === 0) return null;
  const title = lang === "en" ? "Video & Editing" : "Vidéo & Montage";
  return (
    <>
      <div className="section-head">
        <h2>{title}</h2>
        <span className="count mono">{videos.length} vidéo(s)</span>
      </div>
      <div className="projects-grid" style={{ paddingBottom: 0 }}>
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </>
  );
}

/* ─── Main Grid ─────────────────────────────────────────── */
export default function ProjectsGrid({ projects, videos, activeCategory, lang }) {
  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const showVideos = activeCategory === "all" || activeCategory === "video";

  const title =
    activeCategory === "all"
      ? (lang === "en" ? "Works" : "Réalisations")
      : CATEGORY_LABELS[activeCategory];

  const emptyMsg =
    lang === "en"
      ? "No projects in this category yet."
      : "Aucun projet dans cette catégorie pour le moment.";

  // When filtering by video, show only the video section
  if (activeCategory === "video") {
    return <VideosSection videos={videos} lang={lang} />;
  }

  return (
    <>
      <div className="section-head">
        <h2>{title}</h2>
        <span className="count mono">{filtered.length} projet(s)</span>
      </div>
      <div className="projects-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">{emptyMsg}</div>
        ) : (
          filtered.map((p) => <ProjectCard key={p.id} project={p} lang={lang} />)
        )}
      </div>

      {activeCategory === "all" && <VideosSection videos={videos} lang={lang} />}
    </>
  );
}
