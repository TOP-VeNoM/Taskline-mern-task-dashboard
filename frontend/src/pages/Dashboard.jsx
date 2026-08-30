import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { getTasksRequest } from "../api";
import { AppShell, TaskCard, Button, LoadingState, ErrorState, EmptyState } from "../ui";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      setTasks((await getTasksRequest()).data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your tasks right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppShell>
      <header className="flex flex-col gap-4 border-b border-[var(--brand-sand)]/45 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-wood)]">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--brand-ink)]">Hey {firstName}, here's where things stand.</h1>
        </div>
        <Button variant="primary" onClick={() => navigate("/tasks")}>+ New task</Button>
      </header>

      {loading ? (
        <LoadingState label="Pulling your tasks…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[["Total tasks", counts.total, "bg-white"], ["To do", counts.todo, "bg-[#fff8f2]"], ["In progress", counts.inProgress, "bg-[#fff8f2]"], ["Done", counts.done, "bg-[#fff8f2]"]].map(([label, value, bg]) => (
              <div key={label} className={`rounded-2xl border border-[var(--brand-sand)]/35 ${bg} p-5 shadow-sm`}>
                <span className="block text-3xl font-semibold text-[var(--brand-ink)]">{value}</span>
                <span className="mt-1 block text-sm text-[var(--brand-wood)]/75">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-[var(--brand-ink)]">Recent tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-[var(--brand-wood)] hover:underline">View all →</Link>
          </div>

          {recentTasks.length === 0 ? (
            <EmptyState title="No tasks yet" subtitle="Create your first task to see it show up here." action={<Button variant="outline" onClick={() => navigate("/tasks")}>Go to task list</Button>} />
          ) : (
            <div className="mt-6 grid gap-4">
              {recentTasks.map((task) => <TaskCard key={task._id} task={task} />)}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
