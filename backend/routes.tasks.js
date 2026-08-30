// Everything about tasks (CRUD) lives here: route + logic together.
// Every route is protected (must be logged in) and every task is scoped to req.user._id
// so nobody can see or touch another person's tasks.
const express = require("express");
const { Task } = require("./models");
const { protect, upload } = require("./middleware");

const router = express.Router();
router.use(protect); // applies to every route below

// GET /api/tasks?status=&priority=  — list my tasks, optionally filtered
router.get("/", async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch tasks", error: error.message });
  }
});

// GET /api/tasks/:id — one task (must belong to me)
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (String(task.user) !== String(req.user._id)) return res.status(403).json({ message: "Not authorized" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch task", error: error.message });
  }
});

// POST /api/tasks — create a task (attachment is optional, handled by multer)
router.post("/", upload.single("attachment"), async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });

    const task = await Task.create({
      title, description, status, priority,
      dueDate: dueDate || null,
      user: req.user._id,
      attachment: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Could not create task", error: error.message });
  }
});

// PUT /api/tasks/:id — update a task (only the owner can)
router.put("/:id", upload.single("attachment"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (String(task.user) !== String(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    const { title, description, status, priority, dueDate } = req.body;
    Object.assign(task, {
      title: title ?? task.title,
      description: description ?? task.description,
      status: status ?? task.status,
      priority: priority ?? task.priority,
      dueDate: dueDate ?? task.dueDate,
    });
    if (req.file) task.attachment = `/uploads/${req.file.filename}`;

    res.json(await task.save());
  } catch (error) {
    res.status(500).json({ message: "Could not update task", error: error.message });
  }
});

// DELETE /api/tasks/:id — delete a task (only the owner can)
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (String(task.user) !== String(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Could not delete task", error: error.message });
  }
});

module.exports = router;
