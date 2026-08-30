// All communication with the backend lives in this one file.
import axios from "axios";

export const API_ORIGIN = "http://localhost:5000";

const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

// Attach the saved login token to every outgoing request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("taskline_user");
  if (stored) config.headers.Authorization = `Bearer ${JSON.parse(stored).token}`;
  return config;
});

// If the token is rejected anywhere, log the user out automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("taskline_user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---------- Auth ----------
export const loginRequest = (email, password) => api.post("/auth/login", { email, password });
export const registerRequest = (name, email, password) => api.post("/auth/register", { name, email, password });

// ---------- Tasks ----------
export const getTasksRequest = (filters = {}) => api.get("/tasks", { params: filters });
export const getTaskByIdRequest = (id) => api.get(`/tasks/${id}`);
export const deleteTaskRequest = (id) => api.delete(`/tasks/${id}`);

// Task create/update both send multipart form data (because of the optional file attachment)
function toFormData(task) {
  const fd = new FormData();
  fd.append("title", task.title);
  fd.append("description", task.description || "");
  fd.append("status", task.status || "todo");
  fd.append("priority", task.priority || "medium");
  if (task.dueDate) fd.append("dueDate", task.dueDate);
  if (task.attachment) fd.append("attachment", task.attachment);
  return fd;
}

const fileHeaders = { headers: { "Content-Type": "multipart/form-data" } };
export const createTaskRequest = (task) => api.post("/tasks", toFormData(task), fileHeaders);
export const updateTaskRequest = (id, task) => api.put(`/tasks/${id}`, toFormData(task), fileHeaders);
