import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_ORIGIN, getTaskByIdRequest, updateTaskRequest, deleteTaskRequest } from "../api";
import { AppShell, Badge, Button, Modal, LoadingState, ErrorState } from "../ui";
import TaskForm from "../TaskForm";

const PRIORITY_BORDER = { high: "border-l-[var(--brand-wood)]", medium: "border-l-[var(--brand-taupe)]", low: "border-l-[var(--brand-sand)]" };

function formatFullDate(dateString) {
  if (!dateString) return "No due date set";
  return new Date(dateString).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    setError("");
    try {
      setTask((await getTaskByIdRequest(id)).data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load this task.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleUpdate = async (values) => {
    setSaving(true);
    setFormError("");
    try {
      setTask((await updateTaskRequest(id, values)).data);
      setIsEditOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTaskRequest(id);
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete this task.");
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-wood)] transition hover:text-[var(--brand-ink)]">← Back to all tasks</Link>

      {loading ? (
        <LoadingState label="Fetching task…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTask} />
      ) : task ? (
        <div className={`mt-4 rounded-3xl border border-[var(--brand-sand)]/35 bg-white p-6 shadow-sm border-l-4 ${PRIORITY_BORDER[task.priority]}`}>
          <div className="flex flex-col gap-6 border-b border-[var(--brand-sand)]/35 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-ink)]">{task.title}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge kind="status" value={task.status} />
                <Badge kind="priority" value={task.priority} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => { setFormError(""); setIsEditOpen(true); }}>Edit</Button>
              <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Delete</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
            <div className="space-y-3 rounded-2xl border border-[var(--brand-sand)]/35 bg-[#fff8f2] p-5">
              <h3 className="text-lg font-semibold text-[var(--brand-ink)]">Description</h3>
              <p className="text-sm leading-6 text-[var(--brand-wood)]/85">{task.description || "No description was added for this task."}</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--brand-sand)]/35 bg-[#fff8f2] p-5">
              {[["Due date", task.dueDate], ["Created", task.createdAt], ["Last updated", task.updatedAt]].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-wood)]">{label}</span>
                  <span className="block text-sm text-[var(--brand-ink)]">{formatFullDate(value)}</span>
                </div>
              ))}
              {task.attachment && (
                <div className="space-y-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-wood)]">Attachment</span>
                  <a href={`${API_ORIGIN}${task.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-medium text-[var(--brand-wood)] hover:underline">📎 View attached file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Modal isOpen={isEditOpen} onClose={() => !saving && setIsEditOpen(false)} title="Edit task">
        {formError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
        {task && <TaskForm initialData={task} onSubmit={handleUpdate} onCancel={() => setIsEditOpen(false)} submitting={saving} />}
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => !deleting && setIsDeleteOpen(false)} title="Delete task?">
        <p className="text-sm text-[var(--brand-wood)]/85">This will permanently delete <strong>{task?.title}</strong>. This can't be undone.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete task</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
