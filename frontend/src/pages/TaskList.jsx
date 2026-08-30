import { useEffect, useState } from "react";
import { getTasksRequest, createTaskRequest, updateTaskRequest, deleteTaskRequest } from "../api";
import { AppShell, TaskCard, Modal, Button, LoadingState, ErrorState, EmptyState } from "../ui";
import TaskForm from "../TaskForm";

const STATUS_OPTIONS = ["all", "todo", "in-progress", "done"];
const STATUS_LABELS = { all: "All", todo: "To do", "in-progress": "In progress", done: "Done" };
const PRIORITY_OPTIONS = ["all", "low", "medium", "high"];

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingTask, setDeletingTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (priorityFilter !== "all") filters.priority = priorityFilter;
      setTasks((await getTasksRequest(filters)).data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load tasks right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter]);

  const openCreateModal = () => { setEditingTask(null); setFormError(""); setIsModalOpen(true); };
  const openEditModal = (task) => { setEditingTask(task); setFormError(""); setIsModalOpen(true); };
  const closeModal = () => { if (!saving) { setIsModalOpen(false); setEditingTask(null); } };

  const handleFormSubmit = async (values) => {
    setSaving(true);
    setFormError("");
    try {
      if (editingTask) {
        const { data } = await updateTaskRequest(editingTask._id, values);
        setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await createTaskRequest(values);
        setTasks((prev) => [data, ...prev]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't save this task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await deleteTaskRequest(deletingTask._id);
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      setDeletingTask(null);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete this task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <header className="flex flex-col gap-4 border-b border-[var(--brand-sand)]/45 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-wood)]">All tasks</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--brand-ink)]">Every task, in one place.</h1>
        </div>
        <Button variant="primary" onClick={openCreateModal}>+ New task</Button>
      </header>

      <div className="mt-6 rounded-2xl border border-[var(--brand-sand)]/35 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--brand-wood)]">Status</span>
            {STATUS_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => setStatusFilter(option)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${statusFilter === option ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white" : "border-[var(--brand-sand)]/35 bg-[#fff8f2] text-[var(--brand-wood)] hover:bg-[#fff1e8]"}`}>
                {STATUS_LABELS[option]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--brand-wood)]">Priority</span>
            {PRIORITY_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => setPriorityFilter(option)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${priorityFilter === option ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white" : "border-[var(--brand-sand)]/35 bg-[#fff8f2] text-[var(--brand-wood)] hover:bg-[#fff1e8]"}`}>
                {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Fetching tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : tasks.length === 0 ? (
        <EmptyState title="Nothing matches these filters" subtitle="Try a different filter, or create a new task." action={<Button variant="outline" onClick={openCreateModal}>+ New task</Button>} />
      ) : (
        <div className="mt-6 grid gap-4">
          {tasks.map((task) => <TaskCard key={task._id} task={task} onEdit={openEditModal} onDelete={setDeletingTask} />)}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? "Edit task" : "New task"}>
        {formError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
        <TaskForm initialData={editingTask} onSubmit={handleFormSubmit} onCancel={closeModal} submitting={saving} />
      </Modal>

      <Modal isOpen={!!deletingTask} onClose={() => !deleting && setDeletingTask(null)} title="Delete task?">
        <p className="text-sm text-[var(--brand-wood)]/85">This will permanently delete <strong>{deletingTask?.title}</strong>. This can't be undone.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeletingTask(null)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete task</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
