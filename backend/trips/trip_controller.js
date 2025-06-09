const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const TripModel = require("./trip_model.js");

const SECRET = "!@#$%^&*()";

async function createTrip(req, res) {
  try {
    // const token = req.header("Authorization")?.split(" ")[1];
    // if (!token) return res.status(401).json({ message: "Token missing" });

    // const decoded = jwt.verify(token, SECRET);

    const body = req.body;

    const trip = await TripModel.create({
      destination: body.destination,
      description: body.description,
      location: body.location,
      date: body.date,
      genderPreference: body.genderPreference,
      blind: body.blind,
      College: body.College,
      Job: body.Job,
      // creator: decoded.id,
    });

    return res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } 
  catch (error) {
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

    if (trip.blind) {
      return res.status(200).json({
        _id: trip._id,
        destination: trip.destination,
        date: trip.date,
        blind: true,
        description: trip.description,
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

// in user and trip model, add college and location fields

async function TripCollegePage(req, res) {
  try {
    // const { college } = req.query;
    //For Testing purposes, 
    const college = req.body.college;

    const selectedCollege = college || req.user?.college;

    const query = {};
    if (selectedCollege) {
      query.College = selectedCollege;
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

async function TripLocationPage(req, res) {
  try {
    // const { location } = req.query;
    // For Testing purposes,
    const location = req.body.location;

    const selectedLocation = location || req.user?.location;

    const query = {};
    if (selectedLocation) {
      query.location = selectedLocation;
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


module.exports = { createTrip, getTripById, TripMainPage, TripLocationPage, TripCollegePage, BlindTrips };
