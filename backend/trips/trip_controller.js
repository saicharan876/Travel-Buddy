const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const TripModel = require("./trip_model.js");

const SECRET = "123";

// Create a new trip
async function createTrip(req, res) {
  try {



    const body = req.body;
    const userId = req.user.id;
    const trip = await TripModel.create({
      destination: body.destination,
      description: body.description,
      location: body.location,
      date: body.date,
      genderPreference: body.genderPreference,
      college: body.college,
      blind: body.blind,
      College: body.College,
      Job: body.Job,
      creator: userId,
    });

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

// Get a single trip by ID
async function getTripById(req, res) {
  try {
    const tripId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.blind) {
      return res.status(200).json({
        _id: trip._id,
        destination: trip.destination,
        date: trip.date,
        blind: true,
        description: trip.description,
        college: trip.college,
      });
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

// Route: GET /trip — All Trips or by ?location=XYZ
async function TripMainPage(req, res) {
  try {
    const { location } = req.query;

    const query = {};
    if (location) {
      query.location = location;
    }

    const trips = await TripModel.find(query);
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trips",
      error: error.message,
    });
  }
}

// Route: GET /trip/college?college=XYZ
async function TripCollegePage(req, res) {
  try {
    const { college } = req.query;

    const selectedCollege = college || req.user?.college;

    const query = {};
    if (selectedCollege) {
      query.College = selectedCollege;
    }

    const trips = await TripModel.find(query);
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching college trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch college trips",
      error: error.message,
    });
  }
}

// Route: GET /trip/location?location=XYZ
async function TripLocationPage(req, res) {
  try {
    const { location } = req.query;

    const selectedLocation = location || req.user?.location;

    const query = {};
    if (selectedLocation) {
      query.location = selectedLocation;
    }

    const trips = await TripModel.find(query);
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching location trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch trips by location",
      error: error.message,
    });
  }
}

// Route: GET /trip/blind
async function BlindTrips(req, res) {
  try {
    const blindTrips = await TripModel.find({ blind: true });

    if (!blindTrips || blindTrips.length === 0) {
      return res.status(404).json({ message: "No blind trips found" });
    }

    const tripList = blindTrips.map(trip => ({
      _id: trip._id,
      destination: trip.destination,
      date: trip.date,
      blind: true,
      description: trip.description,
    }));

    return res.status(200).json(tripList);
  } catch (error) {
    console.error("Error fetching blind trips:", error.message);
    return res.status(500).json({
      message: "Failed to fetch blind trips",
      error: error.message,
    });
  }
}

module.exports = {
  createTrip,
  getTripById,
  TripMainPage,
  TripCollegePage,
  TripLocationPage,
  BlindTrips,
};
