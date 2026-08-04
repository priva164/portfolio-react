import { CATEGORY_LABELS } from "../supabaseClient.js";

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      {project.image_url ? (
        <img className="project-img" src={project.image_url} alt={project.title} />
      ) : (
        <div className="project-img" />
      )}
      <div className="project-body">
        <span className="project-tag mono">
          {CATEGORY_LABELS[project.category] || project.category}
        </span>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        {project.project_link && (
          <a className="project-link" href={project.project_link} target="_blank" rel="noopener noreferrer">
            Voir le projet →
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectsGrid({ projects, activeCategory }) {
  const filtered =
    activeCategory === "all" ? projects : projects.filter((p) => p.category === activeCategory);

  const title = activeCategory === "all" ? "Réalisations" : CATEGORY_LABELS[activeCategory];

  return (
    <>
      <div className="section-head">
        <h2>{title}</h2>
        <span className="count mono">{filtered.length} projet(s)</span>
      </div>
      <div className="projects-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">Aucun projet dans cette catégorie pour le moment.</div>
        ) : (
          filtered.map((p) => <ProjectCard key={p.id} project={p} />)
        )}
      </div>
    </>
  );
}
