// The create/edit task form. Used inside a Modal by both TaskList and TaskDetail.
import { useState } from "react";
import { FormField, Button } from "./ui";

export default function TaskForm({ initialData, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "todo",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : "",
    attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState(initialData?.attachment ? initialData.attachment.split("/").pop() : "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: null }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues((v) => ({ ...v, attachment: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!values.title.trim()) newErrors.title = "Give this task a title";
    else if (values.title.trim().length < 3) newErrors.title = "Title should be at least 3 characters";
    if (values.dueDate && Number.isNaN(new Date(values.dueDate).getTime())) newErrors.dueDate = "That date doesn't look valid";

    if (Object.keys(newErrors).length) return setErrors(newErrors);
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField label="Title" name="title" value={values.title} onChange={handleChange} error={errors.title} placeholder="e.g. Wire up JWT middleware" autoFocus />
      <FormField label="Description" name="description" as="textarea" value={values.description} onChange={handleChange} placeholder="Add any extra detail (optional)" />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Status" name="status" as="select" value={values.status} onChange={handleChange}>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </FormField>
        <FormField label="Priority" name="priority" as="select" value={values.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </FormField>
      </div>

      <FormField label="Due date" name="dueDate" type="date" value={values.dueDate} onChange={handleChange} error={errors.dueDate} />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--brand-wood)]" htmlFor="field-attachment">Attachment (optional)</label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--brand-sand)]/55 bg-[#fffaf6] px-4 py-3 text-sm text-[var(--brand-wood)] transition hover:border-[var(--brand-wood)] hover:bg-[#fff4eb]" htmlFor="field-attachment">
          <span>📎</span>
          <span>{fileName || "Choose a file - image, PDF, or Word doc"}</span>
        </label>
        <input id="field-attachment" type="file" onChange={handleFile} accept="image/*,.pdf,.doc,.docx" className="hidden" />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={submitting}>{initialData ? "Save changes" : "Create task"}</Button>
      </div>
    </form>
  );
}
