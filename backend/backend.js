
const express = require("express");
const mysql = require("mysql2/promise"); 
const cors = require("cors");
const multer = require("multer"); // For file uploads
const helmet = require('helmet'); // For security headers

const app = express();
const port = process.env.PORT || 4000; 

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Apply Helmet's default security headers
app.use(helmet());

// Configure Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allows all resources from your own domain by default
      imgSrc: ["'self'", "data:"], // Allows images from your own domain and data URIs (e.g., base64 images, favicon)
      // IMPORTANT: You might need to add more directives here based on what your frontend loads:
      // scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"], // Be cautious with 'unsafe-inline'
      // styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      // fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // connectSrc: ["'self'", "https://api.external.com"], // For API calls to other domains
      // frameSrc: ["'self'"], // For iframes
    },
  })
);

// Serve static files from the 'files' directory
app.use("/files", express.static("files"));

// --- MySQL Database Connections ---
const fileDbPool = mysql.createPool({
  host: "bjhzcivb2ugau5ned4ck-mysql.services.clever-cloud.com",
  user: "unum7fe1d1f61bb6",
  password: "S9tSfdwRkdk8D5JJUs12",
  database: "bjhzcivb2ugau5ned4ck",// Database for file details
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port:'3306',
  timezone: 'Z', // Set timezone to UTC
  dateStrings: true, // Ensure date fields are returned as strings
});

// Test connection to fileDbPool
fileDbPool.getConnection()
  .then(connection => {
    console.log("✅ Connected to MySQL database 'DEEEP' (for files) via pool");
    connection.release(); // Release the connection immediately
  })
  .catch(err => {
    console.error("❌ Error connecting to MySQL (DEEEP database):", err.message);
    // You might want to exit the process or have a fallback here
    process.exit(1);
  });

// Single Connection for Student Login (student_login table)
// Using .createConnection().promise() for direct async/await on the connection object
const studentLoginDb = mysql.createConnection({
 host: 'brvnsnb8eleeladqjsjb-mysql.services.clever-cloud.com',
    user: 'uc182gt51reqgrbq',
    password: '7R6Wk8k2MCqOcxMAe1wa',  
    database: 'brvnsnb8eleeladqjsjb',
    port:'3306',// Database for student login // Database for student login

    // Database for student login
  waitForConnections: true,
});

// Test connection to studentLoginDb
studentLoginDb.then(connection => {
    console.log('✅ Connected to MySQL database "student_login" (for login)');
    // No need to release, as it's a persistent connection object
  })
  .catch(err => {
    console.error("❌ Error connecting to MySQL (student_login database):", err.message);
    process.exit(1); // Exit if the primary login database connection fails
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



// Root API
app.get("/", (req, res) => {
  res.send("Welcome to the Combined API Server!");
});

// --- File Management Endpoints ---

// Upload Files
app.post("/upload-files", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.error("❌ No file received in upload request");
    return res.status(400).json({ status: "error", message: "No file uploaded" });
  }

  console.log('📥 Received file upload:', req.file);
  const title = req.body.title;
  const fileName = req.file.filename;

  try {
    const [results] = await fileDbPool.query(
      "INSERT INTO pdf_details (title, pdf) VALUES (?, ?)",
      [title, fileName]
    );
    res.send({ status: "ok", message: "File uploaded and details saved", insertId: results.insertId });
  } catch (err) {
    console.error("❌ Error inserting file data:", err);
    return res.status(500).json({ status: "error", message: "Failed to upload file details" });
  }
});

// Get Files
app.get("/get-files", async (req, res) => {
  try {
    const [rows] = await fileDbPool.query("SELECT * FROM pdf_details");
    res.send({ status: "ok", data: rows });
  } catch (err) {
    console.error("❌ Error fetching file data:", err);
    return res.status(500).json({ status: "error", message: "Failed to retrieve file details" });
  }
});

// --- Student Login Endpoint ---

// Login
app.post("/login", async (req, res) => {
  const { register_number, dob } = req.body;

  if (!register_number || !dob) {
    console.error("❌ Login attempt: Missing register number or DOB");
    return res.status(400).json({ status: "error", message: "Register number and DOB are required" });
  }

  console.log("📥 Received login attempt:", { register_number, dob });

  const query = "SELECT * FROM users WHERE register_number = ? AND dob = ?";

  try {
    // Await the promise returned by the query
    const [results] = await (await studentLoginDb).query(query, [register_number, dob]);

    if (results.length > 0) {
      return res
        .status(200)
        .json({ status: "ok", message: "Login successful", user: { register_number: results[0].register_number } });
    } else {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("❌ Error during login:", error);
    return res.status(500).json({ status: "error", message: "Failed to process login" });
  }
});
// Serve static files from the 'files' directory
app.use("/files", express.static("files"));

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
