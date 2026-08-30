// All the small, reusable UI pieces live here: Button, Badge, FormField,
// Modal, loading/error/empty states, TaskCard, and the page layout (AppShell).
import { useEffect } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

// ---------- Button ----------
const BUTTON_STYLES = {
  primary: "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-[#fff6ef] hover:bg-[var(--brand-wood)]",
  ghost: "border-transparent bg-transparent text-[var(--brand-wood)] hover:bg-[var(--brand-sand)]/20",
  danger: "border-[var(--brand-wood)] bg-[var(--brand-wood)] text-[#fff6ef] hover:bg-[#3f352f]",
  outline: "border-[var(--brand-taupe)] bg-white text-[var(--brand-ink)] hover:bg-[#fff8f2]",
};

export function Button({ children, variant = "primary", type = "button", disabled, loading, fullWidth, ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_STYLES[variant]} ${fullWidth ? "w-full" : ""}`}
      {...rest}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      <span className={loading ? "opacity-90" : ""}>{children}</span>
    </button>
  );
}

// ---------- Badge (status / priority pill) ----------
const LABELS = {
  status: { todo: "To do", "in-progress": "In progress", done: "Done" },
  priority: { low: "Low", medium: "Medium", high: "High" },
};
const BADGE_STYLES = {
  status: {
    todo: "bg-[var(--brand-sand)]/18 text-[var(--brand-ink)] ring-[var(--brand-sand)]/40",
    "in-progress": "bg-[var(--brand-taupe)]/18 text-[var(--brand-wood)] ring-[var(--brand-taupe)]/35",
    done: "bg-[var(--brand-wood)]/12 text-[var(--brand-wood)] ring-[var(--brand-wood)]/25",
  },
  priority: {
    low: "bg-[var(--brand-sand)]/18 text-[var(--brand-ink)] ring-[var(--brand-sand)]/35",
    medium: "bg-[var(--brand-taupe)]/18 text-[var(--brand-wood)] ring-[var(--brand-taupe)]/35",
    high: "bg-[var(--brand-ink)]/8 text-[var(--brand-ink)] ring-[var(--brand-ink)]/15",
  },
};

export function Badge({ kind, value }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${BADGE_STYLES[kind][value]}`}>
      {kind === "priority" && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {LABELS[kind][value]}
    </span>
  );
}

// ---------- FormField (input / textarea / select) ----------
export function FormField({ label, name, type = "text", value, onChange, error, placeholder, as = "input", children, ...rest }) {
  const id = `field-${name}`;
  const cls = `w-full rounded-xl border bg-white px-3 py-2 text-sm text-[var(--brand-ink)] shadow-sm outline-none transition placeholder:text-[var(--brand-taupe)] focus:ring-4 ${
    error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-[var(--brand-sand)]/70 focus:border-[var(--brand-wood)] focus:ring-[var(--brand-sand)]/25"
  }`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-[var(--brand-wood)]">{label}</label>
      {as === "textarea" ? (
        <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4} className={`${cls} min-h-28 resize-y`} {...rest} />
      ) : as === "select" ? (
        <select id={id} name={name} value={value} onChange={onChange} className={`${cls} pr-9`} {...rest}>{children}</select>
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={cls} {...rest} />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-ink)]/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--brand-sand)]/40 bg-[#fff9f4] shadow-2xl shadow-black/20" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 border-b border-[var(--brand-sand)]/30 px-6 py-5">
          <h3 className="text-lg font-semibold text-[var(--brand-ink)]">{title}</h3>
          <button className="rounded-lg p-2 text-[var(--brand-wood)] transition hover:bg-[var(--brand-sand)]/20 hover:text-[var(--brand-ink)]" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

// ---------- Loading / Error / Empty states ----------
export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--brand-sand)]/35 bg-white p-8 text-center shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-sand)]/50 border-r-[var(--brand-ink)]" />
      <p className="text-sm font-medium text-[var(--brand-wood)]">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && <button className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[var(--brand-sand)]/45 bg-white p-8 text-center shadow-sm">
      <p className="text-base font-semibold text-[var(--brand-ink)]">{title}</p>
      {subtitle && <p className="max-w-md text-sm text-[var(--brand-wood)]/80">{subtitle}</p>}
      {action}
    </div>
  );
}

// ---------- TaskCard ----------
const PRIORITY_BORDER = { low: "border-l-[var(--brand-sand)]", medium: "border-l-[var(--brand-taupe)]", high: "border-l-[var(--brand-wood)]" };

function formatDate(dateString) {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className={`flex flex-col justify-between gap-5 rounded-2xl border border-[var(--brand-sand)]/35 border-l-4 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row ${PRIORITY_BORDER[task.priority]}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge kind="status" value={task.status} />
          <Badge kind="priority" value={task.priority} />
        </div>
        <Link to={`/tasks/${task._id}`} className="mt-3 block text-lg font-semibold text-[var(--brand-ink)] transition hover:text-[var(--brand-wood)]">{task.title}</Link>
        {task.description && <p className="mt-3 line-clamp-3 text-sm text-[var(--brand-wood)]/85">{task.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--brand-wood)]/70">
          <span>Due {formatDate(task.dueDate)}</span>
          {task.attachment && <span className="font-medium text-[var(--brand-wood)]">📎 Attachment</span>}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex gap-2 sm:flex-col sm:items-stretch">
          {onEdit && <button type="button" className="rounded-xl border border-[var(--brand-taupe)] bg-white px-3 py-2 text-sm font-medium text-[var(--brand-ink)] transition hover:bg-[#fff7f1]" onClick={() => onEdit(task)}>Edit</button>}
          {onDelete && <button type="button" className="rounded-xl border border-[var(--brand-wood)]/25 bg-white px-3 py-2 text-sm font-medium text-[var(--brand-wood)] transition hover:bg-[var(--brand-sand)]/18" onClick={() => onDelete(task)}>Delete</button>}
        </div>
      )}
    </div>
  );
}

// ---------- AppShell (sidebar + page layout for logged-in pages) ----------
export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "?";
  const linkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive ? "bg-[var(--brand-sand)]/25 text-[#fff6ef] ring-1 ring-inset ring-[var(--brand-sand)]/35" : "text-[#d6c8be] hover:bg-white/5 hover:text-[#fff6ef]"
    }`;

  return (
    <div className="min-h-screen bg-[#f4ebe3] text-[var(--brand-ink)] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-[var(--brand-wood)]/30 bg-[var(--brand-ink)] text-[#f8f1ea] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-[var(--brand-wood)]/35">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-sand)] text-sm font-semibold text-[var(--brand-ink)] shadow-lg shadow-black/20">▣</span>
          <span className="text-lg font-semibold tracking-wide">Taskline</span>
        </div>
        <nav className="space-y-2 px-4 py-2">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/tasks" className={linkClass}>All tasks</NavLink>
        </nav>
        <div className="mt-auto border-t border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-sand)] text-sm font-semibold text-[var(--brand-ink)]">{initials}</span>
            <div className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{user?.name}</span>
              <span className="block truncate text-xs text-[#d8c5b8]">{user?.email}</span>
            </div>
          </div>
          <button className="mt-4 w-full rounded-xl border border-[var(--brand-sand)]/25 bg-[var(--brand-sand)]/10 px-4 py-2 text-sm font-medium text-[#fff6ef] transition hover:bg-[var(--brand-sand)]/20" onClick={() => { logout(); navigate("/login"); }}>
            Log out
          </button>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

// ---------- ProtectedRoute ----------
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ebe3] px-6 text-sm text-[var(--brand-wood)]">
        <div className="rounded-full border border-[var(--brand-sand)]/40 bg-white px-4 py-2 shadow-sm">Checking session...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
