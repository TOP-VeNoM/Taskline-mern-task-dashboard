// App entry point: connect to MongoDB, set up Express, mount routes.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then((c) => console.log(`✅ MongoDB connected: ${c.connection.host}`))
  .catch((err) => {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serves uploaded files

app.use("/api/auth", require("./routes.auth"));
app.use("/api/tasks", require("./routes.tasks"));
app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Task Dashboard API is running" }));

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` }));
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message || "Server error" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
