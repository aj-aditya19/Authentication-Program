import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { execFile } from "child_process";
import dotenv from "dotenv";
import mongoose from "mongoose";
import mysql from "mysql2";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

dotenv.config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));


// SQL connection---------------------start
dotenv.config();
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database Failed to connect due to : ", err.message);
  } else {
    console.log("Database connected");
  }
});
//SQL connection---------------------end

//mongoose connection---------------------start
// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// // ✅ Create Schema & Model
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   phone: String,
//   password: String,
// });
// const User_of_Mongoose = process.env.MONGOOSE_USER;
// const User = mongoose.model("User", userSchema, User_of_Mongoose);
// Mongoose connection---------------------end

// For Session login---------------------start
app.use(
  session({
    secret: "secret_key", // Anything
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 1000, // 1 minute
      secure: false,
    },
  })
);
// For Session login---------------------end

// Serve main page---------------------start
app.get("/", (req, res) =>
{
  if (req.session.user) // if already login then it directs opens page.html
  {
    return res.redirect("/page.html");
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

// Login logic---------------------start
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // MySQL code for database and table using promise ( async and await )---------------------start
  try
  {
    const [rows] = await pool.promise().execute( "SELECT * FROM try1 WHERE email = ? AND password = ? LIMIT 1", [email, password] );

    if (rows.length > 0)
    {
      // session for login---------------------start
      req.session.user =
      {
        email: rows[0].email,
        name: rows[0].name,
      };
      // session for login---------------------end
      return res.redirect("/page.html");
    }
    else
    {
      console.log("❌ Invalid credentials");
      return res.status(401).json({ message: "Invalid email or password" });
    }
  }
  catch (err)
  {
    console.error("Error in Login:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  // MySQL code for database and table using promise ( async and await )---------------------end

  // Mongoose code for database and table using promise ( async and await )---------------------start
  //   try {
  //     const user = await User.findOne({ email, password }); // ✅ use await
  //     console.log("User found: ",user);

  //     if (user) {
  //       console.log("✅ Login successful:", user.email);
  //       req.session.user = {
          //   password: rows[0].password, // or your user_id column
          //   email: rows[0].email,
          //   name: rows[0].name,
          // };
          // console.log("Session created:", req.session.user);
  //       return res.redirect("/page.html");
  //     } else {
  //       console.log("❌ Invalid credentials");
  //       return res.status(401).json({ message: "Invalid email or password" });
  //     }
  //   } catch (err) {
  //     console.error("Login error:", err);
  //     return res.status(500).json({ message: "Server error" });
  // }
  // Mongoose code for database and table using promise ( async and await )---------------------end

});
// Login logic---------------------end

let Whatsapp_otp;     // to verify otp from whatsapp
let email_otp;        // to verify otp from mail

// ✅ REGISTER route (direct form submission)
app.post("/register", async (req, res) => {
  const { name, email, phone, password, og_otp, method } = req.body;
  // Whatsapp is currently unavialable--------------start
  // if(Whatsapp_otp==og_otp || email_otp==og_otp)
  // {
  // console.log("User verified");
  // const query1 = "INSERT INTO TRY1(email,phone,name,password) values (?,?,?,?);";
  // pool.execute(query1,[email,phone,name,password],(err,results)=>{
  //   if(err)
  //   {
  //     console.log("Error occured by adding newuser");
  //     return res.status(200).json({message:"Database error"});
  //   }
  //   if(results.affectedRows>0)
  //   {
  //     res.sendFile(path.join(__dirname,"/page.html"));
  //   }
  //   else
  //   {
  //     return res.status(400).json({message:"falied to insert user"});
  //   }
  // })
  // console.log("🆕 New registration:", { name, email, phone, password, method });
  try {
    // ✅ Step 1: Verify OTP first
    if (Whatsapp_otp === og_otp || email_otp === og_otp) {
      console.log("✅ User verified via OTP");

      // ✅ Step 2: Insert new user into MySQL
      const [result] = await pool.promise().execute(
        "INSERT INTO try1 (name, email, phone, password) VALUES (?, ?, ?, ?)",
        [name, email, phone, password]
      );

      if (result.affectedRows > 0) {
        console.log("🆕 User registered successfully:", email);
        req.session.user = { email, name, phone };
        console.log("Session created:", req.session.user);
        return res.sendFile(path.join(__dirname, "page.html"));
      } else {
        console.log("❌ Failed to insert user");
        return res.status(400).json({ message: "Failed to register user" });
      }
    } else {
      console.log("❌ Invalid OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Database error" });
  }

  //   try {
  //     const newUser = await new User({ name, email, phone, password });
  //     newUser.save(); // ✅ use await for MongoDB save

  //     console.log("🆕 User registered:", newUser.email);
  //     return res.sendFile(path.join(__dirname, "page.html"));
  //   } catch (err) {
  //     console.error("Registration error:", err.message);
  //     if (err.code === 11000)
  //       return res.status(400).json({ message: "Email already registered" });
  //     return res.status(500).json({ message: "Database error" });
  //   }
  // } else {
  //   return res.status(400).json({ message: "Invalid OTP" });
});

app.get("/page.html", (req, res, next) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "page.html"));
  } else {
    res.redirect("/");
  }
});

app.get("/userdata", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const userId = req.session.user.email;

    // Fetch user name by ID
    const [rows] = await pool.promise().execute(
      "SELECT name FROM try1 WHERE email = ?",
      [userId]
    );

    if (rows.length > 0) {
      return res.json(rows[0]); // send { name: 'Adi' }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/send_otp", (req, res) => {
  const { phone, email, method } = req.body;
  console.log("Method:", method);

  if (method === "Whatsapp") {
    console.log("Phone number: ", phone);
    execFile(
      "python",
      ["send_whatsapp_otp.py", phone],
      (err, stdout, stderr) => {
        console.log("in pytho call function");
        if (err) return res.json({ success: false });
        const out = JSON.parse(stdout);
        console.log("OUT: ", out);
        Whatsapp_otp = out.otp;
        if (out.otp === -1) return res.json({ success: false });
        return res.json({ success: true });
      }
    );
  } else {
    console.log("Sending via Email...");

    execFile("python", ["send_email.py", email], (error, stdout, stderr) => {
      if (error) {
        console.error("Python error:", error);
        return res.json({ success: false });
      }

      const out = JSON.parse(stdout);
      const pythonOtp = out.otp;
      email_otp = pythonOtp;
      console.log("OTP from Python:", pythonOtp);

      if (pythonOtp === -1) {
        return res.json({ success: false });
      } else {
        return res.json({ success: true });
      }
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});