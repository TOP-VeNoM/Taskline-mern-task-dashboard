// Two middlewares: "protect" checks login, "upload" handles file attachments
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { User } = require("./models");

// Blocks the request unless a valid "Bearer <token>" header is present.
// On success it attaches the logged-in user to req.user.
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User no longer exists" });
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
}

// Saves uploaded files (image/pdf/word doc, max 5MB) into /uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "uploads"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Unsupported file type"), allowed.includes(file.mimetype));
  },
});

module.exports = { protect, upload };
