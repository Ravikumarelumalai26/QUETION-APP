const express = require("express");
const mysql = require("mysql2"); // Use mysql2 for both connection styles
const cors = require("cors");
const multer = require("multer"); // For file uploads
const app = express();
const port = 4000; // Using port 4000 as in the file upload example

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the 'files' directory
app.use("/files", express.static("files"));

// --- MySQL Database Connections ---

// Connection Pool for File Management (pdf_details table)
const fileDbPool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Ravi@1971",
  database: "DEEEP", // Database for file details
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

fileDbPool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL (DEEEP database):", err.message);
    // Optionally exit or handle this more gracefully based on your application's needs
    return;
  }
  console.log("✅ Connected to MySQL database 'DEEEP' (for files)");
  connection.release(); // Release the connection immediately
});

// Single Connection for Student Login (student_login table)
const studentLoginDb = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Ravi@1971",
  database: "student_login", // Database for student login
});

studentLoginDb.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL (student_login database):", err.message);
    process.exit(1); // Exit if the primary login database connection fails
  } else {
    console.log('✅ Connected to MySQL database "student_login" (for login)');
  }
});

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files"); // Store files in the 'files' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// --- API Endpoints ---

// Root API
app.get("/", (req, res) => {
  res.send("Welcome to the Combined API Server!");
});

// --- File Management Endpoints ---

// Upload Files
app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log('📥 Received file upload:', req.file);
  const title = req.body.title;
  const fileName = req.file.filename;

  fileDbPool.query(
    "INSERT INTO pdf_details (title, pdf) VALUES (?, ?)",
    [title, fileName],
    (err, results) => {
      if (err) {
        console.error("❌ Error inserting file data:", err);
        return res.status(500).json({ status: "error", message: "Failed to upload file details" });
      }
      res.send({ status: "ok", message: "File uploaded and details saved" });
    }
  );
});

// Get Files
app.get("/get-files", async (req, res) => {
  fileDbPool.query("SELECT * FROM pdf_details", (err, results) => {
    if (err) {
      console.error("❌ Error fetching file data:", err);
      return res.status(500).json({ status: "error", message: "Failed to retrieve file details" });
    }
    res.send({ status: "ok", data: results });
  });
});

// --- Student Login Endpoint ---

// Login
app.post("/login", async (req, res) => {
  const { register_number, dob } = req.body;

  if (!register_number || !dob) {
    return res.status(400).json({ error: "Register number and DOB are required" });
  }

  console.log("📥 Received login attempt:", { register_number, dob });

  const query = "SELECT * FROM users WHERE register_number = ? AND dob = ?";

  try {
    // Use promise() for cleaner async/await syntax with studentLoginDb
    const [results] = await studentLoginDb.promise().query(query, [register_number, dob]);

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Login successful", user: { register_number: results[0].register_number } });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("❌ Error during login:", error);
    return res.status(500).json({ error: "Failed to process login" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`); // Corrected: Using backticks
});