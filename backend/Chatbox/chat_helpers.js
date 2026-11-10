const mongoose = require("mongoose");
const TripModel = require("../trips/trip_model.js");
const { idOf, isMember, hidesIdentities, aliasFor } = require("../trips/trip_helpers.js");

async function findTripForMember(tripId, userId) {
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return { error: "Invalid trip ID", status: 400 };
  }
  const trip = await TripModel.findById(tripId);
  if (!trip) {
    return { error: "Trip not found", status: 404 };
  }
  if (!isMember(trip, userId)) {
    return { error: "Only trip members can use this chat", status: 403 };
  }
  return { trip };
}

function senderFor(trip, sender) {
  const senderId = idOf(sender);
  let name = sender && sender.name ? sender.name : "Unknown";
  if (hidesIdentities(trip)) {
    name = aliasFor(trip, senderId);
  }
  return { _id: senderId, name };
}

module.exports = { findTripForMember, senderFor };
