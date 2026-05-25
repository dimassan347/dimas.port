import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import {
  MAX_PROJECT_IMAGES,
  normalizeProjectImages,
} from "../../utils/projectImages";
import { useToast } from "../../hooks/useToast";
import ToastStack from "../../components/ToastStack";
import {
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  X,
  ImageIcon,
  ExternalLink,
  Pencil,
  LayoutGrid,
  List,
  Globe,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Eye,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="relative">
    <div className="absolute -inset-0.5 rounded-2xl blur opacity-10" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
    <div className="relative bg-white/5 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
      <div className="w-full aspect-[16/8] bg-white/5 animate-pulse rounded-xl" />
      <div className="h-4 bg-white/5 animate-pulse rounded-lg w-2/3" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-full" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-4/5" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-5 w-16 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-12 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-20 bg-white/5 animate-pulse rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/8 mt-auto">
        <div className="flex gap-2">
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-14 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-16 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

/* ── Premium Project Card (Grid View) ── */
const ProjectCard = ({ project, onDelete, onEdit }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const title = project.title || project.Title || "Untitled";
  const desc = project.description || project.Description || "";
  const techStack = project.tech_stack || project.techstack || project.TechStack || [];
  const features = project.features || project.Features || [];
  const isPublished = project.is_published ?? true;
  const imgSrc = project.img || project.Img || "";
  const liveUrl = project.link || project.Link || "";

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 hover:border-white/20 hover:shadow-2xl"
      style={{ boxShadow: hovered ? "0 0 40px -10px rgba(99,102,241,0.25)" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
      />

      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/5 shrink-0">
        {imgSrc ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-white/5" />}
            <img
              src={imgSrc}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm ${
          isPublished
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            : "bg-amber-500/20 border-amber-500/40 text-amber-300"
        }`}>
          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {isPublished ? "Published" : "Draft"}
        </div>

        {/* Quick links overlay on hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
              title="Live Preview"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors duration-300">
            {title}
          </h3>
          {desc && (
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/80 text-[11px]"
              >
                <Layers className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[11px]">
                +{techStack.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300/80 text-[11px]"
              >
                <Zap className="w-2.5 h-2.5" />
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-white/8 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/8 text-gray-500 hover:text-white hover:border-white/20 transition-all hover:bg-white/5"
                title="Open live site"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 text-xs font-medium transition-all duration-200"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/18 hover:border-red-500/40 text-xs font-medium transition-all duration-200"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Premium Table Row (List View) ── */
const ProjectRow = ({ project, onDelete, onEdit, index }) => {
  const title = project.title || project.Title || "Untitled";
  const desc = project.description || project.Description || "";
  const techStack = project.tech_stack || project.techstack || project.TechStack || [];
  const features = project.features || project.Features || [];
  const isPublished = project.is_published ?? true;
  const imgSrc = project.img || project.Img || "";
  const liveUrl = project.link || project.Link || "";

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/8 shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white/15" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isPublished
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
          }`}>
            {isPublished ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
        {desc && <p className="text-xs text-gray-500 truncate">{desc}</p>}
      </div>

      {/* Tech Stack */}
      <div className="hidden sm:flex flex-wrap gap-1 w-40 shrink-0">
        {techStack.slice(0, 3).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/80 text-[10px]">
            {t}
          </span>
        ))}
        {techStack.length > 3 && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[10px]">
            +{techStack.length - 3}
          </span>
        )}
      </div>

      {/* Features */}
      <div className="hidden lg:flex flex-wrap gap-1 w-36 shrink-0">
        {features.slice(0, 2).map((f) => (
          <span key={f} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300/80 text-[10px]">
            {f}
          </span>
        ))}
        {features.length > 2 && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 text-[10px]">
            +{features.length - 2}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/25 transition-all"
            title="Live site">
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}
        <button onClick={() => onEdit(project)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-all">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button onClick={() => onDelete(project.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/18 text-xs font-medium transition-all">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div
      className="relative z-10 w-full max-w-2xl flex flex-col"
      style={{ maxHeight: "calc(100vh - 24px)" }}
    >
      <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
  uploading,
}) => {
  const [imageItems, setImageItems] = useState(() =>
    normalizeProjectImages(initial).map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      file: null,
    })),
  );
  const [form, setForm] = useState({
    title: initial?.title || initial?.Title || "",
    description: initial?.description || initial?.Description || "",
    techstack: Array.isArray(initial?.tech_stack)
      ? initial.tech_stack.join(", ")
      : Array.isArray(initial?.techstack)
        ? initial.techstack.join(", ")
        : Array.isArray(initial?.TechStack)
          ? initial.TechStack.join(", ")
          : initial?.techstack || initial?.TechStack || initial?.tech_stack || "",
    features: Array.isArray(initial?.features)
      ? initial.features.join(", ")
      : Array.isArray(initial?.Features)
        ? initial.Features.join(", ")
        : initial?.features || initial?.Features || "",
    link: initial?.link || initial?.Link || "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = MAX_PROJECT_IMAGES - imageItems.length;
    if (availableSlots <= 0) {
      alert(`Maximum ${MAX_PROJECT_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);
    const nextItems = acceptedFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setImageItems((current) => [...current, ...nextItems]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImageItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, imageItems);
  };

  const sectionTitle = (icon, text) => (
    <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest my-2 pt-2 sm:col-span-2">
      <div className="flex-1 h-px bg-white/6" />
      <span className="flex items-center gap-1.5">{icon} {text}</span>
      <div className="flex-1 h-px bg-white/6" />
    </div>
  );

  const inputCls = "w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all";
  const labelCls = "text-xs text-indigo-300/70 uppercase tracking-wider font-medium";

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sectionTitle(<FolderGit2 className="w-3 h-3" />, "Basic Info")}
        
        <div className="sm:col-span-2 space-y-1.5">
          <label className={labelCls}>Project Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. My Portfolio Website"
            required
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Describe what this project does, its purpose, and impact..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {sectionTitle(<Zap className="w-3 h-3" />, "Tech & Features")}

        <div className="space-y-1.5">
          <label className={labelCls}>Tech Stack</label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.techstack}
              onChange={set("techstack")}
              placeholder="e.g. React, Tailwind, Supabase"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Key Features</label>
          <div className="relative">
            <List className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.features}
              onChange={set("features")}
              placeholder="e.g. Auth, Dark mode"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        {sectionTitle(<ExternalLink className="w-3 h-3" />, "Links")}

        <div className="space-y-1.5">
          <label className={labelCls}>Live URL</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="url"
              value={form.link}
              onChange={set("link")}
              placeholder="https://yourproject.com"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

    

        {sectionTitle(<ImageIcon className="w-3 h-3" />, "Media")}

        <div className="sm:col-span-2 space-y-1.5">
          <label className={labelCls}>
            Project Images (max {MAX_PROJECT_IMAGES})
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
              {imageItems.length > 0 ? (
                <div className="flex -space-x-3">
                  {imageItems.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.url}
                      className="h-16 w-24 object-cover rounded-lg border border-white/10 ring-2 ring-[#0d0d22]"
                      alt="preview"
                    />
                  ))}
                  {imageItems.length > 3 && (
                     <div className="h-16 w-16 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs text-gray-300 ring-2 ring-[#0d0d22]">
                       +{imageItems.length - 3}
                     </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-300">
                  {imageItems.length > 0 ? "Add more images" : "Click to upload images"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  PNG, JPG, WEBP supported
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={imageItems.length >= MAX_PROJECT_IMAGES}
              />
            </label>

            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 group/img"
                  >
                    <img
                      src={item.url}
                      alt={`Project preview ${index + 1}`}
                      className="h-28 w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                    <div className="absolute left-2 top-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white border border-white/10 shadow-sm">
                      {index === 0 ? "Primary" : `#${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute right-2 top-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="relative group/s">
          <div className="absolute -inset-0.5 rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" style={{ background: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))' }} />
          <div className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-sm font-medium text-gray-200">
              {uploading ? "Saving..." : submitLabel}
            </span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toasts, pushToast, removeToast } = useToast();

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const uploadImage = async (f) => {
    const fileName = `${Date.now()}-${f.name}`;
    await supabase.storage.from("project-images").upload(fileName, f);
    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadProjectImages = async (imageItems) => {
    const uploadedUrls = [];

    for (const item of (imageItems || []).slice(0, 6)) {
      if (item?.file) {
        uploadedUrls.push(await uploadImage(item.file));
      } else if (item?.url) {
        uploadedUrls.push(item.url);
      }
    }

    return [...new Set(uploadedUrls)].slice(0, MAX_PROJECT_IMAGES);
  };

  const handleCreate = async (form, imageItems) => {
    setUploading(true);
    const images = await uploadProjectImages(imageItems);
    await supabase.from("projects").insert({
      title: form.title,
      description: form.description,
      img: images[0] || "",
      images,
      tech_stack: form.techstack.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      link: form.link,
    });
    setShowCreate(false);
    pushToast("success", "Project created successfully!");
    setUploading(false);
    fetchProjects();
  };

  const handleEdit = async (form, imageItems) => {
    setUploading(true);
    const images = await uploadProjectImages(imageItems);
    await supabase
      .from("projects")
      .update({
        title: form.title,
        description: form.description,
        img: images[0] || "",
        images,
        tech_stack: form.techstack.split(",").map((s) => s.trim()).filter(Boolean),
        features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
        link: form.link,
      })
      .eq("id", editProject.id);
    setEditProject(null);
    pushToast("success", "Project updated successfully!");
    setUploading(false);
    fetchProjects();
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      pushToast("error", error.message || "Failed to delete project");
      return;
    }
    pushToast("success", "Project deleted successfully!");
    fetchProjects();
  };

  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const publishedCount = projects.filter((p) => p.is_published ?? true).length;
  const draftCount = projects.length - publishedCount;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: Icon + Title + Stats */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1 rounded-xl blur-md opacity-60"
              style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))" }}
            />
            <div
              className="relative w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center"
              style={{ backgroundColor: "var(--color-backdrop-base)" }}
            >
              <FolderGit2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Projects</h1>
            {!loading && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                  <Eye className="w-3 h-3" /> {projects.length} total
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                  <CheckCircle2 className="w-3 h-3" /> {publishedCount} published
                </span>
                {draftCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                    <Clock className="w-3 h-3" /> {draftCount} draft
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: View Toggle + New Project */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Project CTA */}
          <button onClick={() => setShowCreate(true)} className="relative group">
            <div
              className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300"
              style={{ background: "linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))" }}
            />
            <div
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10"
              style={{ backgroundColor: "var(--color-backdrop-base)" }}
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-gray-200">New Project</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <Modal title="Add New Project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save Project"
            uploading={uploading}
          />
        </Modal>
      )}
      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(null)}>
          <ProjectForm
            initial={editProject}
            onSubmit={handleEdit}
            onCancel={() => setEditProject(null)}
            submitLabel="Update Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* ── Content ── */}
      {loading ? (
        /* Skeleton */
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="w-20 h-14 rounded-lg bg-white/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 animate-pulse rounded-lg w-1/3" />
                  <div className="h-3 bg-white/5 animate-pulse rounded-lg w-1/2" />
                </div>
                <div className="hidden sm:flex gap-1 w-40">
                  <div className="h-5 w-16 bg-white/5 animate-pulse rounded-full" />
                  <div className="h-5 w-14 bg-white/5 animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : projects.length === 0 ? (
        /* Empty state */
        <div className="relative rounded-2xl border border-white/8 border-dashed overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
          />
          <div className="relative py-24 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FolderGit2 className="w-7 h-7 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-medium text-sm">No projects yet</p>
              <p className="text-gray-600 text-xs mt-1">Add your first project to showcase your work</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="relative group mt-2"
            >
              <div
                className="absolute -inset-0.5 rounded-xl opacity-50 blur group-hover:opacity-90 transition duration-300"
                style={{ background: "linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))" }}
              />
              <div
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-200"
                style={{ backgroundColor: "var(--color-backdrop-base)" }}
              >
                <Plus className="w-4 h-4 text-indigo-400" /> Create First Project
              </div>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              onEdit={setEditProject}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white/[0.03] border-b border-white/8">
            <div className="w-20 shrink-0" />
            <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Project</div>
            <div className="hidden sm:block w-40 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tech Stack</div>
            <div className="hidden lg:block w-36 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Features</div>
            <div className="w-36 shrink-0" />
          </div>
          {/* Rows */}
          <div className="p-2 space-y-1">
            {projects.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                onDelete={deleteProject}
                onEdit={setEditProject}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
