const User = require("../user/user_model.js");
const TripModel = require("../trips/trip_model.js");
const BlogModel = require("../blogs/blog_model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "!@#$%^&*()";

async function signup(req, res) {
  try {
    const { name, email, password,profilePhoto, College, Job } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      profilePhoto,
      College,
      Job,
      password: hash,
    });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.status(201).json({
      msg: "User registered",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto : user.profilePhoto,
        college: user.College,
        job: user.Job,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const tripsCreated = await TripModel.find({ creator: req.params.id });

    const tripsJoined = await TripModel.find({ participants: req.params.id });

    const blogs = await BlogModel.find({ author_Id: user._id });

    res.json({
      user,
      tripsCreated,
      tripsJoined,
      blogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

module.exports = { signup, login, getUser };
