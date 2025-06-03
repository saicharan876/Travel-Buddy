const express = require('express');
const { createTrip,getTripById,TripMainPage} = require('../controllers/trip.js');

const router = express.Router();

// Create a new trip
router.post('/create', createTrip);
router.get('/', TripMainPage);
router.get('/:id',getTripById);



module.exports = router;
