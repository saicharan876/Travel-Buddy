const mongoose = require("mongoose");
const TripModel = require("./trip_model.js");
const { formatTrip, escapeRegex } = require("./trip_helpers.js");

const DAY_MS = 24 * 60 * 60 * 1000;

function viewerOf(req) {
  return req.user ? req.user.id : null;
}

function readDates(start, end) {
  const startDate = new Date(start);
  if (isNaN(startDate)) {
    return { error: "A valid start date is required" };
  }
  const endDate = end ? new Date(end) : startDate;
  if (isNaN(endDate)) {
    return { error: "End date is not a valid date" };
  }
  if (endDate < startDate) {
    return { error: "End date cannot be before the start date" };
  }
  return { startDate, endDate };
}

async function createTrip(req, res) {
  try {
    const body = req.body;
    const dates = readDates(body.date, body.endDate);
    if (dates.error) {
      return res.status(400).json({ message: dates.error });
    }

    const trip = await TripModel.create({
      destination: body.destination,
      description: body.description,
      location: body.location,
      date: dates.startDate,
      endDate: dates.endDate,
      genderPreference: body.genderPreference || undefined,
      college: body.college,
      blind: body.blind === true,
      creator: req.user.id,
    });

    return res.status(201).json({
      message: "Trip created successfully",
      trip: formatTrip(trip, req.user.id),
    });
  } catch (error) {
    console.error("Error creating trip:", error.message);
    return res.status(500).json({
      message: "Failed to create trip",
      error: error.message,
    });
  }
}

async function getTripById(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const trip = await TripModel.findById(tripId)
      .populate("creator", "name")
      .populate("participants", "name");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json(formatTrip(trip, viewerOf(req)));
  } catch (error) {
    console.error("Error fetching trip:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trip",
      error: error.message,
    });
  }
}

async function sendTripList(req, res, query) {
  const trips = await TripModel.find(query).sort({ date: 1 });
  const viewerId = viewerOf(req);
  return res.status(200).json(trips.map((trip) => formatTrip(trip, viewerId)));
}

async function TripMainPage(req, res) {
  try {
    const { location } = req.query;
    const query = {};
    if (location) {
      query.location = location;
    }
    return await sendTripList(req, res, query);
  } catch (error) {
    console.error("Error fetching trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trips",
      error: error.message,
    });
  }
}

async function TripCollegePage(req, res) {
  try {
    const { college } = req.query;
    const query = {};
    if (college) {
      query.college = college;
    }
    return await sendTripList(req, res, query);
  } catch (error) {
    console.error("Error fetching college trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch college trips",
      error: error.message,
    });
  }
}

async function TripLocationPage(req, res) {
  try {
    const { location } = req.query;
    const query = {};
    if (location) {
      query.location = location;
    }
    return await sendTripList(req, res, query);
  } catch (error) {
    console.error("Error fetching location trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trips by location",
      error: error.message,
    });
  }
}

async function BlindTrips(req, res) {
  try {
    return await sendTripList(req, res, { blind: true });
  } catch (error) {
    console.error("Error fetching blind trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch blind trips",
      error: error.message,
    });
  }
}

async function MatchTrips(req, res) {
  try {
    const { location, start, end, goal } = req.query;
    const dates = readDates(start, end);
    if (dates.error) {
      return res.status(400).json({ message: dates.error });
    }
    const { startDate, endDate } = dates;

    const conditions = [
      { date: { $lte: endDate } },
      {
        $or: [
          { endDate: { $gte: startDate } },
          { endDate: null, date: { $gte: startDate } },
        ],
      },
    ];

    if (location && location.trim()) {
      const place = new RegExp(escapeRegex(location.trim()), "i");
      conditions.push({ $or: [{ location: place }, { destination: place }] });
    }

    if (goal && goal.trim()) {
      conditions.push({ description: new RegExp(escapeRegex(goal.trim()), "i") });
    }

    const trips = await TripModel.find({ $and: conditions });
    const viewerId = viewerOf(req);

    const results = trips.map((trip) => {
      const tripStart = new Date(trip.date);
      const tripEnd = trip.endDate ? new Date(trip.endDate) : tripStart;
      const overlapStart = tripStart > startDate ? tripStart : startDate;
      const overlapEnd = tripEnd < endDate ? tripEnd : endDate;
      const data = formatTrip(trip, viewerId);
      data.overlapDays = Math.floor((overlapEnd - overlapStart) / DAY_MS) + 1;
      return data;
    });

    results.sort((a, b) => {
      if (b.overlapDays !== a.overlapDays) {
        return b.overlapDays - a.overlapDays;
      }
      return new Date(a.date) - new Date(b.date);
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error matching trips:", error.message);
    return res.status(500).json({
      message: "Failed to match trips",
      error: error.message,
    });
  }
}

async function AddParticipate(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const userId = req.user.id;
    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.creator.toString() === userId) {
      return res.status(400).json({ message: "You created this trip, so you are already in it" });
    }

    trip.participants = trip.participants.filter(Boolean);
    const alreadyJoined = trip.participants.some((p) => p.toString() === userId);

    if (alreadyJoined) {
      return res.status(400).json({ message: "User already joined this trip" });
    }

    trip.participants.push(new mongoose.Types.ObjectId(userId));
    await trip.save();

    return res.status(200).json({ message: "Successfully joined the trip" });
  } catch (error) {
    console.error("Error joining trip:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function DeleteTrip(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this trip" });
    }

    await trip.deleteOne();
    return res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error.message);
    return res.status(500).json({
      message: "Failed to delete trip",
      error: error.message,
    });
  }
}

async function LeaveTrip(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const userId = req.user.id;
    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const originalLength = trip.participants.length;
    trip.participants = trip.participants.filter((p) => p && p.toString() !== userId);

    if (trip.participants.length === originalLength) {
      return res.status(403).json({ message: "You are not a participant of this trip" });
    }

    await trip.save();
    return res.status(200).json({ message: "You have left the trip" });
  } catch (error) {
    console.error("Error leaving trip:", error.message);
    return res.status(500).json({ message: "Failed to leave trip", error: error.message });
  }
}

async function editTrip(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const { destination, location, description, college, date, endDate, genderPreference, blind } = req.body;
    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the creator of this trip" });
    }

    const dates = readDates(date || trip.date, endDate || trip.endDate);
    if (dates.error) {
      return res.status(400).json({ message: dates.error });
    }

    trip.destination = destination || trip.destination;
    trip.location = location || trip.location;
    trip.description = description || trip.description;
    trip.college = college || trip.college;
    trip.date = dates.startDate;
    trip.endDate = dates.endDate;
    trip.genderPreference = genderPreference || trip.genderPreference;
    trip.blind = typeof blind === "boolean" ? blind : trip.blind;

    await trip.save();

    return res.status(200).json({ message: "Trip updated successfully", trip: formatTrip(trip, req.user.id) });
  } catch (error) {
    console.error("Error updating trip:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
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
};
