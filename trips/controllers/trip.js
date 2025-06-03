const express = require("express");
const mongoose = require("mongoose");
const TripModel = require("../models/trip.js");

async function createTrip(req, res) {
  try {
    const body = req.body;

    const trip = await TripModel.create({
      destination: body.destination,
      description: body.description,
      location: body.location,
      date: body.date,
      genderPreference: body.genderPreference,
      blind: body.blind,
      // creator: body.creator, // Uncomment if you have user authentication
      // participants: body.participants, // Uncomment if you have participants
    });

    // Send back the created trip
    return res.status(201).json({
      message: "Trip created successfully",
      trip,
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
    
        // Validate the trip ID
        if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
        }
    
        const trip = await TripModel.findById(tripId);
    
        if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
        }
    
        return res.status(200).json(trip);
    } catch (error) {
        console.error("Error fetching trip:", error.message);
        return res.status(500).json({
        message: "Failed to fetch trip",
        error: error.message,
        });
    }

}

async function TripMainPage(req, res) {
    try {
        const trips = await TripModel.find({});
        return res.status(200).json(trips);
    } catch (error) {
        console.error("Error fetching trips:", error.message);
        return res.status(500).json({
            message: "Failed to fetch trips",
            error: error.message,
        });
    }
}


module.exports = { createTrip, getTripById , TripMainPage };
