const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/user_model.js");
const TripModel = require("../trips/trip_model.js");
const BlogModel = require("../blogs/blog_model.js");
const { JWT_SECRET, TOKEN_EXPIRY } = require("../config.js");
const { formatTrip, hidesIdentities } = require("../trips/trip_helpers.js");

function makeToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function signup(req, res) {
  try {
    const { name, email, password, profilePhoto, dob } = req.body;
    const college = req.body.college || req.body.College;
    const job = req.body.job || req.body.Job;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      profilePhoto,
      College: college,
      Job: job,
      dob: dob || undefined,
      password: hash,
    });

    res.status(201).json({
      msg: "User registered",
      token: makeToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        college: user.College,
        job: user.Job,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
}

async function getUser(req, res) {
  try {
    const profileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(profileId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const viewerId = req.user.id;
    const isOwnProfile = viewerId === profileId;

    let tripsCreated = await TripModel.find({ creator: profileId });
    let tripsJoined = await TripModel.find({ participants: profileId });
    const blogs = await BlogModel.find({ author_Id: user._id });

    if (!isOwnProfile) {
      tripsCreated = tripsCreated.filter((trip) => !hidesIdentities(trip));
      tripsJoined = tripsJoined.filter((trip) => !hidesIdentities(trip));
    }

    const userData = user.toObject();
    if (!isOwnProfile) {
      delete userData.email;
    }

    res.json({
      user: userData,
      isOwnProfile,
      tripsCreated: tripsCreated.map((trip) => formatTrip(trip, viewerId)),
      tripsJoined: tripsJoined.map((trip) => formatTrip(trip, viewerId)),
      blogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function getUserIdByUsername(req, res) {
  try {
    const user = await User.findOne({ name: req.params.username }).select("_id");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ _id: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function updateProfilePhoto(req, res) {
  try {
    const userId = req.params.id;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "You can only change your own photo" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.profilePhoto = req.body.profilePhoto;
    await user.save();

    res.json({
      msg: "Profile photo updated",
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    res.status(400).json({ error: "Could not update photo", details: err.message });
  }
}

module.exports = { signup, login, getUser, updateProfilePhoto, getUserIdByUsername };
