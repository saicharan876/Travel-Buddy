const express = require('express');
const { createTrip,getTripById,TripMainPage,TripCollegePage,TripLocationPage,BlindTrips} = require('./trip_controller.js');
const {Auth} =require('../middleware/auth_middleware.js');

const router = express.Router();

// Create a new trip
// router.post('/create',Auth,createTrip);
//For Testing purposes, you can remove this later
router.post('/create',createTrip);
router.get('/',TripMainPage);
router.get('/:id',getTripById);
// router.get('/college', TripCollegePage);
// router.get('/location', TripLocationPage);
// router.get('/blind', BlindTrips);
router.post('/college', TripCollegePage);
router.post('/location', TripLocationPage);
router.post('/blind', BlindTrips);


module.exports = router;
