const mongoose = require("mongoose");

// User schema and model
const UserSchema = new mongoose.Schema({
  name: String,
  job: String,
  linkedin: String,
  techSkills: String,
  about: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
