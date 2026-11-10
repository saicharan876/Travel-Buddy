function idOf(value) {
  if (!value) {
    return null;
  }
  if (value._id) {
    return value._id.toString();
  }
  return value.toString();
}

function isRevealed(trip) {
  return Date.now() >= new Date(trip.date).getTime();
}

function isMember(trip, userId) {
  if (!userId) {
    return false;
  }
  if (idOf(trip.creator) === userId) {
    return true;
  }
  const participants = trip.participants || [];
  return participants.some((p) => idOf(p) === userId);
}

function hidesIdentities(trip) {
  return trip.blind && !isRevealed(trip);
}

function formatTrip(trip, viewerId) {
  const data = trip.toObject ? trip.toObject() : { ...trip };
  data.participants = (data.participants || []).filter(Boolean);

  const creatorId = idOf(data.creator);
  const participantIds = data.participants.map(idOf);

  data.isCreator = !!viewerId && creatorId === viewerId;
  data.isParticipant = !!viewerId && participantIds.includes(viewerId);
  data.participantCount = data.participants.length;
  data.identitiesHidden = false;

  if (hidesIdentities(data) && !data.isCreator) {
    data.creator = null;
    data.participants = [];
    data.identitiesHidden = true;
  }

  return data;
}

function aliasFor(trip, userId) {
  if (idOf(trip.creator) === userId) {
    return "Organizer";
  }
  const participants = trip.participants || [];
  const index = participants.findIndex((p) => idOf(p) === userId);
  if (index === -1) {
    return "Traveler";
  }
  return "Traveler " + (index + 1);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { idOf, isRevealed, isMember, hidesIdentities, formatTrip, aliasFor, escapeRegex };
