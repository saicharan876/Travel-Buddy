const express = require("express");
const router = express.Router();
const {
  createTrip,
  getTripById,
  TripMainPage,
  TripCollegePage,
  TripLocationPage,
  BlindTrips
} = require("./trip_controller");

// Create a new trip
router.post("/create", createTrip);

// Get all trips or by ?location=
router.get("/", TripMainPage);

// Get trips by college
router.get("/college", TripCollegePage);

// Get trips by location
router.get("/location", TripLocationPage);

// Get blind trips
router.get("/blind", BlindTrips);

// Get single trip
router.get("/:id", getTripById);

module.exports = router;
