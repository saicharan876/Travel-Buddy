const express = require("express");
const router = express.Router();
const { Auth, OptionalAuth } = require("../middleware/auth_middleware");
const {
  createTrip,
  getTripById,
  TripMainPage,
  TripCollegePage,
  TripLocationPage,
  BlindTrips,
  MatchTrips,
  AddParticipate,
  DeleteTrip,
  LeaveTrip,
  editTrip,
} = require("./trip_controller");

router.post("/create", Auth, createTrip);
router.post("/join/:id", Auth, AddParticipate);
router.post("/leave/:id", Auth, LeaveTrip);
router.delete("/delete/:id", Auth, DeleteTrip);
router.put("/edit/:id", Auth, editTrip);

router.get("/", OptionalAuth, TripMainPage);
router.get("/college", OptionalAuth, TripCollegePage);
router.get("/location", OptionalAuth, TripLocationPage);
router.get("/blind", OptionalAuth, BlindTrips);
router.get("/match", OptionalAuth, MatchTrips);
router.get("/:id", OptionalAuth, getTripById);

module.exports = router;
