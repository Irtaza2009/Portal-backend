const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/community-portal";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// User schema and model
const UserSchema = new mongoose.Schema({
  name: String,
  job: String,
  linkedin: String,
  techSkills: String,
  about: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { name, job, linkedin, techSkills, about, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    job,
    linkedin,
    techSkills,
    about,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.json({ message: "User registered successfully" });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error("User not found:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Password does not match for user:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user data (requires authentication)
app.get("/api/users", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, "your_jwt_secret");

  const users = await User.find({}, "-password -email"); // Exclude password and email
  res.json(users);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
